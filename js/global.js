/* =====================================================
   SHOPVERSE - Global JavaScript
   =====================================================
   PURPOSE: Shared logic used by EVERY page.
   
   WHAT'S INSIDE:
   1. Loading screen handler
   2. Navbar scroll effect
   3. Mobile menu toggle
   4. Toast notification system
   5. Local Storage helper functions
   6. Cart & Wishlist badge updates
   ===================================================== */


/*
  ===== WHAT IS JavaScript? =====
  JavaScript makes web pages INTERACTIVE.
  HTML = structure, CSS = appearance, JS = behavior.
  
  When a user clicks a button, searches for a product,
  or adds something to cart — that's all JavaScript!
  
  ===== KEY CONCEPTS WE USE HERE =====
  
  1. VARIABLES: Store data. Like labeled boxes.
     - const = value that NEVER changes
     - let = value that CAN change
  
  2. FUNCTIONS: Reusable blocks of code.
     - function doSomething() { ... }
  
  3. DOM: Document Object Model.
     - The browser turns HTML into a "tree" of objects.
     - We use document.getElementById('id') to grab elements.
     - Then we can change them with JavaScript!
  
  4. EVENTS: Things that happen (click, scroll, submit).
     - element.addEventListener('click', function() { ... })
  
  5. LOCAL STORAGE: A tiny database in your browser.
     - localStorage.setItem('key', 'value') → SAVE
     - localStorage.getItem('key')           → READ
     - localStorage.removeItem('key')        → DELETE
     - Data is saved as STRINGS, so we use JSON to
       convert objects to strings and back.
*/


// =============================================
// 1. LOADING SCREEN
// =============================================
// When the page finishes loading, hide the spinner.
// 'window' represents the browser window.
// 'load' event fires when ALL content (images, CSS, etc.) is ready.

window.addEventListener('load', function () {
  const loader = document.getElementById('loadingScreen');
  if (loader) {
    // Wait a tiny moment so the animation looks smooth
    setTimeout(function () {
      loader.classList.add('hidden');
    }, 400);
  }
});


// =============================================
// 2. NAVBAR SCROLL EFFECT
// =============================================
// When the user scrolls down, we add a 'scrolled' class
// to the navbar to make its background more solid.

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', function () {
  if (window.scrollY > 50) {
    // scrollY = how many pixels the user has scrolled down
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});


// =============================================
// 3. MOBILE MENU TOGGLE
// =============================================
// On small screens, we show a hamburger icon.
// Clicking it opens/closes the mobile menu.

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');

if (hamburger) {
  hamburger.addEventListener('click', function () {
    // 'toggle' adds the class if missing, removes if present
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    menuOverlay.classList.toggle('show');
  });
}

// Close menu when clicking the dark overlay
if (menuOverlay) {
  menuOverlay.addEventListener('click', function () {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
  });
}


// =============================================
// 4. TOAST NOTIFICATION SYSTEM
// =============================================
// Toasts are small popup messages like:
// "Item added to cart!" or "Login successful!"
//
// HOW TO USE:
//   showToast('Item added to cart!', 'success');
//   showToast('Something went wrong', 'error');
//   showToast('Please log in first', 'warning');

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  // Pick an icon based on the type
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  // Create a new toast element
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML =
    '<span class="toast-icon">' + icons[type] + '</span>' +
    '<span class="toast-message">' + message + '</span>' +
    '<button class="toast-close">&times;</button>';

  // Add it to the container
  container.appendChild(toast);

  // Close button removes the toast
  toast.querySelector('.toast-close').addEventListener('click', function () {
    removeToast(toast);
  });

  // Auto-remove after 3 seconds
  setTimeout(function () {
    removeToast(toast);
  }, 3000);
}

function removeToast(toast) {
  toast.classList.add('removing');
  // Wait for the exit animation to finish, then delete
  setTimeout(function () {
    toast.remove();
  }, 300);
}


// =============================================
// 5. LOCAL STORAGE HELPER FUNCTIONS
// =============================================
/*
  ===== WHAT IS LOCAL STORAGE? =====
  
  Local Storage is a small "database" built into your browser.
  It stores data as KEY-VALUE pairs, like a dictionary:
  
    Key: "cart"     →  Value: "[{id:1, name:'Headphones'}]"
    Key: "user"     →  Value: "{name:'John', email:'john@email.com'}"
  
  IMPORTANT RULES:
  - Local Storage only stores STRINGS (text).
  - To save an object/array, convert it to a string: JSON.stringify()
  - To read it back as an object/array: JSON.parse()
  - Data survives page refresh and browser close!
  - Data stays ONLY on YOUR computer.
  
  HOW TO VIEW IT:
  1. Open your browser (Chrome)
  2. Press F12 (opens Developer Tools)
  3. Click the "Application" tab
  4. In the left sidebar, click "Local Storage"
  5. You'll see all saved keys and values!
*/

