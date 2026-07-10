/* =====================================================
   SHOPVERSE - Categories Page JavaScript
   =====================================================
   PURPOSE: Dynamically fetch product categories from
   local storage, count items in each category, and render
   interactive cards that navigate to the products filters.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. CHOOSE CATEGORIES TO DISPLAY
  // =========================================
  // Each category has a name and a visual icon emoji
  const categoriesList = [
    { name: 'Electronics', icon: '🎧' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Accessories', icon: '👜' },
    { name: 'Sports', icon: '👟' },
    { name: 'Home & Living', icon: '💡' },
    { name: 'Books', icon: '📚' }
  ];

  // =========================================
  // 2. FETCH PRODUCTS AND INITIALIZE FALLBACK
  // =========================================
  // Just in case the user visits this page first, we define the same mock products
  const initialProductsFallback = [
    { id: 1, name: 'ProBuds X1 Wireless Headphones', price: 2999, oldPrice: 3799, category: 'Electronics', rating: 4.9, reviewCount: 128, image: '🎧' },
    { id: 2, name: 'Chrono Smart Watch Pro', price: 4499, oldPrice: null, category: 'Accessories', rating: 4.5, reviewCount: 89, image: '⌚' },
    { id: 3, name: 'AeroRun Ultra Sports Shoes', price: 3299, oldPrice: 4999, category: 'Sports', rating: 4.8, reviewCount: 256, image: '👟' },
    { id: 4, name: 'Elite Leather Crossbody Bag', price: 1899, oldPrice: null, category: 'Fashion', rating: 4.3, reviewCount: 67, image: '👜' },
    { id: 5, name: 'Minimalist Desk Lamp', price: 1299, oldPrice: 1599, category: 'Home & Living', rating: 4.6, reviewCount: 42, image: '💡' },
    { id: 6, name: '4K Ultra HD Action Camera', price: 8999, oldPrice: 10999, category: 'Electronics', rating: 4.7, reviewCount: 315, image: '📷' },
    { id: 7, name: 'Classic Aviator Sunglasses', price: 999, oldPrice: 1499, category: 'Accessories', rating: 4.2, reviewCount: 55, image: '🕶️' },
    { id: 8, name: 'Yoga Mat Pro Anti-Slip', price: 799, oldPrice: null, category: 'Sports', rating: 4.9, reviewCount: 410, image: '🧘‍♀️' },
    { id: 9, name: 'Cotton Crew Neck T-Shirt', price: 499, oldPrice: 799, category: 'Fashion', rating: 4.1, reviewCount: 88, image: '👕' },
    { id: 10, name: 'Ceramic Coffee Mug Set', price: 899, oldPrice: null, category: 'Home & Living', rating: 4.8, reviewCount: 120, image: '☕' },
    { id: 11, name: 'The Alchemist (Book)', price: 299, oldPrice: 399, category: 'Books', rating: 4.8, reviewCount: 150, image: '📚' },
    { id: 12, name: 'Atomic Habits (Book)', price: 450, oldPrice: 550, category: 'Books', rating: 4.9, reviewCount: 320, image: '📖' }
  ];

  // Save fallback products to local storage if empty
  if (!getFromStorage('shopverse_products')) {
    saveToStorage('shopverse_products', initialProductsFallback);
  }

  // Retrieve products array and render
  function renderCategories() {
    const products = typeof getFromStorage === 'function' ? getFromStorage('shopverse_products') : [];
    const gridContainer = document.getElementById('categoriesGrid');
    if (!gridContainer) return;
    
    // Clear skeletons loading indicators
    gridContainer.innerHTML = '';

    // Generate cards
    categoriesList.forEach(cat => {
      // Count how many products belong to this category
      // We convert both to lowercase to prevent matching errors caused by capitalization differences
      const count = products.filter(p => p.category && p.category.toLowerCase() === cat.name.toLowerCase()).length;

      // Create the anchor element representation
      const card = document.createElement('a');
      card.href = `products.html?category=${encodeURIComponent(cat.name)}`;
      card.className = 'category-card';
      
      card.innerHTML = `
        <span class="category-icon">${cat.icon}</span>
        <h3 class="category-name">${cat.name}</h3>
        <span class="category-count">${count} Item${count !== 1 ? 's' : ''}</span>
      `;

      // Append card to grid container
      gridContainer.appendChild(card);
    });
  }

  // Initial render
  renderCategories();

  // Listen for Supabase products synced event to refresh categories count
  document.addEventListener('supabase_products_synced', function () {
    renderCategories();
  });

});
