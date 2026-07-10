/* =====================================================
   SHOPVERSE - Login Page JavaScript
   =====================================================
   PURPOSE: Handle user login using Local Storage.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const togglePasswordBtn = document.getElementById('toggleLoginPassword');

  // =========================================
  // 1. TOGGLE PASSWORD VISIBILITY
  // =========================================
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
      // If type is password, change to text (visible). If text, change to password (hidden).
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // We could also toggle the icon here if we wanted
    });
  }

  // =========================================
  // 2. HELPER: SHOW/HIDE ERRORS
  // =========================================
  function showError(input, errorId) {
    input.classList.add('error');
    input.classList.remove('success');
    document.getElementById(errorId).classList.add('show');
  }

  function hideError(input, errorId) {
    input.classList.remove('error');
    input.classList.add('success');
    document.getElementById(errorId).classList.remove('show');
  }

  // =========================================
  // 3. HANDLE LOGIN SUBMISSION
  // =========================================
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Stop page refresh

      const email = emailInput.value.trim();
      const password = passwordInput.value;
      let isValid = true;

      // Validate Email (basic check for @ and .)
      if (!email.includes('@') || !email.includes('.')) {
        showError(emailInput, 'emailError');
        isValid = false;
      } else {
        hideError(emailInput, 'emailError');
      }

      // Validate Password is not empty
      if (password === '') {
        showError(passwordInput, 'passwordError');
        isValid = false;
      } else {
        hideError(passwordInput, 'passwordError');
      }

      // If validation fails, stop here
      if (!isValid) return;

      // =========================================
      // CHECK LOCAL STORAGE FOR USER
      // =========================================
      // Get all registered users (an array of objects)
      const users = getFromStorage('shopverse_users') || [];

      // Find a user with the matching email
      const user = users.find(u => u.email === email);

      if (user) {
        // User exists, now check password
        if (user.password === password) {
          // Login Success!
          
          // Save the logged-in user details (without password ideally, but we'll keep it simple)
          const sessionUser = {
            name: user.name,
            email: user.email,
            id: user.id
          };
          saveToStorage('shopverse_currentUser', sessionUser);
          
          showToast('Welcome back, ' + user.name + '!', 'success');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);

        } else {
          // Wrong password
          showError(passwordInput, 'passwordError');
          showToast('Incorrect password.', 'error');
        }
      } else {
        // User not found
        showError(emailInput, 'emailError');
        showToast('Account not found. Please sign up.', 'error');
      }
    });
  }

});
