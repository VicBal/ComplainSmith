const { getIDAndPictureByUsername, saveMessageToDB } = require('../utils/dbUtils');
const moment = require('moment');
const db = require('../models/elephantsql');
const redis = require('../redis/redis')();
moment().format();

module.exports = (http) => {
  const io = require('socket.io')(http);

  io.on('connect', (socket) => {
    console.log('a user connected');

    // TODO: on message should do the following:
    //       1. save the message to database
    //       2. forward the message to all connected users
    socket.on('message', async ({ message, username }) => {
      console.log(username, message);
      const { user_id, userURL } = await getIDAndPictureByUsername(username);
      const timestamp = moment();
      const newMessage = { message: message, username, userURL, timestamp };
      const dbMessage = { user_id, message };
      try {
        console.log('attempting to save message');
        await saveMessageToDB(dbMessage);
        console.log(newMessage);
        io.emit('newMessage', newMessage);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('signin', ({ username }) => {
      console.log(username);
      redis.set(socket.id.toString(), username);
      redis.set(username, 'true');
    });

    // TODO: on disconnect, should free the user id from the redis database
    socket.on('disconnect', () => {
      redis.get(socket.id.toString(), (err, username) => {
        if (err) return console.error(err);

        console.log(socket.id.toString());
        console.log(username, 'disconnected');
        redis.del(socket.id.toString());
        redis.del(username);
      });
    });
  });
  return io;
};

/* messageObject = {
message: String,
username:  String,
userURL:  String,
timestamp: String (format will be h:mm a)
}
*/

/*
  sendMessage = {
  username: String,
  message: String,
  }
 */
