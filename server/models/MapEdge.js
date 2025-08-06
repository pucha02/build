import mongoose from "mongoose";
const MapEdgeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  polyline: [{ x: Number, y: Number }],
  name: String, // название маршрута (может быть пустым)
});
export default mongoose.model("MapEdge", MapEdgeSchema);
