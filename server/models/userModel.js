import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  pseudo: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  adresse: {
    type: String,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
  },
});

// Pré Hook - Avant d'enregistrer dans Mongo

UserSchema.pre("save", async function () {
  const user = this;

  const hash = await bcrypt.hash(user.password, 10);

  user.password = hash;
});

// Ajouter une méthode pour vérifier le password

UserSchema.methods.isValidPassword = async function (password) {
  const user = this;

  const isEqual = await bcrypt.compare(password, user.password);

  return isEqual; // Return true ou false
};

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
