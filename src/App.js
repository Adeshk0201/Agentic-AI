import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import DiagnosisUploader from './components/DiagnosisUploader';
import './index.css';
const Loader = () => (
  <div style={loaderStyles.container}>
    <div style={loaderStyles.dot} />
    <div style={{ ...loaderStyles.dot, animationDelay: '0.2s' }} />
    <div style={{ ...loaderStyles.dot, animationDelay: '0.4s' }} />
  </div>
);

const FloatingToggle = ({ isOpen, onClick }) => (
  <div onClick={onClick} style={styles.chatIcon}>
    {isOpen ? '❌' : '💬'}
  </div>
);

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { sender: 'bot', text: '⚠️ Backend error.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }

    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes blink {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }

      @keyframes glow {
        0% { box-shadow: 0 0 5px #00c6ff; }
        50% { box-shadow: 0 0 20px #00c6ff; }
        100% { box-shadow: 0 0 5px #00c6ff; }
      }

      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }

      @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={styles.fullscreenContainer}>
     <div style={styles.sidebar}> 
  <h1 style={styles.logo}>🧠 Prayaas AI Health Diagnosis</h1>

  {/* 👇 Your intro text here */}
  <p style={styles.intro}>
    Empowering rural healthcare with AI-driven diagnosis and smart insights. Upload files, chat with our assistant, and get accurate feedback in seconds!
  </p>

  <DiagnosisUploader />
</div>

      <div style={styles.contentArea}>
        <FloatingToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        {isOpen && (
          <div style={styles.chatPopup}>
            <h2 style={styles.header}>🤖 Your AI Health Assistant</h2>
            <div style={styles.chatWindow}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    ...styles.message,
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(to right, #00d2ff, #3a47d5)'
                      : 'linear-gradient(to right, #9b59b6, #8e44ad)',
                    color: '#f0f0f0',
                    boxShadow: msg.sender === 'user'
                      ? '0 0 12px #00d2ff'
                      : '0 0 12px #9b59b6',
                    animation: msg.sender === 'bot' ? 'glow 1.5s ease-in-out infinite' : 'none'
                  }}
                >
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ))}
              {loading && <Loader />}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputContainer}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={styles.input}
                disabled={loading}
              />
              <button onClick={sendMessage} style={styles.button} disabled={loading}>
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const loaderStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  dot: {
    width: 0,
    height: 0,
    margin: '0',
    borderRadius: '50%',
    backgroundColor: '#00d2ff',
    animation: 'blink 1.4s infinite both',
  },
};

const styles = {
  fullscreenContainer: {
    display: 'flex',
    width: '100%',
    height: '680px',
    overflow: 'hidden',
    backgroundColor: '#0d1b2a',
    color: '#fff',
    fontFamily: 'Share Tech Mono, monospace',
  },
  sidebar: {
    width: '75%',
    padding: '30px 20px',
    background: 'linear-gradient(to bottom, #1b263b, #415a77)',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #1f4068',
    overflowY: 'auto',
  },
  logo: {
    fontSize: 24,
    marginBottom: 20,
    textShadow: '0 0 8px #00c6ff',
    color: '#00c6ff'
  },
  contentArea: {
    flex: 1,
    position: 'relative',
    padding: 20,
    background: 'url("/bg-particles.gif") center / cover no-repeat',
  },
  chatIcon: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
    color: '#fff',
    fontSize: 28,
    padding: 20,
    borderRadius: '50%',
    cursor: 'pointer',
    boxShadow: '0 0 20px rgba(0, 198, 255, 0.7)',
    zIndex: 9999,
    transition: 'all 0.3s ease',
    animation: 'glow 1.8s infinite',
  },
  chatPopup: {
    position: 'absolute',
    bottom: '90px',
    right: '20px',
    // width: '100%',
   width: '520px',
    height: '70vh',
    background: 'rgba(18, 18, 43, 0.9)',
    borderRadius: 20,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 25px rgba(0, 198, 255, 0.5)',
    zIndex: 9998,
  },
  header: {
    textAlign: 'left',
    marginBottom: 12,
    fontSize: 22,
    fontWeight: 700,
    color: '#00c6ff',
    textShadow: '0 0 8px #00c6ff',
  },
  chatWindow: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    maxWidth: '75%',
    padding: '12px 18px',
    borderRadius: 22,
    marginBottom: 12,
    wordWrap: 'break-word',
    fontSize: 16,
  },
  inputContainer: {
    display: 'flex',
    marginTop: 12,
  },
  input: {
    flex: 1,
    padding: '12px 18px',
    fontSize: 17,
    borderRadius: 28,
    border: '1.5px solid #00bfff',
    outline: 'none',
    backgroundColor: '#12122b',
    color: '#e0e0e0',
  },
  intro: {
    fontSize: '15px',
    lineHeight: '1.5',
    color: '#c0d6e4',
    marginBottom: '20px',
    textShadow: '0 0 4px #1b6ca8',
    textAlign: 'center',

  },
  button: {
    marginLeft: 12,
    padding: '12px 24px',
    fontSize: 17,
    borderRadius: 28,
    border: 'none',
    background: 'linear-gradient(to right, #00bfff, #0072ff)',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 0 12px #00bfff',
    transition: 'background 0.3s ease',
  },
};

export default App;