import express from "express";
import cors from "cors";
import { products } from "./products.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const orders = [];
const messages = [];
const newsletter = [];

const getProduct = (id) => products.find((product) => product.id === id);
const asCurrency = (value) => Math.round(value * 100) / 100;

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "Glowify backend" });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Bitte alle Kontaktfelder ausfuellen." });
  }

  const savedMessage = {
    id: `msg-${Date.now()}`,
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  messages.push(savedMessage);
  res.status(201).json({ ok: true, message: savedMessage });
});

app.post("/api/newsletter", (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Bitte eine gueltige E-Mail eingeben." });
  }

  newsletter.push({ email, createdAt: new Date().toISOString() });
  res.status(201).json({ ok: true });
});

app.post("/api/checkout", (req, res) => {
  const { cart, customer, payment } = req.body;

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: "Dein Warenkorb ist leer." });
  }

  if (!customer?.name || !customer?.email || !customer?.address) {
    return res.status(400).json({ error: "Bitte Lieferdaten vollstaendig ausfuellen." });
  }

  if (!payment?.cardName || !payment?.cardNumber || !payment?.expiry || !payment?.cvc) {
    return res.status(400).json({ error: "Bitte Zahlungsdaten vollstaendig ausfuellen." });
  }

  const items = cart.map((item) => {
    const product = getProduct(item.id);
    if (!product) {
      throw new Error(`Produkt ${item.id} wurde nicht gefunden.`);
    }

    const quantity = Math.max(1, Number(item.quantity) || 1);
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      lineTotal: asCurrency(product.price * quantity)
    };
  });

  const subtotal = asCurrency(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const shipping = subtotal >= 120 ? 0 : 4.9;
  const total = asCurrency(subtotal + shipping);

  const order = {
    id: `GLW-${Date.now().toString().slice(-6)}`,
    items,
    customer,
    subtotal,
    shipping,
    total,
    status: "paid-demo",
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  res.status(201).json({ ok: true, order });
});

app.use((error, req, res, next) => {
  res.status(400).json({ error: error.message || "Etwas ist schiefgelaufen." });
});

app.listen(port, () => {
  console.log(`Glowify backend running on http://localhost:${port}`);
});
