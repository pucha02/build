import mongoose from "mongoose";
const { Schema } = mongoose;

const MapPointSchema = new Schema({
  id: { type: String, required: true, unique: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  label: { type: String, required: true },
  description: { type: String, default: "" },
  qrUrl: { type: String, required: true },
  qrImg: { type: String }, // base64 PNG
}, { timestamps: true });

export default mongoose.model("MapPoint", MapPointSchema);
