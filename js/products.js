/* =====================================================
   SHOPVERSE - Products Page JavaScript
   =====================================================
   PURPOSE: Logic for displaying, filtering, and sorting
   products on the products.html page.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. MOCK PRODUCT DATA (If empty in storage)
  // =========================================
  const initialProducts = [
    { id: 1, name: 'ProBuds X1 Wireless Headphones', price: 2999, oldPrice: 3799, category: 'Electronics', rating: 4.9, reviewCount: 128, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' },
    { id: 2, name: 'Chrono Smart Watch Pro', price: 4499, oldPrice: null, category: 'Accessories', rating: 4.5, reviewCount: 89, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80' },
    { id: 3, name: 'AeroRun Ultra Sports Shoes', price: 3299, oldPrice: 4999, category: 'Sports', rating: 4.8, reviewCount: 256, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80' },
    { id: 4, name: 'Elite Leather Crossbody Bag', price: 1899, oldPrice: null, category: 'Fashion', rating: 4.3, reviewCount: 67, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80' },
    { id: 5, name: 'Minimalist Desk Lamp', price: 1299, oldPrice: 1599, category: 'Home & Living', rating: 4.6, reviewCount: 42, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80' },
    { id: 6, name: '4K Ultra HD Action Camera', price: 8999, oldPrice: 10999, category: 'Electronics', rating: 4.7, reviewCount: 315, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&auto=format&fit=crop&q=80' },
    { id: 7, name: 'Classic Aviator Sunglasses', price: 999, oldPrice: 1499, category: 'Accessories', rating: 4.2, reviewCount: 55, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=80' },
    { id: 8, name: 'Yoga Mat Pro Anti-Slip', price: 799, oldPrice: null, category: 'Sports', rating: 4.9, reviewCount: 410, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80' },
    { id: 9, name: 'Cotton Crew Neck T-Shirt', price: 499, oldPrice: 799, category: 'Fashion', rating: 4.1, reviewCount: 88, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80' },
    { id: 10, name: 'Ceramic Coffee Mug Set', price: 899, oldPrice: null, category: 'Home & Living', rating: 4.8, reviewCount: 120, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80' },
    { id: 11, name: 'The Alchemist (Book)', price: 299, oldPrice: 399, category: 'Books', rating: 4.8, reviewCount: 150, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80' },
    { id: 12, name: 'Atomic Habits (Book)', price: 450, oldPrice: 550, category: 'Books', rating: 4.9, reviewCount: 320, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80' }
  ];

  // Save to local storage if not exists
  let allProducts = getFromStorage('shopverse_products');
  const hasLegacy = allProducts && allProducts.some(function(p) {
    return p.image && !p.image.startsWith('http') && !p.image.startsWith('data:') && !p.image.startsWith('images/') && !p.image.startsWith('./images/');
  });
  if (hasLegacy) {
    allProducts = null;
    removeFromStorage('shopverse_products');
  }
  if (!allProducts) {
    saveToStorage('shopverse_products', initialProducts);
    allProducts = initialProducts;
  }

  let currentProducts = [...allProducts]; // Array we use for rendering

  // =========================================
  // 2. DOM ELEMENTS
  // =========================================
  const productsGrid = document.getElementById('productsGrid');
  const productsCount = document.getElementById('productsCount');
  
  // Filter Elements
  const categoryCheckboxes = document.querySelectorAll('#categoryFilters input[type="checkbox"]');
  const priceSlider = document.getElementById('priceSlider');
  const priceLabel = document.getElementById('priceLabel');
  const ratingRadios = document.querySelectorAll('input[name="rating"]');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  
  // Sort Element
  const sortSelect = document.getElementById('sortSelect');

  // Mobile Filter Toggle
  const mobileFilterBtn = document.getElementById('mobileFilterBtn');
  const productsSidebar = document.getElementById('productsSidebar');

  // =========================================
  // 3. RENDER PRODUCTS FUNCTION
  // =========================================
  function renderProducts(products) {
    productsGrid.innerHTML = ''; // Clear current grid

    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1;" class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search query.</p>
          <button class="btn btn-primary" onclick="document.getElementById('resetFiltersBtn').click()">Clear Filters</button>
        </div>
      `;
      productsCount.textContent = `Showing 0 results`;
      return;
    }

    productsCount.textContent = `Showing ${products.length} result${products.length > 1 ? 's' : ''}`;

    products.forEach((product, index) => {
      // Calculate discount badge if there's an old price
      let badgeHtml = '';
      if (product.oldPrice) {
        const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        badgeHtml = `<span class="product-badge">-${discount}%</span>`;
      }

      // Generate HTML string for the product card
      const cardHtml = `
        <div class="product-card" data-index="${index}" onclick="location.href='product-details.html?id=${product.id}'">
          <div class="product-image" style="background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(245,158,11,0.05));">
            ${badgeHtml}
            <div class="product-actions">
              <button class="product-action-btn btn-wishlist-toggle" data-id="${product.id}" title="Add to Wishlist">♡</button>
            </div>
            ${getProductImageHtml(product.image, product.name, 'product-card-img')}
          </div>
          <div class="product-info">
            <p class="product-category">${product.category}</p>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-rating">
              <span class="product-stars">${getStarsHtml(product.rating)}</span>
              <span class="product-rating-count">(${product.reviewCount || 0})</span>
            </div>
            <div class="product-price-row">
              <div>
                <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
                ${product.oldPrice ? `<span class="product-old-price">₹${product.oldPrice.toLocaleString('en-IN')}</span>` : ''}
              </div>
              <button class="product-cart-btn btn-add-cart-quick" data-id="${product.id}" title="Add to Cart">+</button>
            </div>
          </div>
        </div>
      `;
      
      // We use insertAdjacentHTML to append the string as actual HTML nodes
      productsGrid.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Attach event listeners to newly created buttons
    attachCardButtonEvents();
  }

  // Helper to generate star HTML
  function getStarsHtml(rating) {
    let html = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for(let i=0; i<5; i++) {
      if (i < fullStars) html += '★';
      else if (i === fullStars && halfStar) html += '★'; // Simplify half star to full for now
      else html += '☆';
    }
    return html;
  }

  // Helper to attach events to dynamic buttons
  function attachCardButtonEvents() {
    const cartBtns = document.querySelectorAll('.btn-add-cart-quick');
    cartBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent clicking the card
        const productId = parseInt(btn.getAttribute('data-id'));
        const product = allProducts.find(p => p.id === productId);
        if(product) addToCart(product);
      });
    });

    const wishlistBtns = document.querySelectorAll('.btn-wishlist-toggle');
    wishlistBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(btn.getAttribute('data-id'));
        const product = allProducts.find(p => p.id === productId);
        if(product) toggleWishlist(product);
      });
    });
  }


  // =========================================
  // 4. FILTER & SORT LOGIC
  // =========================================
  function applyFiltersAndSort() {
    // 1. Search Query (Optional, if you link a search bar)
    const searchQuery = getUrlParameter('search') || '';
    
    // 2. Category Checkboxes
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    // Also check URL parameters for category (e.g., from home page clicks)
    const urlCategory = getUrlParameter('category');
    if (urlCategory && selectedCategories.length === 0) {
      // Find the checkbox matching the URL param and check it (case insensitive)
      categoryCheckboxes.forEach(cb => {
        if (cb.value.toLowerCase() === urlCategory.toLowerCase()) {
          cb.checked = true;
          selectedCategories.push(cb.value);
        }
      });
    }

    // 3. Price Slider
    const maxPrice = parseInt(priceSlider.value);

    // 4. Rating Radios
    const selectedRating = parseInt(document.querySelector('input[name="rating"]:checked').value);

    // FILTER THE ARRAY
    currentProducts = allProducts.filter(product => {
      // Search match
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      // Category match (if none selected, show all)
      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      // Price match
      const matchPrice = product.price <= maxPrice;
      // Rating match
      const matchRating = product.rating >= selectedRating;

      return matchSearch && matchCategory && matchPrice && matchRating;
    });

    // SORT THE ARRAY
    const sortValue = sortSelect.value;
    if (sortValue === 'price-low') {
      currentProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-high') {
      currentProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'rating') {
      currentProducts.sort((a, b) => b.rating - a.rating);
    } else {
      // Default / Featured (sort by ID or just original order)
      currentProducts.sort((a, b) => a.id - b.id);
    }

    renderProducts(currentProducts);
  }

  // =========================================
  // 5. EVENT LISTENERS FOR FILTERS
  // =========================================
  
  // Category checkboxes
  categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', applyFiltersAndSort);
  });

  // Price slider (input event fires as you drag)
  priceSlider.addEventListener('input', function() {
    priceLabel.textContent = `₹${parseInt(this.value).toLocaleString('en-IN')}`;
  });
  // change event fires when you release the mouse
  priceSlider.addEventListener('change', applyFiltersAndSort);

  // Rating radios
  ratingRadios.forEach(radio => {
    radio.addEventListener('change', applyFiltersAndSort);
  });

  // Sort dropdown
  sortSelect.addEventListener('change', applyFiltersAndSort);

  // Reset Filters button
  resetFiltersBtn.addEventListener('click', function() {
    categoryCheckboxes.forEach(cb => cb.checked = false);
    priceSlider.value = 10000;
    priceLabel.textContent = `₹10,000`;
    ratingRadios[2].checked = true; // "Any rating"
    sortSelect.value = 'featured';
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    
    applyFiltersAndSort();
  });

  // Mobile sidebar toggle
  if (mobileFilterBtn && productsSidebar) {
    mobileFilterBtn.addEventListener('click', function() {
      productsSidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 992 && 
          productsSidebar.classList.contains('open') && 
          !productsSidebar.contains(e.target) && 
          e.target !== mobileFilterBtn && 
          !mobileFilterBtn.contains(e.target)) {
        productsSidebar.classList.remove('open');
      }
    });
  }

  // =========================================
  // 6. HELPER: GET URL PARAMETERS
  // =========================================
  // e.g., products.html?category=electronics → returns "electronics"
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  // =========================================
  // 7. INITIAL RENDER
  // =========================================
  applyFiltersAndSort();

  // Listen for Supabase products synced event to reload and re-render
  document.addEventListener('supabase_products_synced', function () {
    const updatedProducts = typeof getFromStorage === 'function' ? getFromStorage('shopverse_products') : null;
    if (updatedProducts && updatedProducts.length > 0) {
      allProducts = updatedProducts;
      applyFiltersAndSort();
    }
  });

});
