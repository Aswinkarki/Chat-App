// import React, { useEffect, useState } from 'react';
// import socket from '../componenets/Socket';

// const ChatPage = ({ currentUserId, chattingWithUserId }) => {
//   const [messages, setMessages] = useState([]);
//   const [messageText, setMessageText] = useState('');
//   const [conversations, setConversations] = useState([]);

//   useEffect(() => {
//     // Join and fetch messages
//     socket.emit('message-page', chattingWithUserId);

//     socket.on('message-user', (user) => {
//       console.log('Chatting with:', user);
//     });

//     socket.on('message', (msgs) => {
//       setMessages(msgs);
//     });

//     socket.on('conversation', (data) => {
//       setConversations(data);
//     });

//     socket.on('onlineUser', (onlineUsers) => {
//       console.log("Online:", onlineUsers);
//     });

//     return () => {
//       socket.off('message-user');
//       socket.off('message');
//       socket.off('conversation');
//       socket.off('onlineUser');
//     };
//   }, [chattingWithUserId]);

//   const sendMessage = () => {
//     const data = {
//       sender: currentUserId,
//       receiver: chattingWithUserId,
//       text: messageText,
//       msgByUserId: currentUserId
//     };
//     socket.emit('new message', data);
//     setMessageText('');
//   };

//   return (
//     <div>
//       <h2>Chat Messages</h2>
//       <div>
//         {messages.map((msg, i) => (
//           <p key={i}>
//             <strong>{msg.msgByUserId === currentUserId ? 'You' : 'Them'}:</strong> {msg.text}
//           </p>
//         ))}
//       </div>
//       <input
//         value={messageText}
//         onChange={(e) => setMessageText(e.target.value)}
//         placeholder="Type a message"
//       />
//       <button onClick={sendMessage}>Send</button>
//     </div>
//   );
// };

// export default ChatPage;
