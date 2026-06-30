import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CheckCircle2,
  CreditCard,
  Heart,
  Mail,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2
} from "lucide-react";
import "./styles.css";

const formatPrice = (value) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("home");
  const [notice, setNotice] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then(setProducts)
      .catch(() => setNotice("Produkte konnten nicht geladen werden."));
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const addToCart = (product, goToCart = true) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);
      if (exists) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setOrder(null);
    setNotice(`${product.name} wurde in den Warenkorb gelegt.`);
    if (goToCart) {
      setView("cart");
    }
  };

  const updateQuantity = (id, change) => {
    setCart((current) =>
      current
        .map((item) => ({ ...item, quantity: Math.max(0, item.quantity + change) }))
        .filter((item) => item.quantity > 0 || item.id !== id)
    );
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const placeOrder = async (checkoutData) => {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: cart.map(({ id, quantity }) => ({ id, quantity })),
        ...checkoutData
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Die Zahlung konnte nicht abgeschlossen werden.");
    }

    setOrder(data.order);
    setCart([]);
    setView("success");
  };

  return (
    <>
      <Header cartCount={cartCount} setView={setView} />
      <main>
        {notice && (
          <button className="notice" onClick={() => setNotice("")}>
            {notice}
          </button>
        )}
        {view === "home" && <Home products={products} addToCart={addToCart} setView={setView} />}
        {view === "shop" && <Shop products={products} addToCart={addToCart} />}
        {view === "cart" && (
          <Cart
            cart={cart}
            subtotal={subtotal}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            placeOrder={placeOrder}
            setView={setView}
          />
        )}
        {view === "contact" && <Contact />}
        {view === "success" && <Success order={order} setView={setView} />}
      </main>
      <Footer />
    </>
  );
}

function Header({ cartCount, setView }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => setView("home")}>
        <img src="/images/logo.png" alt="Glowify logo" />
        <span>Glowify</span>
      </button>
      <nav>
        <button onClick={() => setView("home")}>Home</button>
        <button onClick={() => setView("shop")}>Shop</button>
        <button onClick={() => setView("contact")}>Contact</button>
      </nav>
      <button className="cart-button" onClick={() => setView("cart")} aria-label="Warenkorb">
        <ShoppingBag size={19} />
        <span>{cartCount}</span>
      </button>
    </header>
  );
}

function Home({ products, addToCart, setView }) {
  const featured = products.slice(0, 3);
  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Beauty and skincare essentials</span>
          <h1>Glowify</h1>
          <p>
            Sanfte Routinen fuer jeden Tag: Seren, Cremes und Sets, die deine Haut pflegen,
            beruhigen und sichtbar strahlen lassen.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setView("shop")}>
              <ShoppingBag size={18} />
              Shop ansehen
            </button>
            <button className="ghost-button" onClick={() => setView("cart")}>
              Zur Kasse
            </button>
          </div>
        </div>
        <img className="hero-image" src="/images/Main.png" alt="Glowify skincare products" />
      </section>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Best deals</span>
          <h2>Beliebte Glowify Produkte</h2>
        </div>
        <ProductGrid products={featured} addToCart={addToCart} />
      </section>
    </>
  );
}

function Shop({ products, addToCart }) {
  return (
    <section className="section shop-section">
      <div className="section-heading">
        <span className="eyebrow">Shop</span>
        <h1>Glowify Produkte</h1>
        <p>Waehle ein Produkt aus. Mit "Kaufen" landest du direkt im Warenkorb.</p>
      </div>
      <ProductGrid products={products} addToCart={addToCart} />
    </section>
  );
}

