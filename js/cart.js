/* =====================================================
   SHOPVERSE - Cart Page JavaScript
   =====================================================
   PURPOSE: Manage the shopping cart. This file handles:
   
   1. Loading cart items from Local Storage
   2. Rendering cart items with product details
   3. Quantity increase/decrease
   4. Removing items from cart
   5. Calculating order totals (subtotal, discount, tax)
   6. Showing empty cart state
   
   WHAT IS THE CART?
   -----------------
   The "cart" is an ARRAY of objects stored in Local Storage.
   Each object looks like:
   { id: 1, name: "Headphones", price: 2999, quantity: 2, ... }
   
   When we "add to cart", we push an item into this array.
   When we "remove", we filter it out.
   When we change quantity, we update the item in the array.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. DOM ELEMENTS
  // =========================================
  const cartLayout = document.getElementById('cartLayout');
  /*
    'cartLayout' is the main container.
    We will fill it with:
    - A list of cart item cards (left column)
    - An order summary panel (right column)
    OR
    - An "empty cart" message if there's nothing in the cart
  */


  // =========================================
  // 2. LOAD CART DATA FROM LOCAL STORAGE
  // =========================================
  /*
    The cart is stored under the key "shopverse_cart".
    
    getFromStorage() is a helper function defined in 
    global.js that reads and parses JSON from Local Storage.
    
    If no cart exists yet, we get back null, 
    so we use || [] to default to an empty array.
  */
  let cartItems = getFromStorage('shopverse_cart') || [];


  // =========================================
  // 3. RENDER THE CART PAGE
  // =========================================
  /*
    This function checks if the cart has items:
    - If YES → show cart items + order summary
    - If NO  → show "Your cart is empty" message
    
    It's called once on page load, and again
    whenever the user changes quantity or removes an item.
  */
  function renderCart() {
    // Re-read from storage (in case another function updated it)
    cartItems = getFromStorage('shopverse_cart') || [];

    // EMPTY CART STATE
    if (cartItems.length === 0) {
      cartLayout.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
          <a href="products.html" class="btn btn-primary">Browse Products</a>
        </div>
      `;
      return; // Stop here — nothing else to render
    }

    // ---- BUILD THE CART ITEMS LIST ----
    /*
      We build the HTML as a long string, then insert it
      into the page all at once. This is more efficient
      than creating each element individually.
    */
    let itemsHtml = `
      <div class="cart-items-section">
        <h2 class="cart-title">Shopping Cart <span>(${cartItems.length} item${cartItems.length > 1 ? 's' : ''})</span></h2>
    `;

    // Loop through each cart item and create its card
    cartItems.forEach(item => {
      itemsHtml += `
        <div class="cart-item" data-id="${item.id}">
          
          <!-- Product Image -->
          <div class="cart-item-image">
            ${getProductImageHtml(item.image, item.name, 'cart-item-img')}
          </div>
          
          <!-- Product Info -->
          <div class="cart-item-info">
            <div>
              <span class="cart-item-category">${item.category || 'General'}</span>
              <h3 class="cart-item-name">${item.name}</h3>
            </div>
            <div>
              <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
              ${item.oldPrice ? `<span class="cart-item-old-price">₹${(item.oldPrice * item.quantity).toLocaleString('en-IN')}</span>` : ''}
              ${item.quantity > 1 ? `<span style="font-size: var(--fs-xs); color: var(--text-muted); display: block; margin-top: 2px;">₹${item.price.toLocaleString('en-IN')} each</span>` : ''}
            </div>
          </div>
          
          <!-- Quantity Controls + Delete -->
          <div class="cart-item-controls">
            <div class="quantity-control">
              <button class="qty-btn qty-decrease" data-id="${item.id}" title="Decrease quantity">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn qty-increase" data-id="${item.id}" title="Increase quantity">+</button>
            </div>
            <button class="cart-item-delete" data-id="${item.id}" title="Remove item">
              🗑️ Remove
            </button>
          </div>
          
        </div>
      `;
    });

    itemsHtml += '</div>'; // Close .cart-items-section

    // ---- BUILD THE ORDER SUMMARY ----
    /*
      Calculate the prices:
      - Subtotal: sum of (price × quantity) for each item
      - Discount: sum of savings from old prices
      - Shipping: free over ₹999, else ₹99
      - Tax: 0 (simplified for this project)
      - Total: subtotal - discount + shipping
    */
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const discount = cartItems.reduce((sum, item) => {
      if (item.oldPrice) {
        return sum + ((item.oldPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);

    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;

    const summaryHtml = `
      <div class="order-summary">
        <h3>Order Summary</h3>
        
        <div class="summary-row">
          <span>Subtotal (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})</span>
          <span>₹${subtotal.toLocaleString('en-IN')}</span>
        </div>
        
        ${discount > 0 ? `
        <div class="summary-row">
          <span>Discount</span>
          <span class="discount-text">- ₹${discount.toLocaleString('en-IN')}</span>
        </div>
        ` : ''}
        
        <div class="summary-row">
          <span>Shipping</span>
          <span>${shipping === 0 ? '<span style="color: #22c55e;">FREE</span>' : '₹' + shipping}</span>
        </div>
        
        ${shipping > 0 ? `
        <div style="font-size: var(--fs-xs); color: var(--text-muted); margin-top: 4px;">
          Add ₹${(999 - subtotal).toLocaleString('en-IN')} more for free shipping
        </div>
        ` : ''}
        
        <div class="summary-row total">
          <span>Total</span>
          <span>₹${total.toLocaleString('en-IN')}</span>
        </div>
        
        ${discount > 0 ? `
        <div style="font-size: var(--fs-sm); color: #22c55e; text-align: center; margin-top: var(--space-sm);">
          🎉 You're saving ₹${discount.toLocaleString('en-IN')} on this order!
        </div>
        ` : ''}
        
        <button class="checkout-btn" id="checkoutBtn">
          Proceed to Checkout →
        </button>
        
        <a href="products.html" class="continue-shopping">← Continue Shopping</a>
      </div>
    `;

    // ---- INSERT EVERYTHING INTO THE PAGE ----
    cartLayout.innerHTML = itemsHtml + summaryHtml;

    // ---- ATTACH EVENT LISTENERS ----
    /*
      Since we just created new HTML, we need to attach
      click handlers to the new buttons.
    */
    attachCartEvents();
  }


  // =========================================
  // 4. ATTACH EVENT LISTENERS TO CART BUTTONS
  // =========================================
  function attachCartEvents() {

    // DECREASE QUANTITY BUTTONS (−)
    document.querySelectorAll('.qty-decrease').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.getAttribute('data-id'));
        updateQuantity(id, -1);
      });
    });

    // INCREASE QUANTITY BUTTONS (+)
    document.querySelectorAll('.qty-increase').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.getAttribute('data-id'));
        updateQuantity(id, 1);
      });
    });

    // DELETE BUTTONS (🗑️ Remove)
    document.querySelectorAll('.cart-item-delete').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = parseInt(this.getAttribute('data-id'));
        removeFromCart(id);
      });
    });

    // CHECKOUT BUTTON
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        // Check if user is logged in
        const currentUser = getFromStorage('shopverse_currentUser');
        if (!currentUser) {
          showToast('Please login to checkout', 'warning');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        } else {
          // Navigate to checkout page
          window.location.href = 'checkout.html';
        }
      });
    }
  }


  // =========================================
  // 5. QUANTITY UPDATE FUNCTION
  // =========================================
  /*
    Parameters:
    - id:     The product's unique ID number
    - change: +1 (increase) or -1 (decrease)
    
    How it works:
    1. Find the item in the cart array by its ID
    2. Add the change to its quantity
    3. If quantity drops to 0, remove the item
    4. Save the updated cart back to Local Storage
    5. Re-render the page to show the changes
  */
  function updateQuantity(id, change) {
    let cart = getFromStorage('shopverse_cart') || [];
    
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex === -1) return; // Item not found

    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
      // Remove the item if quantity is 0 or less
      cart.splice(itemIndex, 1);
      showToast('Item removed from cart', 'info');
    }

    // Save updated cart
    saveToStorage('shopverse_cart', cart);
    
    // Update the badge count in the navbar
    updateCartBadge();
    
    // Re-render to show new quantities/totals
    renderCart();
  }


  // =========================================
  // 6. REMOVE ITEM FUNCTION
  // =========================================
  /*
    Completely removes an item from the cart,
    regardless of its quantity.
  */
  function removeFromCart(id) {
    let cart = getFromStorage('shopverse_cart') || [];
    
    // filter() creates a NEW array WITHOUT the removed item
    cart = cart.filter(item => item.id !== id);
    
    saveToStorage('shopverse_cart', cart);
    updateCartBadge();
    showToast('Item removed from cart', 'info');
    renderCart();
  }


  // =========================================
  // 7. INITIAL RENDER
  // =========================================
  /*
    Call renderCart() when the page first loads.
    This reads the cart from Local Storage and
    displays everything on the page.
  */
  renderCart();

});