// SAVE data to Local Storage
function saveToStorage(key, data) {
  // JSON.stringify converts a JavaScript object to a text string
  localStorage.setItem(key, JSON.stringify(data));
}

// READ data from Local Storage
function getFromStorage(key) {
  const data = localStorage.getItem(key);
  // JSON.parse converts a text string back to a JavaScript object
  // If nothing was saved for this key, return null
  return data ? JSON.parse(data) : null;
}

// DELETE data from Local Storage
function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// Helper to render product image (handles both Emojis and URLs/Base64)
function getProductImageHtml(image, name, className = '') {
  if (!image) return '📦';
  image = image.trim();
  const isUrl = image.startsWith('http://') || 
                image.startsWith('https://') || 
                image.startsWith('data:image/') || 
                image.startsWith('images/') || 
                image.startsWith('./images/') || 
                image.includes('.jpg') || 
                image.includes('.png') || 
                image.includes('.webp') || 
                image.includes('.jpeg') ||
                image.includes('.gif') ||
                image.includes('.svg');
  if (isUrl) {
    return `<img src="${image}" alt="${name || 'Product Image'}" class="${className}" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit; display: block;">`;
  }
  // Return emoji inside a span
  return `<span class="emoji-img" style="font-size: 3.5rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${image}</span>`;
}


// =============================================
// 6. CART FUNCTIONS
// =============================================

// Get the current cart (or an empty array if cart doesn't exist yet)
function getCart() {
  return getFromStorage('shopverse_cart') || [];
}

// Save the cart
function saveCart(cart) {
  saveToStorage('shopverse_cart', cart);
  updateCartBadge();
}

// Add a product to the cart
function addToCart(product) {
  const cart = getCart();

  // Check if this product is already in the cart
  const existingIndex = cart.findIndex(function (item) {
    return item.id === product.id;
  });

  if (existingIndex !== -1) {
    // Product already in cart → increase quantity
    cart[existingIndex].quantity += 1;
    showToast('Quantity updated in cart!', 'success');
  } else {
    // New product → add it with quantity 1
    product.quantity = 1;
    cart.push(product);
    showToast('Added to cart!', 'success');
  }

  saveCart(cart);
}

