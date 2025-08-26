// api/nufus.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const il = req.query.il;

  // JSON dosyası yolunu ayarlıyoruz
  const filePath = path.join(process.cwd(), "data", "turkiye-nufus.json");
  let data;

  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return res.status(500).json({ error: "Data not found" });
  }

  if (il) {
    const city = data.find((c) => c.il.toLowerCase() === il.toLowerCase());
    if (!city) return res.status(404).json({ error: "City not found" });
    return res.status(200).json(city);
  }

  // Eğer il param yoksa tüm şehirleri döndür
  res.status(200).json(data);
}
