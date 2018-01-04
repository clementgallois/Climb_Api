// app/models/like.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var conversationSchema = mongoose.Schema({
  participant1 : {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
      },
  participant2: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
      },
});
var autoPopulate = function(next) {
  this.populate('participant1', '-local');
  this.populate('participant2', '-local');
  next();
};

conversationSchema.
  pre('findOne', autoPopulate).
  pre('find', autoPopulate);

// create the model for users and expose it to our app
module.exports = mongoose.model('Conversation', conversationSchema);
