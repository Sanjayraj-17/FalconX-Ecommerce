/* =====================================================
   SHOPVERSE - Home Page JavaScript
   =====================================================
   PURPOSE: Logic that runs ONLY on the home page.
   
   WHAT'S INSIDE:
   1. Countdown timer for the deals section
   2. Newsletter form handler
   3. Product card button handlers (Add to Cart, Wishlist)
   ===================================================== */


// Wait until the page HTML is fully loaded
document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. COUNTDOWN TIMER
  // =========================================
  // Shows how much time is left in the sale.
  // We set a target date 7 days from now.

  function startCountdown() {
    // Set the sale end date to 7 days from now
    const saleEnd = new Date();
    saleEnd.setDate(saleEnd.getDate() + 7);

    function updateTimer() {
      const now = new Date();
      // Difference in milliseconds
      const diff = saleEnd - now;

      if (diff <= 0) {
        // Sale has ended
        document.getElementById('countDays').textContent = '00';
        document.getElementById('countHours').textContent = '00';
        document.getElementById('countMins').textContent = '00';
        document.getElementById('countSecs').textContent = '00';
        return;
      }

      // Convert milliseconds to days, hours, minutes, seconds
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      // Update the HTML elements
      // padStart(2, '0') adds a leading zero: 5 → "05"
      document.getElementById('countDays').textContent = String(days).padStart(2, '0');
      document.getElementById('countHours').textContent = String(hours).padStart(2, '0');
      document.getElementById('countMins').textContent = String(mins).padStart(2, '0');
      document.getElementById('countSecs').textContent = String(secs).padStart(2, '0');
    }

    // Run immediately, then every 1 second (1000 milliseconds)
    updateTimer();
    setInterval(updateTimer, 1000);
  }

  startCountdown();


  // =========================================
  // 2. NEWSLETTER FORM
  // =========================================
  // When the user submits their email, we save it
  // and show a success toast message.

  const newsletterForm = document.getElementById('newsletterForm');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (event) {
      // preventDefault stops the page from refreshing
      // (forms normally refresh the page when submitted)
      event.preventDefault();

      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput.value.trim();

      if (email) {
        // Save subscriber to Local Storage
        const subscribers = getFromStorage('shopverse_subscribers') || [];
        
        // Check if already subscribed
        if (subscribers.includes(email)) {
          showToast('You are already subscribed!', 'info');
        } else {
          subscribers.push(email);
          saveToStorage('shopverse_subscribers', subscribers);
          showToast('Thanks for subscribing! 🎉', 'success');
          emailInput.value = ''; // Clear the input
        }
      }
    });
  }


  // =========================================
  // 3. PRODUCT CARD INTERACTIONS
  // =========================================
  // Handle Add to Cart and Wishlist buttons
  // on the featured product cards.

  // Sample product data (later this will come from Local Storage)
  const sampleProducts = [
    {
      id: 1,
      name: 'ProBuds X1 Wireless Headphones',
      price: 2999,
      oldPrice: 3799,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Chrono Smart Watch Pro',
      price: 4499,
      oldPrice: null,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
      rating: 4.5
    },
    {
      id: 3,
      name: 'AeroRun Ultra Sports Shoes',
      price: 3299,
      oldPrice: 4999,
      category: 'Sports',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80',
      rating: 4.8
    },
    {
      id: 4,
      name: 'Elite Leather Crossbody Bag',
      price: 1899,
      oldPrice: null,
      category: 'Fashion',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80',
      rating: 4.3
    }
  ];

  // Save sample products to Local Storage if not already there
  let existingProds = getFromStorage('shopverse_products');
  const hasLegacy = existingProds && existingProds.some(function(p) {
    return p.image && !p.image.startsWith('http') && !p.image.startsWith('data:') && !p.image.startsWith('images/') && !p.image.startsWith('./images/');
  });
  if (hasLegacy) {
    existingProds = null;
    removeFromStorage('shopverse_products');
  }
  if (!existingProds) {
    saveToStorage('shopverse_products', sampleProducts);
  }

  // Add to Cart buttons (the "+" buttons)
  const cartButtons = document.querySelectorAll('.product-cart-btn');
  cartButtons.forEach(function (btn, index) {
    btn.addEventListener('click', function (event) {
      // stopPropagation prevents the card click from firing too
      event.stopPropagation();
      if (sampleProducts[index]) {
        addToCart(sampleProducts[index]);
      }
    });
  });

  // Wishlist buttons (the "♡" buttons)
  const wishlistButtons = document.querySelectorAll('.product-action-btn');
  wishlistButtons.forEach(function (btn) {
    if (btn.title === 'Add to Wishlist') {
      btn.addEventListener('click', function (event) {
        event.stopPropagation();
        // Find which product card this button belongs to
        const card = btn.closest('.product-card');
        const cardIndex = Array.from(document.querySelectorAll('.product-card')).indexOf(card);
        if (sampleProducts[cardIndex]) {
          toggleWishlist(sampleProducts[cardIndex]);
        }
      });
    }
  });

});
