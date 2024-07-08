import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";

const Home = ({ username, setUsername, room, setRoom, socket }) => {
  const navigate = useNavigate();
  //to emit event from client to server on joining room
  const joinRoom = () => {
    console.log(room, username);
    if (room !== "" && username !== "") {
      socket.emit("join_room", { username, room }); //replace: true means that you cant go back in history with browser go back button
    }
    navigate("/chat", { replace: true });
  };
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1>{`<>DevRooms</>`}</h1>
        <input
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
          placeholder='Username...'
        />
        <select
          onChange={(e) => setRoom(e.target.value)}
          className={styles.input}>
          <option>-- Select Room --</option>
          <option value='javascript'>JavaScript</option>
          <option value='node'>Node</option>
          <option value='express'>Express</option>
          <option value='react'>React</option>
        </select>
        <button
          onClick={joinRoom}
          className='btn btn-secondary'
          style={{ width: "100%" }}>
          Home Room
        </button>
      </div>
    </div>
  );
};

export default Home;
