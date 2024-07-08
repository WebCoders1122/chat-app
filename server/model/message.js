const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  message: String,
  username: String,
  room: String,
  __createdtime__: String,
});

exports.Message = mongoose.model("Message", messageSchema);
