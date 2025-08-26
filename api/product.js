// api/product.js
import axios from "axios";
import cheerio from "cheerio";

async function fetchTrendyol(query) {
  const results = [];
  try {
    const url = `https://www.trendyol.com/sr?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000,
    });
    const $ = cheerio.load(data);
    $("div.p-card-chldrn-cntnr").each((i, el) => {
      const name = $(el).find("span.prdct-desc-cntnr-ttl").text().trim();
      const price = parseInt(
        $(el).find("div.prc-box-sllng").text().replace(/[^\d]/g, "")
      );
      const link = "https://www.trendyol.com" + $(el).find("a").attr("href");
      if (name && price) results.push({ site: "Trendyol", name, price, link });
    });
  } catch (e) {
    console.log("Trendyol error:", e.message);
  }
  return results;
}

async function fetchHepsiburada(query) {
  const results = [];
  try {
    const url = `https://www.hepsiburada.com/ara?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000,
    });
    const $ = cheerio.load(data);
    $("li.search-item").each((i, el) => {
      const name = $(el).find("h3").text().trim();
      const price = parseInt(
        $(el).find(".price-value").first().text().replace(/[^\d]/g, "")
      );
      const link = "https://www.hepsiburada.com" + $(el).find("a").attr("href");
      if (name && price) results.push({ site: "Hepsiburada", name, price, link });
    });
  } catch (e) {
    console.log("Hepsiburada error:", e.message);
  }
  return results;
}

async function fetchAmazon(query) {
  const results = [];
  try {
    const url = `https://www.amazon.com.tr/s?k=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000,
    });
    const $ = cheerio.load(data);
    $("div.s-main-slot div.s-result-item").each((i, el) => {
      const name = $(el).find("h2 a span").text().trim();
      const price = parseInt(
        $(el).find(".a-price-whole").first().text().replace(/[^\d]/g, "")
      );
      const link = "https://www.amazon.com.tr" + $(el).find("h2 a").attr("href");
      if (name && price) results.push({ site: "Amazon", name, price, link });
    });
  } catch (e) {
    console.log("Amazon error:", e.message);
  }
  return results;
}

async function fetchN11(query) {
  const results = [];
  try {
    const url = `https://www.n11.com/arama?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 5000,
    });
    const $ = cheerio.load(data);
    $("li.column").each((i, el) => {
      const name = $(el).find("a.productName").text().trim();
      const price = parseInt(
        $(el).find("div.priceContainer span").first().text().replace(/[^\d]/g, "")
      );
      const link = $(el).find("a.productName").attr("href");
      if (name && price) results.push({ site: "N11", name, price, link });
    });
  } catch (e) {
    console.log("N11 error:", e.message);
  }
  return results;
}

export default async function handler(req, res) {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query param required" });

  try {
    const [trendyol, hepsiburada, amazon, n11] = await Promise.all([
      fetchTrendyol(query),
      fetchHepsiburada(query),
      fetchAmazon(query),
      fetchN11(query),
    ]);

    const results = [...trendyol, ...hepsiburada, ...amazon, ...n11];

    const cheapest = results.reduce(
      (prev, curr) => (!prev || curr.price < prev.price ? curr : prev),
      null
    );

    res.status(200).json({ product: query, results, cheapest });
  } catch (err) {
    console.log("API error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
