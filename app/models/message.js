// app/models/like.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var messageSchema = mongoose.Schema({
	  conversationId : {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Conversation'
      },
  senderId : {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
      },
  date : Date,
  message: String
});
var autoPopulate = function(next) {
  this.populate('senderId', '-local');
  next();
};

messageSchema.
  pre('findOne', autoPopulate).
  pre('find', autoPopulate);

// create the model for users and expose it to our app
module.exports = mongoose.model('message', messageSchema);
