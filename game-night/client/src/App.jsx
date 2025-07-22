import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // This function runs when the login button is clicked
  const handleLogin = () => {
    // Redirects the browser to your backend route that starts Steam login
    window.location.href = 'http://localhost:3001/auth/steam';
  };

  return (
    <div className="App">
      <h1>Game Night 🎮</h1>
      
      {/* Button to trigger Steam login */}
      <button onClick={handleLogin}>
        Login with Steam
      </button>
    </div>
  );
}

export default App; // Export for use in main.jsx