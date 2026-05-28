import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },

  objet: {
    type: String,
    required: true,
  },

  message: {
    type: String,
    required: true,
  },

  mail: {
    type: String,
  },

  tel: {
    type: String,
  },
});

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
