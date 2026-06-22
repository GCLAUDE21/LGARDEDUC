import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  capaciteMaxPension: { type: Number, default: 4 },
});

const SettingsModel = mongoose.model("Settings", SettingsSchema);

export default SettingsModel;
