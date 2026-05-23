import mongoose from "mongoose";

export const mongoDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("Connecter au DB");
  } catch (err) {
    console.log(err);
  }
};
