// const express = require('express')
// const connectDB = require('./config/connectDB')
// const router = require('./routes/index')
// const cors = require('cors')
// const cookiesParser= require('cookie-parser')


// require('dotenv').config()
// const app = express();
// app.use(cors({
//     origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow both origins
//     credentials: true
// }));

// app.use(express.json())
// app.use(cookiesParser())

// const PORT = process.env.PORT || 8080


// app.get('/',(request,response)=>{
//     response.json({
//         message:"server is running at" + PORT
//     })
// })

// //api endpoints
// app.use('/api',router)
// connectDB().then(()=>{
//     app.listen(PORT,()=>{
//     console.log("Server runnning at", PORT);   
// })
// })

const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const UserModel = require('./models/UserModel');
const { conversationModel, messageModel } = require('./models/ConversationModel');
const getConversation = require('./helpers/getConversation');
const getUserDetailFromToken = require('./helpers/getUserDetailFromToken');

require('dotenv').config();

// Log to verify models are imported
console.log('ConversationModel:', conversationModel);
console.log('MessageModel:', messageModel);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// API endpoints
app.use('/api', router);

// Root route
app.get('/', (request, response) => {
  response.json({
    message: `Server is running at port ${PORT}`,
  });
});

// Online user tracking
const onlineUser = new Set();

io.on('connection', async (socket) => {
  console.log('Connect User', socket.id);

  const token = socket.handshake.auth.token;
  const user = await getUserDetailFromToken(token);

  if (user?._id) {
    socket.join(user._id.toString());
    onlineUser.add(user._id.toString());
    io.emit('onlineUser', Array.from(onlineUser));
  }

 socket.on('message-page', async (userId) => {
  console.log('userId', userId);
  try {
    if (!mongoose.isValidObjectId(userId)) {
      socket.emit('error', { message: 'Invalid userId' });
      return;
    }
    const userDetails = await UserModel.findById(userId).select('-password');
    if (!userDetails) {
      socket.emit('error', { message: 'User not found' });
      return;
    }
    const payload = {
      _id: userDetails._id,
      name: userDetails.name,
      email: userDetails.email,
      profile_pic: userDetails.profile_pic,
      online: onlineUser.has(userId),
    };
    socket.emit('message-user', payload);

    if (!conversationModel) {
      throw new Error('ConversationModel is undefined');
    }

    const getConversationMessage = await conversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    })
      .populate('messages')
      .sort({ updatedAt: -1 });

    socket.emit('message', getConversationMessage?.messages || []);
  } catch (error) {
    console.error('Error in message-page:', error);
    socket.emit('error', { message: 'Failed to fetch messages' });
  }
});

  socket.on('new message', async (data) => {
    try {
      if (!conversationModel || !messageModel) {
        throw new Error('ConversationModel or MessageModel is undefined');
      }

      let conversation = await conversationModel.findOne({
        $or: [
          { sender: data?.sender, receiver: data?.receiver },
          { sender: data?.receiver, receiver: data?.sender },
        ],
      });

      if (!conversation) {
        const createConversation = new conversationModel({
          sender: data?.sender,
          receiver: data?.receiver,
        });
        conversation = await createConversation.save();
      }

      const message = new messageModel({
        text: data.text,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        msgByUserId: data?.msgByUserId,
      });
      const saveMessage = await message.save();

      await conversationModel.updateOne(
        { _id: conversation._id },
        { $push: { messages: saveMessage._id } }
      );

      const getConversationMessage = await conversationModel.findOne({
        $or: [
          { sender: data?.sender, receiver: data?.receiver },
          { sender: data?.receiver, receiver: data?.sender },
        ],
      })
        .populate('messages')
        .sort({ updatedAt: -1 });

      io.to(data?.sender).emit('message', getConversationMessage?.messages || []);
      io.to(data?.receiver).emit('message', getConversationMessage?.messages || []);

      const conversationSender = await getConversation(data?.sender);
      const conversationReceiver = await getConversation(data?.receiver);

      io.to(data?.sender).emit('conversation', conversationSender);
      io.to(data?.receiver).emit('conversation', conversationReceiver);
    } catch (error) {
      console.error('Error in new message:', error.message);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

 socket.on('sidebar', async (currentUserId) => {
  console.log('Current user', currentUserId);
  try {
    if (!mongoose.isValidObjectId(currentUserId)) {
      socket.emit('error', { message: 'Invalid currentUserId' });
      return;
    }
    if (!conversationModel) {
      throw new Error('ConversationModel is undefined');
    }
    const conversation = await getConversation(currentUserId);
    socket.emit('conversation', conversation);
  } catch (error) {
    console.error('Error in sidebar:', error);
    socket.emit('error', { message: 'Failed to fetch conversations' });
  }
});

  socket.on('seen', async (msgByUserId) => {
  try {
    if (!mongoose.isValidObjectId(msgByUserId)) {
      socket.emit('error', { message: 'Invalid msgByUserId' });
      return;
    }
    if (!conversationModel || !messageModel) {
      throw new Error('ConversationModel or MessageModel is undefined');
    }

    let conversation = await conversationModel.findOne({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id },
      ],
    });

    const conversationMessageId = conversation?.messages || [];

    await messageModel.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { seen: true } }
    );

    const conversationSender = await getConversation(user?._id?.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(user?._id?.toString()).emit('conversation', conversationSender);
    io.to(msgByUserId).emit('conversation', conversationReceiver);
  } catch (error) {
    console.error('Error in seen:', error);
    socket.emit('error', { message: 'Failed to mark messages as seen' });
  }
});

  socket.on('disconnect', () => {
    if (user?._id) {
      onlineUser.delete(user._id.toString());
      io.emit('onlineUser', Array.from(onlineUser));
      console.log('Disconnect user', socket.id);
    }
  });
});

// Start the server after connecting to the database
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  });

module.exports = { app, server, io };