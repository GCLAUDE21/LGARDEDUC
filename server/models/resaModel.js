import mongoose from "mongoose";

const ResaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  dateDebut: {
    type: Date,
    required: true,
  },
  dateFin: {
    type: Date,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  dog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dog",
      required: true,
    },
  ],
  statut: {
    type: String,
    default: "En attente",
  },
  notes: {
    type: String,
  },
});

const ResaModel = mongoose.model("Reservation", ResaSchema);

export default ResaModel;
