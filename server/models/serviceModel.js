import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  prix: {
    type: Number,
    required: true,
  },

  unite: {
    type: String,
    required: true,
  },
});

const ServiceModel = mongoose.model("Service", ServiceSchema);

export default ServiceModel;
