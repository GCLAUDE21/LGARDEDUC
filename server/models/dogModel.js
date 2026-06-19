import mongoose from "mongoose";

const DogSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  dateDeNaissance: { type: Date, required: true },
  race: { type: String, required: true },
  photo: { type: String },
  vaccins: [{ nom: String, date: Date }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Laura uniquement
  notes: { type: String },
  bilan: { type: Boolean, default: false },

  // Santé
  sterilise: { type: Boolean, default: false },
  allergies: { type: String },
  veterinaire: {
    nom: { type: String },
    telephone: { type: String },
  },
  traitement: { type: String },

  // Alimentation
  alimentation: {
    marque: { type: String },
    quantite: { type: String },
    frequence: { type: String },
  },

  // Comportement
  ententeChiens: { type: String },
  ententeChats: { type: String },
  particularites: { type: String },

  // Notes propriétaire
  notesProprietaire: { type: String },
});

const DogModel = mongoose.model("Dog", DogSchema);
export default DogModel;
