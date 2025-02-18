import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Connect to the backend (replace with your backend address)
const socket = io('http://localhost:4000'); // Ensure the backend is running at this address

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [sender, setSender] = useState('User1'); // Example sender name
  const [showDelete, setShowDelete] = useState(null); // Track which message's delete button to show

  // Listen for incoming messages
  useEffect(() => {
    socket.on('receive_message', (data) => {
      console.log('Received message:', data); // Debugging: Log received message
      setMessages((prev) => {
        const updatedMessages = [...prev, data];
        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    });

    return () => {
      socket.off('receive_message');
    };
  }, []);

  // Handle sending message
  const sendMessage = () => {
    if (message.trim() === '') return;
    const messageData = {
      sender: sender,
      message: message,
      timestamp: new Date().toLocaleTimeString(), // Add timestamp for message
    };
    console.log('Sending message:', messageData); // Debugging: Log sent message

    // Update messages state to show the sent message immediately
    setMessages((prev) => {
      const updatedMessages = [...prev, messageData];
      localStorage.setItem('messages', JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    // Emit the message to the server
    socket.emit('send_message', messageData);
    setMessage(''); // Clear the input after sending
  };

  // Handle deleting a message
  const deleteMessage = (index) => {
    const updatedMessages = messages.filter((_, msgIndex) => msgIndex !== index);
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };

  // Handle double click on message
  const handleDoubleClick = (index) => {
    setShowDelete(index); // Show delete button for the selected message
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Real-Time Chat</h1>

      {/* Upper Block: Display the most recent message */}
      <div style={styles.upperBlock}>
        {messages.length > 0 && (
          <div style={styles.messageBubble}>
            <strong>{messages[messages.length - 1].sender}</strong>: {messages[messages.length - 1].message}
            <div style={styles.timestamp}>{messages[messages.length - 1].timestamp}</div>
          </div>
        )}
      </div>

      {/* Display older messages below the upper block */}
      <div style={styles.messageContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            onDoubleClick={() => handleDoubleClick(index)} // Trigger double click event
            style={{
              ...styles.messageBlock,
              justifyContent: msg.sender === sender ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                ...styles.messageBubble,
                backgroundColor: msg.sender === sender ? '#4caf50' : '#f0f0f0',
                color: msg.sender === sender ? '#fff' : '#000',
              }}
            >
              <strong>{msg.sender}</strong>: {msg.message}
              <div style={styles.timestamp}>{msg.timestamp}</div>
              {showDelete === index && (
                <button 
                  style={styles.deleteButton}
                  onClick={() => deleteMessage(index)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendButton}>Send</button>
      </div>
    </div>
  );
}

// Styles object to hold CSS in JS
const styles = {
  container: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: '"Arial", sans-serif',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  upperBlock: {
    padding: '10px',
    backgroundColor: '#f1f1f1',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    maxWidth: '100%',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
  },
  messageContainer: {
    flex: 1,
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '10px',
    maxHeight: '80vh',
    overflowY: 'auto',
    backgroundColor: '#fafafa',
  },
  messageBlock: {
    display: 'flex',
    marginBottom: '10px',
    maxWidth: '70%',
    wordWrap: 'break-word',
  },
  messageBubble: {
    padding: '12px',
    borderRadius: '15px',
    fontSize: '16px',
    maxWidth: '70%',
    position: 'relative',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '5px',
    animation: 'fadeIn 0.5s',
    wordBreak: 'break-word',
  },
  timestamp: {
    fontSize: '12px',
    color: '#888',
    position: 'absolute',
    bottom: '-15px',
    right: '10px',
  },
  deleteButton: {
    position: 'absolute',
    top: '0',
    right: '5px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'red',
    fontSize: '14px',
    cursor: 'pointer',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
    borderTop: '1px solid #ddd',
    paddingTop: '10px',
  },
  input: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '15px',
    fontSize: '16px',
    outline: 'none',
    marginRight: '10px',
  },
  sendButton: {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: '#4caf50',
    color: '#fff',
    borderRadius: '15px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

// Adding animation for smooth fade-in of messages
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`, styleSheet.cssRules.length);

export default App;
