const User = require('../../models/user.js');
const async = require('async');
const Video = require('../../models/video.js');
var mongoose = require('mongoose');
const isTokenValid = require('../../middlewares.js').isTokenValid;



const searchApiRoutes = (app) => {

  app.post('/api/search', isTokenValid, (req, res) => {
    User.find({'profile.username': {$regex : req.body.search, "$options": "-i"}}).exec((err, users) => {
      if (err) console.log(err);
      Video.find({'title': {$regex : req.body.search, "$options": "-i"}}).exec((err, videos) => {
        if (err) console.log(err);
        console.log(res.json({users, videos}));
      });
    });
  });

}

module.exports = searchApiRoutes;
