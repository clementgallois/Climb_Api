// app/models/like.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var commentSchema = mongoose.Schema({
  userId : {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
      },
  videoId: {
        	type: mongoose.Schema.Types.ObjectId,
        	ref: 'Video'
    	},
  text : String,
  createdAt : Date
});
var autoPopulate = function(next) {
  this.populate('userId', '-local');
  next();
};

commentSchema.
  pre('findOne', autoPopulate).
  pre('find', autoPopulate);

// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentSchema);
