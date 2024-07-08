import { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
//socket imports
import io from "socket.io-client";
import Chat from "./pages/chat/Chat";

//instance of socket
const socket = io.connect("http://localhost:5500"); // our server will run on port 5500, so we connect to it from here

function App() {
  //states to manage username and room selection
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route
            path='/'
            element={
              <Home
                username={username}
                setUsername={setUsername}
                room={room}
                setRoom={setRoom}
                socket={socket}
              />
            }
          />
          <Route
            path='/chat'
            element={
              <Chat
                username={username}
                room={room}
                socket={socket}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
