/* =====================================================
   SHOPVERSE - Wishlist Page JavaScript
   =====================================================
   PURPOSE: Manage the wishlist. This file handles:
   
   1. Loading wishlist items from Local Storage
   2. Rendering wishlist cards in a grid
   3. Removing items from wishlist
   4. Moving items from wishlist to cart
   5. Clearing the entire wishlist
   6. Showing empty wishlist state
   
   WHAT IS THE WISHLIST?
   ---------------------
   The "wishlist" is an ARRAY of product objects stored 
   in Local Storage under the key "shopverse_wishlist".
   
   Each object is the same as a product:
   { id: 1, name: "Headphones", price: 2999, ... }
   
   The difference from the cart:
   - Cart items have a "quantity" property
   - Wishlist items do NOT have quantity (just saved products)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. DOM ELEMENTS
  // =========================================
  const wishlistGrid = document.getElementById('wishlistGrid');
  const wishlistCount = document.getElementById('wishlistCount');
  const wishlistHeader = document.getElementById('wishlistHeader');
  const clearWishlistBtn = document.getElementById('clearWishlistBtn');


  // =========================================
  // 2. LOAD WISHLIST FROM LOCAL STORAGE
  // =========================================
  let wishlistItems = getFromStorage('shopverse_wishlist') || [];


  // =========================================
  // 3. RENDER THE WISHLIST
  // =========================================
  function renderWishlist() {
    // Re-read from storage
    wishlistItems = getFromStorage('shopverse_wishlist') || [];

    // Update the item count text
    wishlistCount.textContent = `(${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''})`;

    // EMPTY STATE
    if (wishlistItems.length === 0) {
      // Hide the "Clear All" button when empty
      clearWishlistBtn.style.display = 'none';
      
      wishlistGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💝</div>
          <h2>Your wishlist is empty</h2>
          <p>Save items you love by clicking the heart icon on any product. They'll appear here!</p>
          <a href="products.html" class="btn btn-primary">Discover Products</a>
        </div>
      `;
      return;
    }

    // Show the "Clear All" button
    clearWishlistBtn.style.display = 'block';

    // ---- BUILD WISHLIST CARDS ----
    let html = '';

    wishlistItems.forEach(item => {
      // Generate star rating HTML
      const starsHtml = getStarsHtml(item.rating || 0);

      html += `
        <div class="wishlist-card" data-id="${item.id}">
          
          <!-- Product Image -->
          <div class="wishlist-card-image">
            <button class="wishlist-remove-btn" data-id="${item.id}" title="Remove from Wishlist">✕</button>
            ${getProductImageHtml(item.image, item.name, 'wishlist-card-img')}
          </div>
          
          <!-- Product Info -->
          <div class="wishlist-card-info">
            <span class="wishlist-card-category">${item.category || 'General'}</span>
            <h3 class="wishlist-card-name">${item.name}</h3>
            
            <div class="wishlist-card-rating">
              <span class="stars">${starsHtml}</span>
              <span class="count">(${item.reviewCount || 0})</span>
            </div>
            
            <div>
              <span class="wishlist-card-price">₹${item.price.toLocaleString('en-IN')}</span>
              ${item.oldPrice ? `<span class="wishlist-card-old-price">₹${item.oldPrice.toLocaleString('en-IN')}</span>` : ''}
            </div>
            
            <!-- Action Buttons -->
            <div class="wishlist-card-actions">
              <button class="move-to-cart-btn" data-id="${item.id}">
                🛒 Move to Cart
              </button>
            </div>
          </div>
          
        </div>
      `;
    });

    wishlistGrid.innerHTML = html;

    // Attach events to the new buttons
    attachWishlistEvents();
  }


  // =========================================
  // 4. HELPER: GENERATE STAR HTML
  // =========================================
  function getStarsHtml(rating) {
    let html = '';
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      html += i < fullStars ? '★' : '☆';
    }
    return html;
  }


  // =========================================
  // 5. ATTACH EVENT LISTENERS
  // =========================================
  function attachWishlistEvents() {

    // REMOVE buttons (✕ on each card)
    document.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation(); // Don't trigger card click
        const id = parseInt(this.getAttribute('data-id'));
        removeFromWishlist(id);
      });
    });

    // MOVE TO CART buttons
    document.querySelectorAll('.move-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const id = parseInt(this.getAttribute('data-id'));
        moveToCart(id);
      });
    });
  }


  // =========================================
  // 6. REMOVE FROM WISHLIST
  // =========================================
  /*
    Removes a single item from the wishlist by its ID.
    Steps:
    1. Load wishlist from storage
    2. Filter out the item with the matching ID
    3. Save the filtered array back
    4. Re-render the page
  */
  function removeFromWishlist(id) {
    let wishlist = getFromStorage('shopverse_wishlist') || [];
    wishlist = wishlist.filter(item => item.id !== id);
    saveToStorage('shopverse_wishlist', wishlist);
    
    // Update the wishlist badge in the navbar
    updateWishlistBadge();
    
    showToast('Removed from wishlist', 'info');
    renderWishlist();
  }


  // =========================================
  // 7. MOVE TO CART
  // =========================================
  /*
    Takes an item from the wishlist and adds it to the cart.
    Steps:
    1. Find the product in the wishlist
    2. Add it to the cart (using the global addToCart function)
    3. Remove it from the wishlist
    4. Re-render the page
  */
  function moveToCart(id) {
    let wishlist = getFromStorage('shopverse_wishlist') || [];
    const product = wishlist.find(item => item.id === id);
    
    if (!product) return;

    // Add to cart (function from global.js)
    addToCart(product);

    // Remove from wishlist
    wishlist = wishlist.filter(item => item.id !== id);
    saveToStorage('shopverse_wishlist', wishlist);
    updateWishlistBadge();

    showToast('Moved to cart! 🛒', 'success');
    renderWishlist();
  }


  // =========================================
  // 8. CLEAR ALL WISHLIST
  // =========================================
  /*
    Removes ALL items from the wishlist at once.
    We ask for confirmation first so the user
    doesn't accidentally delete everything.
  */
  clearWishlistBtn.addEventListener('click', function () {
    if (wishlistItems.length === 0) return;

    // confirm() shows a browser popup asking "Are you sure?"
    const confirmed = confirm('Are you sure you want to clear your entire wishlist?');
    
    if (confirmed) {
      saveToStorage('shopverse_wishlist', []);
      updateWishlistBadge();
      showToast('Wishlist cleared', 'info');
      renderWishlist();
    }
  });


  // =========================================
  // 9. INITIAL RENDER
  // =========================================
  renderWishlist();

});
