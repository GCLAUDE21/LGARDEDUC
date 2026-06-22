import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema(
  {
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    type: {
      type: String,
      required: true,
      enum: ["pension", "education", "pet sitting", "tous"],
    },
    slot: {
      type: String,
      enum: ["matin", "apres-midi"],
      default: null,
    },
    motif: { type: String },
  },
  { timestamps: true },
);

const AvailabilityModel = mongoose.model("Availability", AvailabilitySchema);

export default AvailabilityModel;