// Update the cart badge number in the navbar
function updateCartBadge() {
  const cart = getCart();
  const badge = document.getElementById('cartBadge');
  if (badge) {
    // Count total items in cart
    const totalItems = cart.reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);

    badge.textContent = totalItems;
    if (totalItems > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}


// =============================================
// 7. WISHLIST FUNCTIONS
// =============================================

function getWishlist() {
  return getFromStorage('shopverse_wishlist') || [];
}

function saveWishlist(wishlist) {
  saveToStorage('shopverse_wishlist', wishlist);
  updateWishlistBadge();
}

function toggleWishlist(product) {
  const wishlist = getWishlist();

  const existingIndex = wishlist.findIndex(function (item) {
    return item.id === product.id;
  });

  if (existingIndex !== -1) {
    // Already in wishlist → remove it
    wishlist.splice(existingIndex, 1);
    showToast('Removed from wishlist', 'info');
  } else {
    // Not in wishlist → add it
    wishlist.push(product);
    showToast('Added to wishlist!', 'success');
  }

  saveWishlist(wishlist);
}

function updateWishlistBadge() {
  const wishlist = getWishlist();
  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    badge.textContent = wishlist.length;
    if (wishlist.length > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}


// =============================================
// 8. USER / AUTH HELPERS
// =============================================

function getCurrentUser() {
  return getFromStorage('shopverse_currentUser');
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}


// =============================================
// 9. INITIALIZE ON EVERY PAGE
// =============================================
// This runs when any page loads. Updates badges, etc.

document.addEventListener('DOMContentLoaded', function () {
  updateCartBadge();
  updateWishlistBadge();

  // If user is logged in, update profile icon link
  if (isLoggedIn()) {
    const userLink = document.getElementById('navUser');
    if (userLink) {
      userLink.href = 'profile.html';
    }
  }

  // =============================================
  // 10. GLOBAL SEARCH HANDLING
  // =============================================
  const searchInputs = Array.from(document.querySelectorAll('#navbarSearchInput, #searchInput, .mobile-search input'));
  const searchButtons = Array.from(document.querySelectorAll('.nav-search-btn, #searchBtn, #navbarSearchBtn'));

  function executeSearch(query) {
    if (query && query.trim() !== '') {
      window.location.href = `products.html?search=${encodeURIComponent(query.trim())}`;
    }
  }

  searchInputs.forEach(input => {
    // Retain search value in the input field when navigating on products page
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && window.location.pathname.includes('products.html')) {
      input.value = searchParam;
    }

    input.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        executeSearch(input.value);
      }
    });
  });

  searchButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const containerInput = btn.parentElement.querySelector('input');
      const query = containerInput ? containerInput.value : (searchInputs[0] ? searchInputs[0].value : '');
      executeSearch(query);
    });
  });

  // =============================================
  // 11. LOCAL STORAGE DATABASE MIGRATIONS
  // =============================================
  (function migrateProductDatabase() {
    const productsKey = 'shopverse_products';
    let productsData = localStorage.getItem(productsKey);
    if (productsData) {
      try {
        let products = JSON.parse(productsData);
        let updated = false;

        // A. Standardize 'Home' to 'Home & Living'
        products.forEach(p => {
          if (p.category === 'Home') {
            p.category = 'Home & Living';
            updated = true;
          }
        });

        // B. Seed 'Books' category products if they do not exist
        const hasBooks = products.some(p => p.category === 'Books');
        if (!hasBooks) {
          const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 11;
          products.push(
            { id: nextId, name: 'The Alchemist (Book)', price: 299, oldPrice: 399, category: 'Books', rating: 4.8, reviewCount: 150, image: '📚', description: 'A beautiful fable about following your dreams.' },
            { id: nextId + 1, name: 'Atomic Habits (Book)', price: 450, oldPrice: 550, category: 'Books', rating: 4.9, reviewCount: 320, image: '📖', description: 'An easy & proven way to build good habits & break bad ones.' }
          );
          updated = true;
        }

        // C. Seed 'Home & Living' category products if they do not exist
        const hasHomeLiving = products.some(p => p.category === 'Home & Living');
        if (!hasHomeLiving) {
          const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 13;
          products.push(
            { id: nextId, name: 'Minimalist Desk Lamp', price: 1299, oldPrice: 1599, category: 'Home & Living', rating: 4.6, reviewCount: 42, image: '💡', description: 'Sleek minimalist desk lamp with warm and cool light modes.' },
            { id: nextId + 1, name: 'Ceramic Coffee Mug Set', price: 899, oldPrice: null, category: 'Home & Living', rating: 4.8, reviewCount: 120, image: '☕', description: 'Set of 4 elegant ceramic mugs for your daily coffee.' }
          );
          updated = true;
        }

        if (updated) {
          localStorage.setItem(productsKey, JSON.stringify(products));
        }
      } catch (err) {
        console.error("Local storage database migration failed:", err);
      }
    }
  })();

  // =============================================
  // 12. DYNAMIC FOOTER CONTACT INFO PROPAGATION
  // =============================================
  (function updateFooterContactInfo() {
    const contactData = JSON.parse(localStorage.getItem('shopverse_siteContact'));
    if (!contactData) return;

    // Find the Contact Us footer column on the page
    const footerCols = document.querySelectorAll('.footer-col');
    let contactCol = null;
    footerCols.forEach(col => {
      const heading = col.querySelector('h4');
      if (heading && heading.textContent.trim().toLowerCase() === 'contact us') {
        contactCol = col;
      }
    });

    if (contactCol) {
      const listItems = contactCol.querySelectorAll('ul li');
      if (listItems.length >= 3) {
        // 1. Email Link
        if (contactData.email) {
          const emailLink = listItems[0].querySelector('a');
          if (emailLink) {
            emailLink.textContent = contactData.email;
            emailLink.href = 'mailto:' + contactData.email;
          }
        }
        // 2. Phone Link
        if (contactData.phone) {
          const phoneLink = listItems[1].querySelector('a');
          if (phoneLink) {
            phoneLink.textContent = contactData.phone;
            phoneLink.href = 'tel:' + contactData.phone.replace(/\s+/g, '');
          }
        }
        // 3. Address
        if (contactData.address) {
          const addressEl = listItems[2].querySelector('a') || listItems[2];
          if (addressEl) {
            addressEl.textContent = contactData.address;
          }
        }
      }
    }
  })();
});

