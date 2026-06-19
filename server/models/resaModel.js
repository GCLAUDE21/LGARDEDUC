import mongoose from "mongoose";

const ResaSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dog: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog", required: true }],
    statut: { type: String, default: "En attente" },
    notes: { type: String },
    bilanLaura: { type: String },
    motifRefus: { type: String },
    evenements: [
      {
        date: { type: Date, required: true },
        description: { type: String, required: true },
        photo: { type: String },
        realise: { type: String },
        aFaire: { type: String },
        aAmeliorer: { type: String },
      },
    ],
  },
  { timestamps: true },
);

const ResaModel = mongoose.model("Reservation", ResaSchema);

export default ResaModel;
