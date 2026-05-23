import mongoose from "mongoose";

const DogSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  dateDeNaissance: {
    type: Date,
    required: true,
  },

  race: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
  },
  vaccins: [
    {
      nom: String,
      date: Date,
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notes: {
    type: String,
  },
});

const DogModel = mongoose.model("Dog", DogSchema);

export default DogModel;
