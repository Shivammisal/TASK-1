import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Connect to the backend Socket.IO server
const socket = io.connect('http://localhost:5000');

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      setMessageList((prev) => [...prev, data]);
    });
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const messageData = {
        user: 'User1', // Replace with dynamic username if needed
        content: message,
      };

      // Emit the message to the backend
      socket.emit('send_message', messageData);
      setMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messageList.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.user}: </strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
