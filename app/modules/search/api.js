const User = require('../../models/user.js');
const async = require('async');
var mongoose = require('mongoose');
const isTokenValid = require('../../middlewares.js').isTokenValid;



const searchApiRoutes = (app) => {

  app.post('/api/search', isTokenValid, (req, res) => {
    User.find({'profile.username': {$regex : req.body.search, "$options": "-i"}}).exec((err, users) => {
      if (err) console.log(err);
      return res.json({
        users
      })
    });
  });

}

module.exports = searchApiRoutes;
