/* =====================================================
   SHOPVERSE - Product Details Page JavaScript
   =====================================================
   PURPOSE: Load a single product's data based on the URL,
   handle quantity selection, and add to cart.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. GET PRODUCT ID FROM URL
  // =========================================
  // e.g., product-details.html?id=3 → returns "3"
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));

  // =========================================
  // 2. FETCH PRODUCT DATA FROM LOCAL STORAGE
  // =========================================
  const allProducts = getFromStorage('shopverse_products') || [];
  const product = allProducts.find(p => p.id === productId);

  // If product not found, show error
  if (!product) {
    document.getElementById('productContainer').innerHTML = `
      <div class="no-results" style="margin-top: 50px;">
        <div class="no-results-icon">⚠️</div>
        <h3>Product Not Found</h3>
        <p>The product you are looking for does not exist or has been removed.</p>
        <a href="products.html" class="btn btn-primary" style="margin-top: 20px;">Back to Products</a>
      </div>
    `;
    return; // Stop executing the rest of the script
  }

  // =========================================
  // 3. POPULATE HTML WITH PRODUCT DATA
  // =========================================
  
  // Set Title and Category
  document.title = `${product.name} — FalconX`;
  document.getElementById('pdTitle').textContent = product.name;
  document.getElementById('pdCategory').textContent = product.category;
  
  // Set Price
  document.getElementById('pdPrice').textContent = `₹${product.price.toLocaleString('en-IN')}`;
  
  // Set Old Price and Badge if exists
  if (product.oldPrice) {
    document.getElementById('pdOldPrice').textContent = `₹${product.oldPrice.toLocaleString('en-IN')}`;
    const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    const badge = document.getElementById('pdBadge');
    badge.textContent = `${discount}% OFF`;
    badge.classList.remove('hidden');
  }

  // Set Rating Stars and Count
  const fullStars = Math.floor(product.rating);
  const halfStar = product.rating % 1 >= 0.5;
  let starsHtml = '';
  for(let i=0; i<5; i++) {
    if (i < fullStars) starsHtml += '★';
    else if (i === fullStars && halfStar) starsHtml += '★'; // Simplify to full
    else starsHtml += '☆';
  }
  document.getElementById('pdStars').textContent = starsHtml;
  document.getElementById('pdReviews').textContent = `(${product.reviewCount} reviews)`;

  // Set Description
  document.getElementById('pdDescription').innerHTML = `
    Experience premium quality with the ${product.name}. 
    Designed for excellence and durability, this is a must-have for anyone looking for the best in ${product.category}.
    <br><br>
    Features:<br>
    - High-quality materials<br>
    - Modern and sleek design<br>
    - 1-Year manufacturer warranty
  `;

  // Set Image Gallery
  document.getElementById('mainImage').innerHTML = getProductImageHtml(product.image, product.name, 'pd-main-img');
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach(thumb => {
    thumb.innerHTML = getProductImageHtml(product.image, product.name, 'pd-thumb-img');
    // Simple click effect for thumbnails
    thumb.addEventListener('click', function() {
      thumbnails.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      // In a real app, this would change the mainImage source
    });
  });


  // =========================================
  // 4. QUANTITY SELECTOR LOGIC
  // =========================================
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');

  qtyMinus.addEventListener('click', () => {
    let currentVal = parseInt(qtyInput.value);
    if (currentVal > 1) {
      qtyInput.value = currentVal - 1;
    }
  });

  qtyPlus.addEventListener('click', () => {
    let currentVal = parseInt(qtyInput.value);
    if (currentVal < 10) { // Max 10 items
      qtyInput.value = currentVal + 1;
    }
  });

  // Prevent typing negative numbers or non-numbers
  qtyInput.addEventListener('change', () => {
    let val = parseInt(qtyInput.value);
    if (isNaN(val) || val < 1) qtyInput.value = 1;
    if (val > 10) qtyInput.value = 10;
  });


  // =========================================
  // 5. ADD TO CART & WISHLIST BUTTONS
  // =========================================
  const addToCartBtn = document.getElementById('addToCartBtn');
  addToCartBtn.addEventListener('click', () => {
    // We clone the product so we don't modify the original array by reference
    const productToAdd = { ...product };
    // Get selected quantity
    productToAdd.quantity = parseInt(qtyInput.value);
    
    // Check if it's already in the cart to increase quantity properly
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === productToAdd.id);
    
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += productToAdd.quantity;
      saveCart(cart);
      showToast(`Added ${productToAdd.quantity} more to cart!`, 'success');
    } else {
      cart.push(productToAdd);
      saveCart(cart);
      showToast(`Added to cart!`, 'success');
    }
  });

  const addToWishlistBtn = document.getElementById('addToWishlistBtn');
  addToWishlistBtn.addEventListener('click', () => {
    toggleWishlist(product);
  });


  // =========================================
  // 6. TABS LOGIC (Description, Specs, Reviews)
  // =========================================
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked button
      btn.classList.add('active');

      // Show corresponding content
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

});
