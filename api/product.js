// api/trendyol.js
import axios from "axios";

export default async function handler(req, res) {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query param required" });

  try {
    const url = `https://www.trendyol.com/sr?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 10000,
    });

    // Trendyol ürün listesini bul
    const match = data.match(/"products":(\[.*?\]),"totalProductCount"/);
    if (!match) return res.status(500).json({ error: "Products data not found" });

    const products = JSON.parse(match[1]);

    const toAbsolute = (imgPath) => {
      if (!imgPath) return null;
      if (imgPath.startsWith("http")) return imgPath;
      const base = "https://cdn.dsmcdn.com";
      return imgPath.startsWith("/") ? base + imgPath : `${base}/${imgPath}`;
    };

    const results = products
      .map((p) => {
        const rawImage =
          p.imageUrl ||
          p.image ||
          (Array.isArray(p.images) && (p.images[0]?.url || p.images[0])) ||
          null;

        return {
          id: p.id,
          name: p.name,
          price: p.price?.sellingPrice ?? null,
          link: `https://www.trendyol.com${p.url}`,
          brand: p.brand?.name ?? null,
          image: toAbsolute(rawImage),
        };
      })
      .filter((x) => x.price);

    const cheapest = results.reduce(
      (prev, curr) => (!prev || curr.price < prev.price ? curr : prev),
      null
    );

    res.status(200).json({ product: query, results, cheapest });
  } catch (err) {
    console.error("Trendyol error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
