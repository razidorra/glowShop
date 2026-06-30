// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Redirect all "Buy Now" & "Shop Now" buttons to shop page
  const buyButtons = document.querySelectorAll(".btn");

  buyButtons.forEach((button) => {
    if (
      button.textContent.includes("Buy") ||
      button.textContent.includes("Shop")
    ) {
      button.addEventListener("click", () => {
        window.location.href = "produkt.html";
      });
    }
  });

  // Newsletter email validation
  const newsletterForm = document.querySelector("form");
  const emailInput = newsletterForm?.querySelector("input");

  if (newsletterForm && emailInput) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address 💌");
        return;
      }

      alert("Thank you for joining Glowify ✨");
      emailInput.value = "";
    });
  }

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // CARD HOVER EFFECT
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "scale(1.05)";
      card.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
      card.style.boxShadow = "0 15px 30px rgba(0,0,0,0.15)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "scale(1)";
      card.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
    });
  });

  // IMAGE CLICK ZOOM EFFECT
  const images = document.querySelectorAll(".card img");

  images.forEach((img) => {
    img.style.cursor = "pointer";

    img.addEventListener("click", (e) => {
      e.stopPropagation(); // verhindert Card-Click

      if (img.classList.contains("zoomed")) {
        img.classList.remove("zoomed");
      } else {
        img.classList.add("zoomed");
      }
    });
  });
});
