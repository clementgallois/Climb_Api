const async = require('async');

const User = require('../../models/user.js');
const isTokenValid = require('../../middlewares.js').isTokenValid;
const Message = require('../../models/message.js');
const Conversation = require('../../models/conversation.js');

var mongoose = require('mongoose');

const chatApiRoutes = (app, io) => {

io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
  socket.on('save-message', function (data) {
    console.log(data);
    io.emit('new-message', { message: data });
  });
});

app.get('/api/chat/', isTokenValid, (req, res) => {
  Conversation.find({"$or" :[{participant1: req.user.id}, {participant2: req.user.id}]}).then((conv) =>{
    res.json(conv);
  });
});

app.get('/api/chat/:convId', isTokenValid, (req, res) => {
  Conversation.findOne({ "_id": req.params.convId }).then((conv) => {
      if (!conv) {
        throw 'Conversation does not exist';
      } else return conv;
    }).then((conv) => {
      Message.find({conversationId: conv._id}).exec((err, messages) => {
        res.json({success: true, messages: messages});
      });
    }).catch((err) => {
      res.json({success: false, message: err});
    });
});

/* SAVE CHAT */
app.post('/api/chat/', isTokenValid, (req, res) => {
  console.log('tu es entré')
  Conversation.findOne({"$or":[{participant1: req.body.sendTo, participant2: req.user.id}, {participant1: req.user.id, participant2: req.body.sendTo}]}).then((conv) => {
        if (!conv) {
          let newConv = new Conversation();
          newConv.participant1 = req.user.id;
          newConv.participant2 = req.body.sendTo;
          return newConv.save();
        }
        return conv
      }).then((conv) => {
        console.log(conv)
        let newMessage = new Message();
        newMessage.conversationId = conv._id;
        newMessage.senderId = req.user.id;
        newMessage.message = req.body.message;
        newMessage.date = new Date();
        return newMessage.save()
      }).then((model) => {
        res.json({success: true, message: 'Message Successfully sent', missa: model});
    }).catch((err) => {
      res.json({success: false, message: err});
    });
  });

};

module.exports = chatApiRoutes;
