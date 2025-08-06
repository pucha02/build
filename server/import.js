import mongoose from "mongoose";
import QRCode from "qrcode";
import MapPoint from "./models/MapPoint.js";

const MONGO_URL = "mongodb+srv://goodzonemap:uJUHYZrld2ziF6Yx@cluster0.n8ca2ib.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

await mongoose.connect(MONGO_URL, { dbName: "goodzone" });

const baseUrl = "http://localhost:3000/map?point="; // адрес твоей фронт-карты!

const points = [
  {
    id: "A1",
    label: "Вхід 1",
    description: "Головний вхід з боку проспекту",
    x: 12.5,
    y: 43.2
  },
  {
    id: "B2",
    label: "Рецепція",
    description: "Стійка адміністратора",
    x: 55.0,
    y: 38.7
  },
  {
    id: "C3",
    label: "Коворкінг",
    description: "Зона для роботи",
    x: 65.3,
    y: 66.9
  },
];

for (const p of points) {
  const qrUrl = `${baseUrl}${encodeURIComponent(p.id)}`;
  const qrImg = await QRCode.toDataURL(qrUrl);
  await MapPoint.create({ ...p, qrUrl, qrImg });
}

console.log("Точки успішно додані!");

mongoose.connection.close();
