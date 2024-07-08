const { Message } = require("../model/message");

exports.saveMessage = async (messageData) => {
  //   console.log(messageData);
  const message = new Message(messageData);
  await message.save();
};

exports.get100Messages = async (room) => {
  try {
    const messages = await Message.find({ room: room }).limit(100);
    return messages;
  } catch (error) {
    console.log(error);
  }
};
