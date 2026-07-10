/* =====================================================
   SHOPVERSE - Checkout Page JavaScript
   =====================================================
   PURPOSE: Handle order placement. This includes:
   
   1. Checking if the user has items in their cart
   2. Displaying order summary items and pricing calculations
   3. Pre-filling user details if they are logged in
   4. Form validation for shipping info
   5. Handling payment option card selection
   6. Creating a new order, saving it to Local Storage,
      clearing the cart, and showing a success modal
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. VERIFY CART IS NOT EMPTY
  // =========================================
  let cart = getFromStorage('shopverse_cart') || [];
  
  if (cart.length === 0) {
    showToast('Your cart is empty! Redirecting to products...', 'warning');
    setTimeout(() => {
      window.location.href = 'products.html';
    }, 2000);
    return;
  }

  // =========================================
  // 2. DOM ELEMENTS
  // =========================================
  const checkoutSummary = document.getElementById('checkoutSummary');
  const checkoutForm = document.getElementById('checkoutForm');
  const paymentOptions = document.getElementById('paymentOptions');
  const orderSuccessOverlay = document.getElementById('orderSuccessOverlay');
  const successOrderId = document.getElementById('successOrderId');

  // Input Fields (Shipping)
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const addressInput = document.getElementById('address');
  const cityInput = document.getElementById('city');
  const stateSelect = document.getElementById('state');
  const pincodeInput = document.getElementById('pincode');

  // Card Modal DOM Elements
  const cardPaymentModal = document.getElementById('cardPaymentModal');
  const cardModalCloseBtn = document.getElementById('cardModalCloseBtn');
  const creditCard = document.getElementById('creditCard');
  const cardBrandLogo = document.getElementById('cardBrandLogo');
  const cardNumberDisplay = document.getElementById('cardNumberDisplay');
  const cardHolderDisplay = document.getElementById('cardHolderDisplay');
  const cardExpiryDisplay = document.getElementById('cardExpiryDisplay');
  const cardCvvDisplay = document.getElementById('cardCvvDisplay');
  const cardPaymentForm = document.getElementById('cardPaymentForm');
  const modalCardNumber = document.getElementById('modalCardNumber');
  const modalCardName = document.getElementById('modalCardName');
  const modalCardExpiry = document.getElementById('modalCardExpiry');
  const modalCardCvv = document.getElementById('modalCardCvv');
  const cardSubmitBtn = document.getElementById('cardSubmitBtn');
  const cardPayAmount = document.getElementById('cardPayAmount');

  // OTP Screen DOM Elements
  const otpScreen = document.getElementById('otpScreen');
  const otpPhoneLastDigits = document.getElementById('otpPhoneLastDigits');
  const otpInputsContainer = document.getElementById('otpInputsContainer');
  const otpError = document.getElementById('otpError');
  const otpCountdown = document.getElementById('otpCountdown');
  const otpVerifyBtn = document.getElementById('otpVerifyBtn');
  const otpResendBtn = document.getElementById('otpResendBtn');
  const otpInputs = document.querySelectorAll('.otp-digit');

  // UPI Modal DOM Elements
  const upiPaymentModal = document.getElementById('upiPaymentModal');
  const upiModalCloseBtn = document.getElementById('upiModalCloseBtn');
  const upiQrImg = document.getElementById('upiQrImg');
  const upiPayAmount = document.getElementById('upiPayAmount');
  const upiMerchantId = document.getElementById('upiMerchantId');
  const upiTxnId = document.getElementById('upiTxnId');
  const upiTimer = document.getElementById('upiTimer');
  const userUpiId = document.getElementById('userUpiId');
  const btnVerifyUpi = document.getElementById('btnVerifyUpi');
  const userUpiError = document.getElementById('userUpiError');
  const upiApproveBtn = document.getElementById('upiApproveBtn');

  // Timers and State variables
  let upiCountdownInterval;
  let otpCountdownInterval;
  let generatedOtp = '';
  let activeOrderData = null; // Stash shipping/order details while payment is processing

  // =========================================
  // 3. PRE-FILL USER DETAILS (If Logged In)
  // =========================================
  const currentUser = getFromStorage('shopverse_currentUser');
  if (currentUser) {
    const nameParts = currentUser.name.split(' ');
    firstNameInput.value = nameParts[0] || '';
    lastNameInput.value = nameParts.slice(1).join(' ') || '';
    emailInput.value = currentUser.email || '';
  }

  // =========================================
  // 4. RENDER ORDER SUMMARY
  // =========================================
  function renderOrderSummary() {
    let itemsHtml = '';
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cart.reduce((sum, item) => {
      if (item.oldPrice) {
        return sum + ((item.oldPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shipping;

    cart.forEach(item => {
      itemsHtml += `
        <div class="checkout-item">
          <div class="checkout-item-image">${getProductImageHtml(item.image, item.name, 'checkout-item-img')}</div>
          <div class="checkout-item-info">
            <h4 class="checkout-item-name">${item.name}</h4>
            <span class="checkout-item-qty">Qty: ${item.quantity}</span>
          </div>
          <span class="checkout-item-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
        </div>
      `;
    });

    checkoutSummary.innerHTML = `
      <h3>Order Summary</h3>
      
      <div style="max-height: 240px; overflow-y: auto; padding-right: 5px;">
        ${itemsHtml}
      </div>

      <hr class="checkout-divider">
      
      <div class="checkout-row">
        <span>Subtotal</span>
        <span>₹${subtotal.toLocaleString('en-IN')}</span>
      </div>
      
      ${discount > 0 ? `
      <div class="checkout-row">
        <span>Discount</span>
        <span class="green">- ₹${discount.toLocaleString('en-IN')}</span>
      </div>
      ` : ''}
      
      <div class="checkout-row">
        <span>Shipping</span>
        <span>${shipping === 0 ? '<span class="green">FREE</span>' : '₹' + shipping}</span>
      </div>
      
      <div class="checkout-row total">
        <span>Total</span>
        <span>₹${total.toLocaleString('en-IN')}</span>
      </div>

      <button class="place-order-btn" id="placeOrderBtn">
        Place Order (₹${total.toLocaleString('en-IN')})
      </button>

      <div class="secure-text">
        🔒 SSL Secured Checkout
      </div>
    `;

    document.getElementById('placeOrderBtn').addEventListener('click', handlePlaceOrder);
  }

  renderOrderSummary();

  // =========================================
  // 5. PAYMENT OPTIONS TOGGLE
  // =========================================
  paymentOptions.addEventListener('click', function (e) {
    const optionCard = e.target.closest('.payment-option');
    if (!optionCard) return;

    document.querySelectorAll('.payment-option').forEach(card => {
      card.classList.remove('selected');
    });

    optionCard.classList.add('selected');
    const radio = optionCard.querySelector('input[type="radio"]');
    radio.checked = true;
  });

  // =========================================
  // 6. VALIDATION & MODAL ROUTING
  // =========================================
  function handlePlaceOrder() {
    let isValid = true;

    function validateField(input, errorElementId, validationFn) {
      const errorSpan = document.getElementById(errorElementId);
      const isFieldValid = validationFn(input.value.trim());
      
      if (!isFieldValid) {
        input.classList.add('error');
        errorSpan.classList.add('visible');
        isValid = false;
      } else {
        input.classList.remove('error');
        errorSpan.classList.remove('visible');
      }
    }

    validateField(firstNameInput, 'firstNameError', val => val.length > 0);
    validateField(lastNameInput, 'lastNameError', val => val.length > 0);
    validateField(phoneInput, 'phoneError', val => /^[0-9+ ]{10,15}$/.test(val));
    validateField(emailInput, 'emailError', val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    validateField(addressInput, 'addressError', val => val.length > 5);
    validateField(cityInput, 'cityError', val => val.length > 0);
    validateField(stateSelect, 'stateError', val => val.length > 0);
    validateField(pincodeInput, 'pincodeError', val => /^[0-9]{6}$/.test(val));

    if (!isValid) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      showToast('Please fix the errors in the shipping form', 'error');
      return;
    }

    const shippingAddress = {
      firstName: firstNameInput.value.trim(),
      lastName: lastNameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      address: addressInput.value.trim(),
      city: cityInput.value.trim(),
      state: stateSelect.value,
      pincode: pincodeInput.value.trim()
    };

    const selectedRadio = document.querySelector('input[name="payment"]:checked');
    const paymentMethod = selectedRadio ? selectedRadio.value : 'cod';

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 999 ? 0 : 99;
    const orderTotal = subtotal + shipping;

    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `SV-${randomNum}`;

    // Stash active order configuration for execution upon successful payment
    activeOrderData = {
      id: orderId,
      date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
      status: 'confirmed',
      items: cart,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod.toUpperCase(),
      total: orderTotal,
      userEmail: currentUser ? currentUser.email : 'guest'
    };

    // Check if Razorpay is configured
    const siteSettings = getFromStorage('shopverse_siteContact') || {};
    const razorpayKeyId = siteSettings.razorpayKeyId || '';

    // Route to appropriate payment handler
    if (paymentMethod === 'cod') {
      executeOrderPlacement();
    } else if (razorpayKeyId && typeof Razorpay !== 'undefined') {
      // Launch official Razorpay Checkout Standard payment iframe
      const rzpOptions = {
        key: razorpayKeyId,
        amount: Math.round(orderTotal * 100), // amount in paisa (1 INR = 100 paisa)
        currency: "INR",
        name: "ShopVerse Store",
        description: `Payment for Order ${orderId}`,
        handler: function (response) {
          activeOrderData.paymentDetails = {
            transactionId: response.razorpay_payment_id,
            gateway: 'RAZORPAY'
          };
          executeOrderPlacement();
        },
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: "#6366f1"
        },
        modal: {
          ondismiss: function () {
            showToast('Payment cancelled by user.', 'warning');
          }
        }
      };

      try {
        const rzp = new Razorpay(rzpOptions);
        rzp.open();
      } catch (err) {
        console.error("Razorpay instance initialization failed: ", err);
        showToast('Payment Gateway issue. Redirecting to simulator...', 'warning');
        if (paymentMethod === 'upi') {
          openUpiSimulator(orderTotal, orderId);
        } else if (paymentMethod === 'card') {
          openCardSimulator(orderTotal, shippingAddress.phone);
        }
      }
    } else {
      // Fallback to local payment simulators
      if (paymentMethod === 'upi') {
        openUpiSimulator(orderTotal, orderId);
      } else if (paymentMethod === 'card') {
        openCardSimulator(orderTotal, shippingAddress.phone);
      }
    }
  }

  // =========================================
  // 7. ORDER FINALIZATION
  // =========================================
  function executeOrderPlacement() {
    if (!activeOrderData) return;

    let orders = getFromStorage('shopverse_orders') || [];
    orders.unshift(activeOrderData);
    saveToStorage('shopverse_orders', orders);

    // Empty Cart
    saveToStorage('shopverse_cart', []);
    updateCartBadge();

    // Show Success Modal
    successOrderId.textContent = activeOrderData.id;
    orderSuccessOverlay.classList.add('show');
    showToast('Order placed successfully!', 'success');

    // Close any active payment modals
    closeCardModal();
    closeUpiModal();
    
    activeOrderData = null;
  }

  // =========================================
  // 8. UPI PAYMENT SIMULATOR LOGIC
  // =========================================
  function openUpiSimulator(amount, orderId) {
    upiPayAmount.textContent = amount.toLocaleString('en-IN');
    
    // Fetch UPI configurations from local storage settings (configured in admin)
    const siteSettings = getFromStorage('shopverse_siteContact') || {};
    const merchantUpi = siteSettings.upiId || 'rajsanjay4813@ybl';
    const customQrUrl = siteSettings.customQrUrl || '';

    upiMerchantId.textContent = merchantUpi;
    
    // Generate UPI URI
    const upiUri = `upi://pay?pa=${encodeURIComponent(merchantUpi)}&pn=ShopVerse%20Store&am=${amount}&cu=INR&tn=${orderId}`;
    
    // Load custom static image or dynamic QR API
    if (customQrUrl) {
      upiQrImg.src = customQrUrl;
    } else {
      // Dynamic scannable QR Code server API
      upiQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(upiUri)}`;
    }

    // Set mock transaction ID
    const randomTxn = 'TXN' + Math.floor(1000000000 + Math.random() * 9000000000);
    upiTxnId.textContent = randomTxn;

    // Reset user input states
    userUpiId.value = '';
    userUpiError.classList.remove('visible');

    // Start countdown timer (5:00)
    let timeRemaining = 300; // 5 mins in seconds
    updateUpiTimerDisplay(timeRemaining);
    
    clearInterval(upiCountdownInterval);
    upiCountdownInterval = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(upiCountdownInterval);
        closeUpiModal();
        showToast('Payment window expired. Please try again.', 'error');
      } else {
        updateUpiTimerDisplay(timeRemaining);
      }
    }, 1000);

    upiPaymentModal.classList.add('show');
  }

  function updateUpiTimerDisplay(secs) {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    upiTimer.textContent = `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  }

  function closeUpiModal() {
    upiPaymentModal.classList.remove('show');
    clearInterval(upiCountdownInterval);
  }

  upiModalCloseBtn.addEventListener('click', closeUpiModal);

  // UPI Verification Click handler
  btnVerifyUpi.addEventListener('click', () => {
    const upiVal = userUpiId.value.trim();
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

    if (!upiRegex.test(upiVal)) {
      userUpiError.classList.add('visible');
      return;
    }

    userUpiError.classList.remove('visible');
    btnVerifyUpi.disabled = true;
    btnVerifyUpi.textContent = 'Verifying...';

    // Simulate verification delay
    setTimeout(() => {
      showToast('UPI payment authorized!', 'success');
      executeOrderPlacement();
      btnVerifyUpi.disabled = false;
      btnVerifyUpi.textContent = 'Verify & Pay';
    }, 1800);
  });

  // Mock Approve Button click handler (Scan Simulation)
  upiApproveBtn.addEventListener('click', () => {
    upiApproveBtn.disabled = true;
    upiApproveBtn.textContent = 'Processing Payment...';
    setTimeout(() => {
      showToast('Scan payment authorized by bank!', 'success');
      executeOrderPlacement();
      upiApproveBtn.disabled = false;
      upiApproveBtn.textContent = 'Simulate Bank App Approval (Mock)';
    }, 1500);
  });


  // =========================================
  // 9. CREDIT CARD SIMULATOR LOGIC
  // =========================================
  function openCardSimulator(amount, phoneNumber) {
    cardPayAmount.textContent = amount.toLocaleString('en-IN');
    
    // Reset Form & Displays
    cardPaymentForm.reset();
    cardPaymentForm.style.display = 'block';
    otpScreen.style.display = 'none';
    
    cardNumberDisplay.textContent = '•••• •••• •••• ••••';
    cardHolderDisplay.textContent = 'YOUR NAME';
    cardExpiryDisplay.textContent = 'MM/YY';
    cardCvvDisplay.textContent = '•••';
    cardBrandLogo.textContent = 'Card';
    creditCard.classList.remove('flipped');
    
    // Remove errors
    document.querySelectorAll('.payment-error').forEach(err => err.classList.remove('visible'));
    document.querySelectorAll('.card-payment-form input').forEach(inp => inp.classList.remove('error'));

    // Stash phone last digits
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const lastDigits = cleanPhone.slice(-4) || '5555';
    otpPhoneLastDigits.textContent = lastDigits;

    cardPaymentModal.classList.add('show');
  }

  function closeCardModal() {
    cardPaymentModal.classList.remove('show');
    clearInterval(otpCountdownInterval);
  }

  cardModalCloseBtn.addEventListener('click', closeCardModal);

  // Card input event listeners for real-time formatting & visual sync
  modalCardNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
    cardNumberDisplay.textContent = formattedValue || '•••• •••• •••• ••••';

    // Detect card provider type
    if (value.startsWith('4')) {
      cardBrandLogo.textContent = 'Visa';
    } else if (/^5[1-5]/.test(value)) {
      cardBrandLogo.textContent = 'Mastercard';
    } else if (/^6(0|1|2|5|6|7|8|9)/.test(value)) {
      cardBrandLogo.textContent = 'RuPay';
    } else {
      cardBrandLogo.textContent = 'Card';
    }
  });

  modalCardName.addEventListener('input', (e) => {
    cardHolderDisplay.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
  });

  modalCardExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
    cardExpiryDisplay.textContent = value || 'MM/YY';
  });

  modalCardCvv.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    e.target.value = value;
    cardCvvDisplay.textContent = '*'.repeat(value.length) || '•••';
  });

  // Flip Animations on Focus
  modalCardCvv.addEventListener('focus', () => {
    creditCard.classList.add('flipped');
  });

  modalCardCvv.addEventListener('blur', () => {
    creditCard.classList.remove('flipped');
  });

  // Card payment form submission (Verify details then go to OTP)
  cardPaymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isCardValid = true;

    function validateCardField(input, errorId, validationFn) {
      const errorSpan = document.getElementById(errorId);
      if (!validationFn(input.value.trim())) {
        input.classList.add('error');
        errorSpan.classList.add('visible');
        isCardValid = false;
      } else {
        input.classList.remove('error');
        errorSpan.classList.remove('visible');
      }
    }

    validateCardField(modalCardNumber, 'cardNumberError', val => val.replace(/\s/g, '').length === 16);
    validateCardField(modalCardName, 'cardNameError', val => val.length > 2);
    validateCardField(modalCardExpiry, 'cardExpiryError', val => /^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(val));
    validateCardField(modalCardCvv, 'cardCvvError', val => val.length === 3);

    if (!isCardValid) {
      showToast('Please verify card information details', 'error');
      return;
    }

    // Process to OTP Screen
    cardSubmitBtn.disabled = true;
    cardSubmitBtn.textContent = 'Processing transaction securely...';

    setTimeout(() => {
      cardSubmitBtn.disabled = false;
      cardSubmitBtn.textContent = 'Pay Now';
      
      // Hide card form, show OTP screen
      cardPaymentForm.style.display = 'none';
      otpScreen.style.display = 'flex';
      
      triggerOtpFlow();
    }, 1800);
  });

  // =========================================
  // 10. OTP FLOW & INPUT MANAGEMENT
  // =========================================
  function triggerOtpFlow() {
    // Generate a secure 6-digit OTP code for the user to simulate solving
    generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Reset OTP boxes
    otpInputs.forEach(inp => {
      inp.value = '';
      inp.disabled = true;
    });
    otpInputs[0].disabled = false;
    otpInputs[0].focus();
    
    otpVerifyBtn.disabled = true;
    otpError.classList.remove('visible');
    otpResendBtn.style.display = 'none';

    // Broadcast the verification code to the client via toast so they can enter it
    setTimeout(() => {
      showToast(`🔑 ShopVerse OTP: ${generatedOtp} (Demo Payment Code)`, 'info');
    }, 1000);

    // Setup Resend countdown (30s)
    let countdown = 30;
    updateOtpTimerDisplay(countdown);

    clearInterval(otpCountdownInterval);
    otpCountdownInterval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(otpCountdownInterval);
        document.querySelector('.otp-timer').style.display = 'none';
        otpResendBtn.style.display = 'inline-block';
      } else {
        updateOtpTimerDisplay(countdown);
      }
    }, 1000);
  }

  function updateOtpTimerDisplay(val) {
    document.querySelector('.otp-timer').style.display = 'block';
    otpCountdown.textContent = val;
  }

  // Bind OTP character typing triggers
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 1) {
        // Move focus to next input box
        if (index < otpInputs.length - 1) {
          otpInputs[index + 1].disabled = false;
          otpInputs[index + 1].focus();
        }
      }
      
      // Check if all input boxes are filled to enable button
      const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
      otpVerifyBtn.disabled = !allFilled;
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && input.value.length === 0) {
        if (index > 0) {
          otpInputs[index].disabled = true;
          otpInputs[index - 1].focus();
          otpInputs[index - 1].value = '';
          otpVerifyBtn.disabled = true;
        }
      }
    });
  });

  // Verify OTP button handler
  otpVerifyBtn.addEventListener('click', () => {
    const userEnteredOtp = Array.from(otpInputs).map(inp => inp.value).join('');
    
    if (userEnteredOtp !== generatedOtp) {
      otpError.classList.add('visible');
      // Shake inputs on failure
      otpInputsContainer.classList.add('shake');
      setTimeout(() => otpInputsContainer.classList.remove('shake'), 500);
      return;
    }

    otpError.classList.remove('visible');
    otpVerifyBtn.disabled = true;
    otpVerifyBtn.textContent = 'Processing Payment...';

    setTimeout(() => {
      showToast('Card payment authorized successfully!', 'success');
      executeOrderPlacement();
    }, 1500);
  });

  otpResendBtn.addEventListener('click', () => {
    triggerOtpFlow();
  });


});
