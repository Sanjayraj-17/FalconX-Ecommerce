/* =====================================================
   SHOPVERSE - User Profile & Orders JavaScript
   =====================================================
   PURPOSE: Manage the user profile page. This file handles:
   
   1. Checking if a user is logged in
   2. Showing a login prompt if not logged in
   3. Rendering user details (name, email, initials, join date)
   4. Loading and displaying past orders matching the logged-in user
   5. Handling user logout
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. DOM ELEMENTS
  // =========================================
  const profileContainer = document.getElementById('profileContainer');

  // Check login state
  // getCurrentUser() is a helper from global.js which reads 'shopverse_currentUser'
  const currentUser = getFromStorage('shopverse_currentUser');

  // =========================================
  // 2. RENDER FLOW BASED ON LOGIN STATE
  // =========================================
  if (!currentUser) {
    // ---- NOT LOGGED IN STATE ----
    profileContainer.innerHTML = `
      <div class="login-prompt">
        <div class="login-prompt-icon">🔒</div>
        <h2>Access Denied</h2>
        <p>You need to be logged in to view your profile and order history.</p>
        <div style="display: flex; gap: var(--space-md); justify-content: center;">
          <a href="login.html" class="btn btn-primary">Sign In</a>
          <a href="signup.html" class="btn btn-secondary">Create Account</a>
        </div>
      </div>
    `;
  } else {
    // ---- LOGGED IN STATE ----
    renderUserProfile(currentUser);
  }

  // =========================================
  // 3. RENDER PROFILE LAYOUT FUNCTION
  // =========================================
  function renderUserProfile(user) {
    // Get user initials (e.g. "John Doe" -> "JD")
    const nameParts = user.name.split(' ');
    const initials = nameParts.map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);

    // Get orders from Local Storage
    const allOrders = getFromStorage('shopverse_orders') || [];
    
    // Filter orders to only show the ones belonging to the logged-in user
    // Match by user email
    const userOrders = allOrders.filter(order => order.userEmail === user.email);

    // Build the Left Info Card Column
    const leftColumnHtml = `
      <div class="profile-card">
        <div class="profile-avatar">${initials || '👤'}</div>
        <h2 class="profile-name">${user.name}</h2>
        <p class="profile-email">${user.email}</p>
        
        <ul class="profile-meta">
          <li>
            <span class="label">Joined</span>
            <span class="value">July 2026</span>
          </li>
          <li>
            <span class="label">Orders</span>
            <span class="value" id="profileOrdersCount">${userOrders.length}</span>
          </li>
        </ul>
        
        <button class="profile-logout-btn" id="logoutBtn">
          🚪 Logout Account
        </button>
      </div>
    `;

    // Build the Right Order History Column
    let rightColumnHtml = `
      <div class="orders-section">
        <h2>Order History</h2>
        <div id="ordersList">
    `;

    if (userOrders.length === 0) {
      // EMPTY ORDERS STATE
      rightColumnHtml += `
          <div class="no-orders">
            <div class="no-orders-icon">📦</div>
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet. Start exploring our premium collections!</p>
            <a href="products.html" class="btn btn-primary" style="display: inline-block; margin-top: var(--space-md); text-decoration: none;">Browse Products</a>
          </div>
      `;
    } else {
      // LOOP & DISPLAY EACH ORDER
      userOrders.forEach(order => {
        // Build the HTML list of items inside this specific order
        let itemsHtml = '';
        order.items.forEach(item => {
          itemsHtml += `
            <div class="order-item">
              <div class="order-item-image">${getProductImageHtml(item.image, item.name, 'order-item-img')}</div>
              <div class="order-item-name">${item.name}</div>
              <div class="order-item-qty">Qty: ${item.quantity}</div>
              <div class="order-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
            </div>
          `;
        });

        // Determine CSS class for the status badge
        let statusClass = 'processing';
        if (order.status === 'delivered') statusClass = 'delivered';
        if (order.status === 'confirmed') statusClass = 'confirmed';

        rightColumnHtml += `
          <div class="order-card">
            <div class="order-header">
              <div>
                <span class="order-id">${order.id}</span>
                <span class="order-date">${order.date}</span>
              </div>
              <span class="order-status ${statusClass}">${order.status.toUpperCase()}</span>
            </div>
            
            <div class="order-items">
              ${itemsHtml}
            </div>
            
            <div class="order-footer">
              <span class="order-total-label">Total Amount Paid</span>
              <span class="order-total-value">₹${order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        `;
      });
    }

    rightColumnHtml += `
        </div>
      </div>
    `; // Close ordersList & orders-section

    // Combine both columns into the profile grid layout
    profileContainer.innerHTML = `
      <div class="profile-layout">
        ${leftColumnHtml}
        ${rightColumnHtml}
      </div>
    `;

    // Attach click listener to logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  }

  // =========================================
  // 4. LOGOUT ACCOUNT FUNCTION
  // =========================================
  function handleLogout() {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      // Remove current user from storage (log out)
      removeFromStorage('shopverse_currentUser');
      showToast('Logged out successfully', 'info');
      
      // Redirect user to index page after a short delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  }

});
