import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CheckCircle2,
  CreditCard,
  Heart,
  Mail,
  MapPin,
  Minus,
  Moon,
  Plus,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2
} from "lucide-react";
import logoImage from "../images/logo.png";
import mainImage from "../images/Main.png";
import { products as staticProducts } from "./products";
import "./styles.css";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value);

function App() {
  const [products, setProducts] = useState(staticProducts);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState("home");
  const [notice, setNotice] = useState("");
  const [order, setOrder] = useState(null);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("glowify-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("glowify-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Products API is unavailable.");
        }
        return response.json();
      })
      .then((apiProducts) => {
        const localImages = new Map(
          staticProducts.map((product) => [product.id, product.image])
        );

        setProducts(
          apiProducts.map((product) => ({
            ...product,
            image: localImages.get(product.id) || product.image
          }))
        );
      })
      .catch(() => setProducts(staticProducts));
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
    setNotice(`${product.name} was added to your cart.`);
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
    let data;

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map(({ id, quantity }) => ({ id, quantity })),
          ...checkoutData
        })
      });
      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The payment could not be completed.");
      }
    } catch {
      const shipping = subtotal >= 120 || subtotal === 0 ? 0 : 4.9;
      data = {
        order: {
          id: `GLW-${Date.now().toString().slice(-6)}`,
          total: subtotal + shipping
        }
      };
    }

    setOrder(data.order);
    setCart([]);
    setView("success");
  };

  return (
    <>
      <Header
        cartCount={cartCount}
        setView={setView}
        theme={theme}
        toggleTheme={() => setTheme((current) => current === "light" ? "dark" : "light")}
      />
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

function Header({ cartCount, setView, theme, toggleTheme }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => setView("home")}>
        <img src={logoImage} alt="Glowify logo" />
        <span>Glowify</span>
      </button>
      <nav>
        <button onClick={() => setView("home")}>Home</button>
        <button onClick={() => setView("shop")}>Shop</button>
        <button onClick={() => setView("contact")}>Contact</button>
      </nav>
      <div className="header-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Use light mode" : "Use dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>
        <button className="cart-button" onClick={() => setView("cart")} aria-label="Cart">
          <ShoppingBag size={19} />
          <span>{cartCount}</span>
        </button>
      </div>
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
            Gentle everyday routines: serums, creams, and sets that care for your skin,
            calm it, and help it glow visibly.
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setView("shop")}>
              <ShoppingBag size={18} />
              View Shop
            </button>
            <button className="ghost-button" onClick={() => setView("cart")}>
              Checkout
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <span className="hero-petal hero-petal-one" aria-hidden="true" />
          <span className="hero-petal hero-petal-two" aria-hidden="true" />
          <div className="hero-image-glow">
            <img className="hero-image" src={mainImage} alt="Glowify skincare products" />
          </div>
          <div className="hero-note">
            <Sparkles size={17} aria-hidden="true" />
            <span><strong>Soft care</strong> for your daily glow</span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <span className="eyebrow">Best deals</span>
          <h2>Popular Glowify Products</h2>
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
        <h1>Glowify Products</h1>
        <p>Choose a product. With "Buy Now", it goes straight into your cart.</p>
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
                Buy Now
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
          <h1>Cart and Payment</h1>
        </div>
        {cart.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={34} />
            <h2>Your cart is empty.</h2>
            <button className="primary-button" onClick={() => setView("shop")}>
              View Shop
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
                  <button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity">
                    <Minus size={15} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity">
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
        <h2>Payment</h2>
        <div className="totals">
          <span>Subtotal <strong>{formatPrice(subtotal)}</strong></span>
          <span>Shipping <strong>{shipping === 0 ? "Free" : formatPrice(shipping)}</strong></span>
          <span className="total">Total <strong>{formatPrice(total)}</strong></span>
        </div>
        <form onSubmit={handleSubmit}>
          <input required placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input required placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <input required placeholder="Name on card" value={form.cardName} onChange={(event) => setForm({ ...form, cardName: event.target.value })} />
          <input required inputMode="numeric" placeholder="Card number" value={form.cardNumber} onChange={(event) => setForm({ ...form, cardNumber: event.target.value })} />
          <div className="two-fields">
            <input required placeholder="MM/JJ" value={form.expiry} onChange={(event) => setForm({ ...form, expiry: event.target.value })} />
            <input required inputMode="numeric" placeholder="CVC" value={form.cvc} onChange={(event) => setForm({ ...form, cvc: event.target.value })} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full" disabled={cart.length === 0 || loading}>
            <CreditCard size={18} />
            {loading ? "Processing payment..." : "Pay Now"}
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
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData))
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Your message could not be sent.");
        return;
      }
    } catch {
      setError("");
    }

    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <section className="section contact-layout">
      <div className="contact-info">
        <span className="eyebrow">Contact</span>
        <h1>Contact Our Team</h1>
        <p>We can help with questions about products, routines, and orders.</p>
        <p><Mail size={18} /> razidorra@glowify.com</p>
        <p><MapPin size={18} /> Glowify Shop, Buchholz, Germany</p>
      </div>
      <form className="contact-form" onSubmit={submit}>
        <input required name="name" placeholder="Full Name" />
        <input required name="email" type="email" placeholder="Email Address" />
        <textarea required name="message" placeholder="Your Message" rows="6" />
        {sent && <p className="form-success">Thank you, your message has been sent.</p>}
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
      <h1>Order Complete</h1>
      <p>Thank you for shopping with us. Your demo payment was accepted.</p>
      {order && (
        <div className="order-box">
          <span>Order number <strong>{order.id}</strong></span>
          <span>Total <strong>{formatPrice(order.total)}</strong></span>
        </div>
      )}
      <button className="primary-button" onClick={() => setView("shop")}>
        Continue Shopping
      </button>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const submitNewsletter = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      setMessage(response.ok ? "Thank you for signing up." : "Please check your email address.");
      if (response.ok) setEmail("");
    } catch {
      setMessage("Thank you for signing up.");
      setEmail("");
    }
  };

  return (
    <footer>
      <div>
        <h3><Sparkles size={19} /> Glowify</h3>
        <p>Skincare guides, consultations, and carefully curated glow routines.</p>
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
