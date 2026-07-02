import serumImage from "../images/serum.jpeg";
import nightCreamImage from "../images/Nacht cream.jpeg";
import trioImage from "../images/psck.jpeg";
import packImage from "../images/pack.jpeg";
import essentialImage from "../images/essential.jpeg";
import nightPackImage from "../images/nightpack.jpeg";
import dealImage from "../images/deall.jpg";
import bestDealImage from "../images/bestdeal.jpg";

export const products = [
  {
    id: "serum",
    name: "Radiant Glow Serum",
    price: 59.99,
    image: serumImage,
    badge: "Bestseller",
    category: "Serum",
    description: "Transforms dull skin into soft, luminous radiance."
  },
  {
    id: "nourishing-cream",
    name: "Nourishing Cream",
    price: 75.99,
    image: nightCreamImage,
    badge: "Night care",
    category: "Cream",
    description: "Deep overnight repair with a rich, fast-absorbing texture."
  },
  {
    id: "trio",
    name: "Glowify Trio",
    price: 129.99,
    image: trioImage,
    badge: "Routine",
    category: "Set",
    description: "A gentle trio that leaves skin balanced, hydrated, and glowing."
  },
  {
    id: "daily-pack",
    name: "Glowify Pack",
    price: 168.99,
    image: packImage,
    badge: "Daily",
    category: "Set",
    description: "Your daily ritual for fresh, hydrated, radiant skin."
  },
  {
    id: "ritual",
    name: "The Glow Ritual",
    price: 199.99,
    image: essentialImage,
    badge: "Complete",
    category: "Set",
    description: "Nourishes, hydrates, and enhances your natural glow."
  },
  {
    id: "night-care",
    name: "Glowify Night Care",
    price: 179.99,
    image: nightPackImage,
    badge: "New",
    category: "Night",
    description: "Cream, serum, and mask to nourish and revitalize overnight."
  },
  {
    id: "essentials",
    name: "Glowify Essentials",
    price: 179.99,
    image: dealImage,
    badge: "New",
    category: "Set",
    description: "Complete skincare set for daily glow and hydration."
  },
  {
    id: "limited-glow-set",
    name: "Limited-Edition Glow Set",
    price: 270.99,
    image: bestDealImage,
    badge: "Limited",
    category: "Set",
    description: "Cleanser, serum, and moisturizer for radiant skin."
  }
];
