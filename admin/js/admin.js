/* =====================================================
   SHOPVERSE - Admin Dashboard JavaScript
   =====================================================
   PURPOSE: All admin panel logic:
   1. Auth guard (redirect if not logged in)
   2. Sidebar navigation (page switching)
   3. Dashboard stats calculation
   4. Product CRUD (Create, Read, Update, Delete)
   5. Order management (view, update status)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 0. AUTH GUARD — Must be logged in as admin
  // =========================================
  const adminData = JSON.parse(localStorage.getItem('shopverse_admin'));
  if (!adminData || !adminData.loggedIn) {
    window.location.href = 'login.html';
    return;
  }

  // =========================================
  // 1. DOM ELEMENTS
  // =========================================
  const sidebarNav = document.getElementById('sidebarNav');
  const pageTitle = document.getElementById('pageTitle');
  const sidebar = document.getElementById('adminSidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');

  // =========================================
  // 2. SIDEBAR NAVIGATION
  // =========================================
  // Clicking a sidebar link shows/hides pages
  sidebarNav.addEventListener('click', function (e) {
    const link = e.target.closest('a[data-page]');
    if (!link) return;
    e.preventDefault();

    // Remove active class from all links
    sidebarNav.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
    link.classList.add('active');

    // Hide all pages, show selected
    var pageName = link.getAttribute('data-page');
    document.querySelectorAll('.admin-page').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('page-' + pageName).classList.add('active');

    // Update header title
    var titles = { dashboard: 'Dashboard', products: 'Products', orders: 'Orders', messages: 'Messages', settings: 'Site Settings' };
    pageTitle.textContent = titles[pageName] || pageName;

    // Close mobile sidebar
    sidebar.classList.remove('open');

    // Refresh data when switching pages
    if (pageName === 'dashboard') loadDashboard();
    if (pageName === 'products') loadProducts();
    if (pageName === 'orders') loadOrders();
    if (pageName === 'messages') loadMessages();
    if (pageName === 'settings') loadSettings();
  });

  // Mobile sidebar toggle
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
  }

  // Logout
  document.getElementById('adminLogoutBtn').addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.removeItem('shopverse_admin');
    showAdminToast('Logged out', 'info');
    setTimeout(function () { window.location.href = 'login.html'; }, 800);
  });

  // =========================================
  // 3. HELPER FUNCTIONS
  // =========================================
  function getFromStorage(key) {
    var data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function showAdminToast(msg, type) {
    var container = document.getElementById('adminToastContainer');
    var toast = document.createElement('div');
    toast.className = 'admin-toast ' + (type || 'success');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('removing');
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }

  // =========================================
  // 4. DASHBOARD PAGE
  // =========================================
  function loadDashboard() {
    var orders = getFromStorage('shopverse_orders') || [];
    var products = getFromStorage('shopverse_products') || getDefaultProducts();
    var users = getFromStorage('shopverse_users') || [];

    // Calculate total revenue from all orders
    var totalRevenue = orders.reduce(function (sum, o) { return sum + (o.total || 0); }, 0);

    document.getElementById('statRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('statOrders').textContent = orders.length;
    document.getElementById('statProducts').textContent = products.length;
    document.getElementById('statUsers').textContent = users.length;

    // Recent orders (last 5)
    var container = document.getElementById('dashboardRecentOrders');
    if (orders.length === 0) {
      container.innerHTML = '<div class="admin-empty"><div class="empty-icon">📋</div><h3>No orders yet</h3><p>Orders will appear here once customers start buying.</p></div>';
      return;
    }

    var recent = orders.slice(-5).reverse();
    var html = '<table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody>';

    recent.forEach(function (order) {
      var statusClass = 'badge-' + (order.status || 'processing');
      html += '<tr>';
      html += '<td><strong>' + order.id + '</strong></td>';
      html += '<td>' + (order.customerName || order.userEmail || 'Customer') + '</td>';
      html += '<td>' + (order.date || '—') + '</td>';
      html += '<td>₹' + (order.total || 0).toLocaleString('en-IN') + '</td>';
      html += '<td><span class="badge ' + statusClass + '">' + (order.status || 'processing').toUpperCase() + '</span></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // =========================================
  // 5. PRODUCTS PAGE
  // =========================================
  function getDefaultProducts() {
    return [
      { id: 1, name: 'ProBuds X1 Wireless Headphones', price: 2999, oldPrice: 3799, category: 'Electronics', rating: 4.9, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80', description: 'Premium wireless headphones with noise cancellation.' },
      { id: 2, name: 'Chrono Smart Watch Pro', price: 4499, oldPrice: null, category: 'Accessories', rating: 5, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80', description: 'Advanced smartwatch with health monitoring.' },
      { id: 3, name: 'AeroRun Ultra Sports Shoes', price: 3299, oldPrice: 4999, category: 'Sports', rating: 5, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80', description: 'Lightweight running shoes with air cushioning.' },
      { id: 4, name: 'UrbanCarry Leather Handbag', price: 1999, oldPrice: null, category: 'Fashion', rating: 4.7, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80', description: 'Premium leather handbag for everyday use.' },
      { id: 5, name: 'AuraLamp Smart LED Desk Lamp', price: 1499, oldPrice: 1999, category: 'Home & Living', rating: 4.5, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80', description: 'Smart desk lamp with adjustable color temperature.' },
      { id: 6, name: 'FlexFit Yoga Mat Premium', price: 899, oldPrice: 1299, category: 'Sports', rating: 4.8, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80', description: 'Non-slip yoga mat with alignment lines.' }
    ];
  }

  function loadProducts() {
    var products = getFromStorage('shopverse_products') || getDefaultProducts();
    var container = document.getElementById('productsTableContainer');

    if (products.length === 0) {
      container.innerHTML = '<div class="admin-empty"><div class="empty-icon">📦</div><h3>No products</h3><p>Click "Add Product" to create your first product.</p></div>';
      return;
    }

    var html = '<table class="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Rating</th><th>Actions</th></tr></thead><tbody>';

    products.forEach(function (p) {
      html += '<tr>';
      html += '<td><div class="product-cell"><div class="product-thumb">' + getProductImageHtml(p.image, p.name) + '</div><div>' + p.name + '</div></div></td>';
      html += '<td>' + (p.category || '—') + '</td>';
      html += '<td>₹' + p.price.toLocaleString('en-IN');
      if (p.oldPrice) html += ' <span style="text-decoration:line-through;color:var(--admin-text-muted);font-size:0.8rem">₹' + p.oldPrice.toLocaleString('en-IN') + '</span>';
      html += '</td>';
      html += '<td>⭐ ' + (p.rating || '—') + '</td>';
      html += '<td><div class="table-actions">';
      html += '<button class="btn-icon edit" data-edit-id="' + p.id + '" title="Edit">✏️</button>';
      html += '<button class="btn-icon danger" data-delete-id="' + p.id + '" title="Delete">🗑️</button>';
      html += '</div></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Attach edit/delete listeners
    container.querySelectorAll('[data-edit-id]').forEach(function (btn) {
      btn.addEventListener('click', function () { openEditProduct(parseInt(btn.getAttribute('data-edit-id'))); });
    });

    container.querySelectorAll('[data-delete-id]').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteProduct(parseInt(btn.getAttribute('data-delete-id'))); });
    });
  }

  // ---- ADD / EDIT PRODUCT MODAL ----
  var modal = document.getElementById('productModal');

  document.getElementById('addProductBtn').addEventListener('click', function () {
    openAddProduct();
  });

  document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  function openAddProduct() {
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodOldPrice').value = '';
    document.getElementById('prodCategory').value = '';
    document.getElementById('prodRating').value = '';
    document.getElementById('prodImage').value = '';
    document.getElementById('prodDescription').value = '';
    document.getElementById('prodEditId').value = '';
    
    // Reset file upload field & preview
    var fileInput = document.getElementById('prodImageFile');
    var fileInputName = document.getElementById('prodImageFileName');
    if (fileInput) fileInput.value = '';
    if (fileInputName) fileInputName.textContent = 'No file chosen';
    if (typeof updateImagePreview === 'function') updateImagePreview('');

    modal.classList.add('active');
  }

  function openEditProduct(id) {
    var products = getFromStorage('shopverse_products') || getDefaultProducts();
    var product = products.find(function (p) { return p.id === id; });
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('prodName').value = product.name;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodOldPrice').value = product.oldPrice || '';
    document.getElementById('prodCategory').value = product.category || '';
    document.getElementById('prodRating').value = product.rating || '';
    document.getElementById('prodImage').value = product.image || '';
    document.getElementById('prodDescription').value = product.description || '';
    document.getElementById('prodEditId').value = id;

    // Reset file upload field & update preview
    var fileInput = document.getElementById('prodImageFile');
    var fileInputName = document.getElementById('prodImageFileName');
    if (fileInput) fileInput.value = '';
    if (fileInputName) fileInputName.textContent = 'No file chosen';
    if (typeof updateImagePreview === 'function') updateImagePreview(product.image || '');

    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  // Save product (add or update)
  document.getElementById('saveProductBtn').addEventListener('click', function () {
    var name = document.getElementById('prodName').value.trim();
    var price = parseFloat(document.getElementById('prodPrice').value);
    var oldPrice = parseFloat(document.getElementById('prodOldPrice').value) || null;
    var category = document.getElementById('prodCategory').value;
    var rating = parseFloat(document.getElementById('prodRating').value) || 4.5;
    var image = document.getElementById('prodImage').value.trim() || '📦';
    var description = document.getElementById('prodDescription').value.trim();
    var editId = document.getElementById('prodEditId').value;

    if (!name || !price || !category) {
      showAdminToast('Please fill in Name, Price, and Category', 'error');
      return;
    }

    var products = getFromStorage('shopverse_products') || getDefaultProducts();

    if (editId) {
      // UPDATE existing product
      editId = parseInt(editId);
      var idx = products.findIndex(function (p) { return p.id === editId; });
      if (idx !== -1) {
        products[idx].name = name;
        products[idx].price = price;
        products[idx].oldPrice = oldPrice;
        products[idx].category = category;
        products[idx].rating = rating;
        products[idx].image = image;
        products[idx].description = description;
        showAdminToast('Product updated successfully!', 'success');
      }
    } else {
      // ADD new product
      var newId = products.length > 0 ? Math.max.apply(null, products.map(function (p) { return p.id; })) + 1 : 1;
      products.push({
        id: newId,
        name: name,
        price: price,
        oldPrice: oldPrice,
        category: category,
        rating: rating,
        image: image,
        description: description
      });
      showAdminToast('Product added successfully!', 'success');
    }

    saveToStorage('shopverse_products', products);
    closeModal();
    loadProducts();
  });

  // Delete product
  function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    var products = getFromStorage('shopverse_products') || getDefaultProducts();
    products = products.filter(function (p) { return p.id !== id; });
    saveToStorage('shopverse_products', products);
    showAdminToast('Product deleted', 'info');
    loadProducts();
  }

  // =========================================
  // 6. ORDERS PAGE
  // =========================================
  function loadOrders() {
    var orders = getFromStorage('shopverse_orders') || [];
    var container = document.getElementById('ordersTableContainer');

    if (orders.length === 0) {
      container.innerHTML = '<div class="admin-empty"><div class="empty-icon">🛒</div><h3>No orders yet</h3><p>Customer orders will appear here.</p></div>';
      return;
    }

    var html = '<table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>';

    orders.slice().reverse().forEach(function (order) {
      var statusClass = 'badge-' + (order.status || 'processing');
      var itemCount = order.items ? order.items.length : 0;

      html += '<tr>';
      html += '<td><strong>' + order.id + '</strong><br><span style="font-size:0.75rem;color:var(--admin-text-muted)">' + (order.date || '') + '</span></td>';
      html += '<td>' + (order.customerName || order.userEmail || 'Guest') + '</td>';
      html += '<td>' + itemCount + ' item' + (itemCount !== 1 ? 's' : '') + '</td>';
      html += '<td>₹' + (order.total || 0).toLocaleString('en-IN') + '</td>';
      html += '<td><span class="badge ' + statusClass + '">' + (order.status || 'processing').toUpperCase() + '</span></td>';
      html += '<td><select class="order-status-select" data-order-id="' + order.id + '" style="padding:6px 10px;border-radius:6px;border:1px solid var(--admin-border);background:var(--admin-bg);color:var(--admin-text);font-size:0.8rem;">';
      html += '<option value="processing"' + (order.status === 'processing' ? ' selected' : '') + '>Processing</option>';
      html += '<option value="confirmed"' + (order.status === 'confirmed' ? ' selected' : '') + '>Confirmed</option>';
      html += '<option value="delivered"' + (order.status === 'delivered' ? ' selected' : '') + '>Delivered</option>';
      html += '<option value="cancelled"' + (order.status === 'cancelled' ? ' selected' : '') + '>Cancelled</option>';
      html += '</select></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    // Attach status change listeners
    container.querySelectorAll('.order-status-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        updateOrderStatus(sel.getAttribute('data-order-id'), sel.value);
      });
    });
  }

  function updateOrderStatus(orderId, newStatus) {
    var orders = getFromStorage('shopverse_orders') || [];
    var idx = orders.findIndex(function (o) { return o.id === orderId; });
    if (idx !== -1) {
      orders[idx].status = newStatus;
      saveToStorage('shopverse_orders', orders);
      showAdminToast('Order ' + orderId + ' → ' + newStatus.toUpperCase(), 'success');
      loadOrders();
    }
  }

  // =========================================
  // 7. MESSAGES PAGE
  // =========================================
  function loadMessages() {
    var messages = getFromStorage('shopverse_messages') || [];
    var container = document.getElementById('messagesTableContainer');

    if (messages.length === 0) {
      container.innerHTML = '<div class="admin-empty"><div class="empty-icon">💬</div><h3>No messages yet</h3><p>Messages from the contact form will appear here.</p></div>';
      return;
    }

    var html = '<table class="admin-table"><thead><tr><th>From</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead><tbody>';

    messages.slice().reverse().forEach(function (msg) {
      html += '<tr>';
      html += '<td><strong>' + msg.name + '</strong></td>';
      html += '<td>' + msg.email + '</td>';
      html += '<td>' + (msg.subject || '—') + '</td>';
      html += '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + msg.message + '</td>';
      html += '<td>' + (msg.date || '—') + '</td>';
      html += '<td><button class="btn-icon danger" data-delete-msg="' + msg.id + '" title="Delete">🗑️</button></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;

    container.querySelectorAll('[data-delete-msg]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var msgId = btn.getAttribute('data-delete-msg');
        var msgs = getFromStorage('shopverse_messages') || [];
        msgs = msgs.filter(function (m) { return m.id !== msgId; });
        saveToStorage('shopverse_messages', msgs);
        showAdminToast('Message deleted', 'info');
        loadMessages();
      });
    });
  }

  // =========================================
  // 8. SITE SETTINGS PAGE
  // =========================================
  function loadSettings() {
    var contact = getFromStorage('shopverse_siteContact') || {
      email: 'rajsanjay4813@gmail.com',
      phone: '+91 12345 67890',
      address: 'Madurai, Tamil Nadu, India',
      hours: 'Mon-Sat, 10 AM - 7 PM',
      web3Key: '2fabea6c-ee09-4de0-bbc0-8c2e9d61a367',
      upiId: 'rajsanjay4813@ybl',
      customQrUrl: '',
      razorpayKeyId: ''
    };
    document.getElementById('settingEmail').value = contact.email || '';
    document.getElementById('settingPhone').value = contact.phone || '';
    document.getElementById('settingAddress').value = contact.address || '';
    document.getElementById('settingHours').value = contact.hours || '';
    document.getElementById('settingWeb3Key').value = contact.web3Key || '';
    document.getElementById('settingUpiId').value = contact.upiId || 'rajsanjay4813@ybl';
    document.getElementById('settingCustomQrUrl').value = contact.customQrUrl || '';
    document.getElementById('settingRazorpayKey').value = contact.razorpayKeyId || '';

    var about = getFromStorage('shopverse_siteAbout') || {
      title: 'The Story Behind FalconX',
      subtitle: "We're on a mission to make premium products accessible to everyone.",
      story: 'FalconX was born in 2026 in the vibrant city of Madurai, Tamil Nadu with a simple idea — what if online shopping could be both premium and affordable?'
    };
    document.getElementById('settingAboutTitle').value = about.title;
    document.getElementById('settingAboutSubtitle').value = about.subtitle;
    document.getElementById('settingAboutStory').value = about.story;
  }

  // Save Contact Settings
  document.getElementById('saveContactBtn').addEventListener('click', function () {
    var contact = {
      email: document.getElementById('settingEmail').value.trim(),
      phone: document.getElementById('settingPhone').value.trim(),
      address: document.getElementById('settingAddress').value.trim(),
      hours: document.getElementById('settingHours').value.trim(),
      web3Key: document.getElementById('settingWeb3Key').value.trim(),
      upiId: document.getElementById('settingUpiId').value.trim(),
      customQrUrl: document.getElementById('settingCustomQrUrl').value.trim(),
      razorpayKeyId: document.getElementById('settingRazorpayKey').value.trim()
    };
    saveToStorage('shopverse_siteContact', contact);
    showAdminToast('Contact & Payment info saved!', 'success');
  });

  // Save About Settings
  document.getElementById('saveAboutBtn').addEventListener('click', function () {
    var about = {
      title: document.getElementById('settingAboutTitle').value.trim(),
      subtitle: document.getElementById('settingAboutSubtitle').value.trim(),
      story: document.getElementById('settingAboutStory').value.trim()
    };
    saveToStorage('shopverse_siteAbout', about);
    showAdminToast('About page content saved!', 'success');
  });

  // =========================================
  // 9. INITIALIZE — Load dashboard on start
  // =========================================
  var existingProds = getFromStorage('shopverse_products');
  var hasLegacy = existingProds && existingProds.some(function(p) {
    return p.image && !p.image.startsWith('http') && !p.image.startsWith('data:') && !p.image.startsWith('images/') && !p.image.startsWith('./images/');
  });
  if (hasLegacy) {
    existingProds = null;
    removeFromStorage('shopverse_products');
  }
  if (!existingProds) {
    saveToStorage('shopverse_products', getDefaultProducts());
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
    return `<span class="emoji-img" style="font-size: 1.3rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">${image}</span>`;
  }

  // Compress and resize image client-side to prevent localStorage overflow
  function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // 400px is more than enough for card thumbnails & details page
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed jpeg data URL (0.75 quality)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        callback(dataUrl);
      };
    };
  }

  // Preview update helper
  function updateImagePreview(value) {
    const previewContainer = document.getElementById('prodImagePreview');
    const previewImg = previewContainer.querySelector('img');
    if (!previewContainer || !previewImg) return;
    
    if (!value) {
      previewContainer.style.display = 'none';
      previewImg.src = '';
      return;
    }
    value = value.trim();
    const isUrl = value.startsWith('http://') || 
                  value.startsWith('https://') || 
                  value.startsWith('data:image/') || 
                  value.startsWith('images/') || 
                  value.startsWith('./images/') || 
                  value.includes('.jpg') || 
                  value.includes('.png') || 
                  value.includes('.webp') || 
                  value.includes('.jpeg') ||
                  value.includes('.gif') ||
                  value.includes('.svg');
    if (isUrl) {
      previewImg.src = value;
      previewContainer.style.display = 'block';
    } else {
      previewContainer.style.display = 'none';
      previewImg.src = '';
    }
  }

  // Set up listeners for the image file input
  var fileInput = document.getElementById('prodImageFile');
  var fileInputName = document.getElementById('prodImageFileName');
  var urlInput = document.getElementById('prodImage');

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        fileInputName.textContent = file.name;
        
        showAdminToast('Compressing image...', 'info');
        compressImage(file, function (compressedUrl) {
          urlInput.value = compressedUrl;
          updateImagePreview(compressedUrl);
          showAdminToast('Image uploaded and optimized!', 'success');
        });
      } else {
        fileInputName.textContent = 'No file chosen';
      }
    });
  }

  if (urlInput) {
    urlInput.addEventListener('input', function () {
      updateImagePreview(this.value);
    });
    urlInput.addEventListener('change', function () {
      updateImagePreview(this.value);
    });
  }

  // Set up listener for settings QR Code image file input
  var qrFileInput = document.getElementById('settingQrFile');
  var qrFileInputName = document.getElementById('settingQrFileName');
  var qrUrlInput = document.getElementById('settingCustomQrUrl');

  if (qrFileInput) {
    qrFileInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        qrFileInputName.textContent = 'Selected: ' + file.name;
        
        showAdminToast('Compressing QR code...', 'info');
        compressImage(file, function (compressedUrl) {
          qrUrlInput.value = compressedUrl;
          showAdminToast('QR code compressed and loaded!', 'success');
        });
      } else {
        qrFileInputName.textContent = '';
      }
    });
  }

  // Expose updateImagePreview globally so openAddProduct/openEditProduct can use it
  window.updateImagePreview = updateImagePreview;

  loadDashboard();

});
