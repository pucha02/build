import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import QRCode from "qrcode";
import MapPoint from "./models/MapPoint.js";
import MapEdge from "./models/MapEdge.js";

const MONGO_URL = "mongodb+srv://goodzonemap:uJUHYZrld2ziF6Yx@cluster0.n8ca2ib.mongodb.net/goodzone?retryWrites=true&w=majority";
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

mongoose.connect(MONGO_URL).then(() => console.log("MongoDB connected"));

// --- Точки ---
app.get("/site/points", async (req, res) => {
  const points = await MapPoint.find().sort({ label: 1 });
  res.json(points);
});
app.post("/site/points", async (req, res) => {
  const { id, x, y, label, description } = req.body;
  const qrUrl = `http://localhost:3000/map?point=${encodeURIComponent(id)}`;
  const qrImg = await QRCode.toDataURL(qrUrl);
  let point = await MapPoint.findOne({ id });
  if (point) {
    point.x = x; point.y = y; point.label = label; point.description = description; point.qrUrl = qrUrl; point.qrImg = qrImg;
    await point.save();
  } else {
    point = await MapPoint.create({ id, x, y, label, description, qrUrl, qrImg });
  }
  res.json(point);
});
app.delete("/site/points/:id", async (req, res) => {
  await MapPoint.deleteOne({ id: req.params.id });
  await MapEdge.deleteMany({ $or: [{ from: req.params.id }, { to: req.params.id }] });
  res.json({ ok: true });
});

// --- Маршруты (edges) ---
app.get("/site/edges", async (req, res) => {
  const edges = await MapEdge.find();
  res.json(edges);
});
app.post("/site/edges", async (req, res) => {
  const { from, to, polyline, name = "" } = req.body;

  // Проверка, чтобы не создавать дубликаты
  const exists = await MapEdge.findOne({ from, to, polyline: { $size: polyline.length } });
  if (exists) return res.json(exists);

  const edge = await MapEdge.create({ from, to, polyline, name });

  // Автоматически создаём обратный маршрут, если он не существует
  if (from !== to && polyline?.length > 1) {
    const reverseExists = await MapEdge.findOne({ from: to, to: from, polyline: { $size: polyline.length } });
    if (!reverseExists) {
      await MapEdge.create({
        from: to,
        to: from,
        polyline: [...polyline].reverse(),
        name: name ? `${name} (обратно)` : "",
      });
    }
  }
  res.json(edge);
});
app.delete("/site/edges/:id", async (req, res) => {
  await MapEdge.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

// PATCH — обновление названия маршрута (edge)
app.patch("/site/edges/:id", async (req, res) => {
  const { name } = req.body;
  const edge = await MapEdge.findByIdAndUpdate(
    req.params.id,
    { name },
    { new: true }
  );
  if (!edge) return res.status(404).json({ error: "Edge not found" });
  res.json(edge);
});


const PORT = 3001;
app.listen(PORT, () => console.log("API сервер запущен на http://localhost:" + PORT));
