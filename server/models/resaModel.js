import mongoose from "mongoose";

const ResaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["pension", "education", "pet sitting", "journée d'essai"],
    },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    passagesParJour: { type: Number, default: 1 },
    heuresPassages: [{ type: String }],
    dog: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dog", required: true }],
    statut: {
      type: String,
      default: "En attente",
      enum: [
        "En attente",
        "Validée",
        "Refusée",
        "Contre-proposition",
        "Annulée",
      ],
    },
    contreProposition: {
      dateDebut: { type: Date },
      dateFin: { type: Date },
      message: { type: String },
      heuresPassages: [{ type: String }], // ← ajout
    },
    notes: { type: String },
    slot: { type: String, enum: ["matin", "apres-midi"], default: null },
    bilanLaura: { type: String },
    motifRefus: { type: String },
    evenements: [
      {
        date: { type: Date, required: true },
        heure: { type: String },
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
