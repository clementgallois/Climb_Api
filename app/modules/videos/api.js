const async = require('async');

const User = require('../../models/user.js');
const Video = require('../../models/video.js');
const Follower = require('../../models/follower.js');
const Like = require('../../models/like.js');
const Comment = require('../../models/comment.js');


const isTokenValid = require('../../middlewares.js').isTokenValid;
const upload = require('../../middlewares.js').upload.single('video');


var mongoose = require('mongoose');
//ffmpeg for thumbnails
//var ffmpeg = require('fluent-ffmpeg');


const findUserData = (video, users) => {
  for (let i = 0; i < users.length; i++) {
    if (video.ownerId == users[i]._id) {
      return {username : users[i].profile.username, profilePicture : users[i].profile.pictureUrl};
    }
  }
  return {};
}

const videosApiRoutes = (app) => {

  app.get('/api/videos/trending', isTokenValid, (req, res) => {
    //res.json(req.user);
  });

  app.get('/api/videos/feed', isTokenValid, (req, res) => {
    async.waterfall([
      (cb) => {
        Follower.find({followerId : req.user.id}).select('userId').exec((err, followers) => {
          if (err) return cb(err);
          cb(null, followers);
        });
      },
      (followers, cb) => {
        const tab = followers.map(e => e.userId);
        User.find({_id : { $in : followers.length > 0 ? tab : followers}}).select('profile.pictureUrl profile.username _id').exec((err, users) => {
          if (err) return cb(err);
          cb(null, users, tab, followers);
        });
      },
      (users, tab, followers, cb) => {
        let feedVideosUsers = users;
        let usersId = followers.length > 0 ? tab : followers;
        usersId.push(req.user.id);
        console.log(usersId);
        feedVideosUsers.push({profile: {username : req.user.username, pictureUrl : req.user.pictureUrl}, _id: req.user.id});
        Video.find({ownerId : { $in : usersId}}).limit(20).sort('-createdAt').exec((err, videos) => {
            if (err) return cb(err);
            cb(null, videos);
          });
      },
      (videos, cb) => {
        async.map(videos, (video, callback) => {
          Like.find({videoId: video._id}).exec((err, likes) => {
            if (err) return callback(err);
            var userVideo = video.toObject();
            userVideo.likes = likes.length;
            Like.findOne({userId: req.user.id, videoId: video._id}).exec((err, like) => {
              if (err) return callback(err);
              userVideo.isLiked = like ? true : false;
              callback(null, userVideo);
            });

          });
        }, (err, results) => {
          if (err) return cb(err);
          cb(null, results);
        });
      }

    ], (err, results) => {
      if (err) return res.json({success : false, message : 'No videos found'});

      res.json({success : true, videos : results});
    });


  });

  app.get('/api/video/:videoId', isTokenValid, (req, res) => {
    const videoId = req.params.videoId || '';

    Video.findOne({ "_id": req.params.videoId }).then((video) => {
      if (!video) {
        throw 'video does not exist';
      } else return video;
    }).then((video) => {
      Comment.find({videoId: video._id}).exec((err, comments) => {
        Like.find({videoId: video._id}).exec((err, likes) => {
          if (err) return;
          var userVideo = video.toObject();
          userVideo.likes = likes.length;
          Like.findOne({userId: req.user.id, videoId: video._id}).exec((err, like) => {
            if (err) return callback(err);
            userVideo.isLiked = like ? true : false;
            res.json({success: true, comments: comments, video:userVideo});
          });

        });
      });
    }).catch((err) => {
      res.json({success: false, message: err});
    });
  });

  app.post('/api/videos/:videoId/like', isTokenValid, (req, res) => {
    const videoId = req.params.videoId || '';

    Video.findOne({_id: videoId}).then((video) => {
      if (!video) {
        throw 'Video does not exist';
      } else return video;
    }).then((video) => {
      Like.findOne({videoId: video._id, userId: req.user.id}).exec((err, like) => {
        if (!like) {
          let newLike = new Like();
          newLike.userId = req.user.id;
          newLike.videoId = videoId;
          newLike.createdAt = new Date();
          return newLike.save();
        }
        throw 'Video is already liked';
      });
    }).then((model) => {
        res.json({success: true, message: 'Successfully liked'});
    }).catch((err) => {
      res.json({success: false, message: err});
    });
  });

// Comments
  app.post('/api/videos/:videoId/comment', isTokenValid, (req, res) => {
    const videoId = req.params.videoId || '';

    Video.findOne({_id: videoId}).then((video) => {
      if (!video) {
        throw 'Video does not exist';
      } else return video;
    }).then((video) => {
        console.log(req)
        console.log(req.user)
        console.log(req.content)
        if (req.user.id && req.body.commentText){
          let newComment = new Comment();
          newComment.userId = req.user.id;
          newComment.videoId = videoId;
          newComment.text = req.body.commentText;
          newComment.createdAt = new Date();
          return newComment.save();
        }
        else
          throw 'invalid request'

    }).then((model) => {
        res.json({success: true, message: 'Successfully commented'});
    }).catch((err) => {
      res.json({success: false, message: err});
    });
  });

  app.get('/api/videos/:videoId/comment', isTokenValid, (req, res) => {
    const videoId = req.params.videoId || '';

    Comment.aggregate([
        {"$match": {"videoId": {"$eq": mongoose.Types.ObjectId(req.params.videoId)} } },
         { "$lookup": {
              "from": "users",
              "localField": "userId",
              "foreignField": "_id",
              "as": "user"
         }},
         { "$unwind": { "path" : "$user" } },
          { "$project": {
               "_id": false,
               "count": true,
               "userId" : "$user._id",
               "username" : "$user.profile.username",
               "pictureUrl": "$user.profile.pictureUrl",
               "commentText": "$text"

           }},

    ],
    function(err,results) {
        if (err) return res.json({success: false, message: err});
        return res.json({success : true, comments : results});
      }
    );
  });

  app.post('/api/videos/upload', isTokenValid, (req, res) => {

    upload(req, res, (err) => {

      if(req.fileValidationError) {
              return res.json({success: false, message: req.fileValidationError});
        }
      if(err) {
        console.log('Error Occured While uploading');
        console.log(err);
        return;
      }
      var newVideo = Video();
      if (req.file == undefined)
        return res.json({success: false, message: "no file suplied"});
      newVideo.title = req.body.title || '';
      newVideo.description = req.body.description ||'';
      newVideo.ownerId = req.user.id;
      newVideo.owner = req.user.id;
      newVideo.category = req.body.category || 'undefined';
      newVideo.thumbnailUrl = req.body.thumbnailUrl || '';
      newVideo.url = req.file.location;
      newVideo.createdAt = Date.now();
      newVideo.updatedAt = Date.now();
      newVideo.save((err, data) => {
        if (err)
          throw err;
        res.json({success: true, video: newVideo});
      });
    });
  });

  app.delete('/api/videos/:videoId/like', isTokenValid, (req, res) => {
    const videoId = req.params.videoId || '';

    Video.findOne({_id: videoId}).then((video) => {
      if (!video) {
        throw 'Video does not exist';
      } else return video;
    }).then((video) => {
      Like.findOne({videoId: video._id, userId: req.user.id}).exec((err, like) => {
        if (like) {
          return like.remove();
        }
        throw 'Video is not liked';
      });
    }).then((model) => {
        res.json({success: true, message: 'Successfully disliked'});
    }).catch((err) => {
      res.json({success: false, message: err});
    });
  });
};

module.exports = videosApiRoutes;
