const async = require('async');

const User = require('../../models/user.js');
const Video = require('../../models/video.js');
const Follower = require('../../models/follower.js');
const Like = require('../../models/like.js');


const isTokenValid = require('../../middlewares.js').isTokenValid;

const rankingApiRoutes = (app) => {

  app.get('/api/ranking/likes', isTokenValid, (req, res) => {
    Like.aggregate([
        { "$lookup": {
             "from": "videos",
             "localField": "videoId",
             "foreignField": "_id",
             "as": "video"
        }},
        { "$unwind": { "path" : "$video" } },

        { "$sortByCount": "$video.ownerId"},
         { "$lookup": {
              "from": "users",
              "localField": "_id",
              "foreignField": "_id",
              "as": "user"
         }},
         { "$unwind": { "path" : "$user" } },
          { "$project": {
               "_id": false,
               "count": true,
               "username" : "$user.profile.username",
               "pictureUrl": "$user.profile.pictureUrl"

           }},

    ],
    function(err,results) {
        if (err) return res.json({success: false, message: err});
        return res.json({success : true, likes : results});
      }
    );

  });


};

module.exports = rankingApiRoutes;
