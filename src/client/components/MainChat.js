import React, { useState, useRef, useContext } from 'react';
import SocketContext from '../context/SocketContext';

export default function MainChat(props) {
  const [messageData, setMessageData] = useState([]);
  const inputMessageRef = useRef(null);
  const socket = useContext(SocketContext);

  const handleSendClick = () => {
    console.log(props);
    const data = {
      message: inputMessageRef.current.value,
      username: props.location.state.username,
    };
    inputMessageRef.current.value = '';
    socket.emit('message', data);
  };

  socket.on('newMessage', (data) => {
    //{username, userURL, timestamp, message}
    const newArr = [...messageData];
    newArr.push(data);
    setMessageData(newArr);
  });

  //TODO: add function for request more messages on scroll up
  if (messageData.length === 0) {
    fetch('/messages/all')
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setMessageData(res);
      });
  }

  return (
    <div className='mainContainer mainChat'>
      <img src={props.userURL} />
      {/* TODO: add log out functionalities */}
      <button>Log out of GitHub</button>
      <button>Log out of Anon ID</button>
      <p className='displayName'>Pikachu</p>
      <div className='chat'>
        {/* assumes most recent message is at the end of the array */}
        {messageData.map((message) => (
          <Message key={JSON.stringify(message)} {...message} />
        ))}
      </div>
      <div className='inputArea'>
        <input type='text' ref={inputMessageRef}></input>
        <button onClick={handleSendClick}>Send</button>
      </div>
    </div>
  );
}

function Message(props) {
  return (
    <div className='messageContainer'>
      <p>{props.timestamp}</p>
      <img src={props.userURL} />
      <p>{props.message}</p>
    </div>
  );
}