function ProductGrid({ products, addToCart }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <div className="product-image">
            <img src={product.image} alt={product.name} />
            <span>{product.badge}</span>
          </div>
          <div className="product-content">
            <p>{product.category}</p>
            <h3>{product.name}</h3>
            <span className="product-description">{product.description}</span>
            <div className="product-footer">
              <strong>{formatPrice(product.price)}</strong>
              <button onClick={() => addToCart(product)}>
                <ShoppingBag size={17} />
                Kaufen
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Cart({ cart, subtotal, updateQuantity, removeFromCart, placeOrder, setView }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const shipping = subtotal >= 120 || subtotal === 0 ? 0 : 4.9;
  const total = subtotal + shipping;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await placeOrder({
        customer: {
          name: form.name,
          email: form.email,
          address: form.address
        },
        payment: {
          cardName: form.cardName,
          cardNumber: form.cardNumber,
          expiry: form.expiry,
          cvc: form.cvc
        }
      });
    } catch (checkoutError) {
      setError(checkoutError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section cart-layout">
      <div>
        <div className="section-heading compact">
          <span className="eyebrow">Cart</span>
          <h1>Warenkorb und Zahlung</h1>
        </div>
        {cart.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={34} />
            <h2>Dein Warenkorb ist leer.</h2>
            <button className="primary-button" onClick={() => setView("shop")}>
              Shop ansehen
            </button>
          </div>
        ) : (
          <div className="cart-items">
            {cart.map((item) => (
              <article className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>{formatPrice(item.price)}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, -1)} aria-label="Weniger">
                    <Minus size={15} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} aria-label="Mehr">
                    <Plus size={15} />
                  </button>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
                <button className="icon-button" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
      <aside className="checkout-panel">
        <h2>Bezahlen</h2>
        <div className="totals">
          <span>Zwischensumme <strong>{formatPrice(subtotal)}</strong></span>
          <span>Versand <strong>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</strong></span>
          <span className="total">Gesamt <strong>{formatPrice(total)}</strong></span>
        </div>
        <form onSubmit={handleSubmit}>
          <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input required type="email" placeholder="E-Mail" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input required placeholder="Adresse" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <input required placeholder="Name auf Karte" value={form.cardName} onChange={(event) => setForm({ ...form, cardName: event.target.value })} />
          <input required inputMode="numeric" placeholder="Kartennummer" value={form.cardNumber} onChange={(event) => setForm({ ...form, cardNumber: event.target.value })} />
          <div className="two-fields">
            <input required placeholder="MM/JJ" value={form.expiry} onChange={(event) => setForm({ ...form, expiry: event.target.value })} />
            <input required inputMode="numeric" placeholder="CVC" value={form.cvc} onChange={(event) => setForm({ ...form, cvc: event.target.value })} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full" disabled={cart.length === 0 || loading}>
            <CreditCard size={18} />
            {loading ? "Zahlung laeuft..." : "Jetzt bezahlen"}
          </button>
        </form>
      </aside>
    </section>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData))
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Nachricht konnte nicht gesendet werden.");
      return;
    }

    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <section className="section contact-layout">
      <div className="contact-info">
        <span className="eyebrow">Contact</span>
        <h1>Contact Our Team</h1>
        <p>Wir helfen dir bei Fragen zu Produkten, Routinen und Bestellungen.</p>
        <p><Mail size={18} /> razidorra@glowify.com</p>
        <p><MapPin size={18} /> Glowify Shop, Buchholz, Germany</p>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <input required name="name" placeholder="Full Name" />
        <input required name="email" type="email" placeholder="Email Address" />
        <textarea required name="message" placeholder="Your Message" rows="6" />
        {sent && <p className="form-success">Danke, deine Nachricht wurde gesendet.</p>}
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button full">Send Message</button>
      </form>
    </section>
  );
}

function Success({ order, setView }) {
  return (
    <section className="section success-state">
      <CheckCircle2 size={56} />
      <h1>Bestellung abgeschlossen</h1>
      <p>Danke fuer deinen Einkauf. Deine Demo-Zahlung wurde angenommen.</p>
      {order && (
        <div className="order-box">
          <span>Bestellnummer <strong>{order.id}</strong></span>
          <span>Gesamt <strong>{formatPrice(order.total)}</strong></span>
        </div>
      )}
      <button className="primary-button" onClick={() => setView("shop")}>
        Weiter einkaufen
      </button>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitNewsletter = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setMessage(response.ok ? "Danke fuer deine Anmeldung." : "Bitte E-Mail pruefen.");
    if (response.ok) setEmail("");
  };

  return (
    <footer>
      <div>
        <h3><Sparkles size={19} /> Glowify</h3>
        <p>Skincare Guide, Consultation und liebevoll kuratierte Glow-Routinen.</p>
      </div>
      <form onSubmit={submitNewsletter}>
        <label>Newsletter</label>
        <div>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@glowify.com" />
          <button><Heart size={17} /></button>
        </div>
        {message && <span>{message}</span>}
      </form>
    </footer>
  );
}

createRoot(document.getElementById("root")).render(<App />);
