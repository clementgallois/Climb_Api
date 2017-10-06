// app/models/like.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var likeSchema = mongoose.Schema({

  userId : {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
      },
  videoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Video'
      },
  createdAt : Date

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Like', likeSchema);
