/* =====================================================
   SHOPVERSE - Signup Page JavaScript
   =====================================================
   PURPOSE: Handle user registration, password strength,
   and save the new account to Local Storage.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  const signupForm = document.getElementById('signupForm');
  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const passwordInput = document.getElementById('signupPassword');
  const togglePasswordBtn = document.getElementById('toggleSignupPassword');
  
  // Password strength elements
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');

  // =========================================
  // 1. TOGGLE PASSWORD VISIBILITY
  // =========================================
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
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
  // 3. PASSWORD STRENGTH CHECKER
  // =========================================
  // This runs every time the user types in the password box
  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      const val = passwordInput.value;
      
      // Reset classes
      strengthFill.className = 'strength-fill';
      
      if (val.length === 0) {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Password strength';
      } else if (val.length < 6) {
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Weak (Too short)';
      } else if (val.length >= 6 && !/[0-9]/.test(val)) {
        strengthFill.classList.add('fair');
        strengthText.textContent = 'Fair (Add numbers)';
      } else if (val.length >= 6 && /[0-9]/.test(val) && !/[^a-zA-Z0-9]/.test(val)) {
        strengthFill.classList.add('good');
        strengthText.textContent = 'Good (Add special character)';
      } else {
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Strong!';
      }
    });
  }

  // =========================================
  // 4. HANDLE SIGNUP SUBMISSION
  // =========================================
  if (signupForm) {
    signupForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      let isValid = true;

      // Validate Name
      if (name === '') {
        showError(nameInput, 'nameError');
        isValid = false;
      } else {
        hideError(nameInput, 'nameError');
      }

      // Validate Email
      if (!email.includes('@') || !email.includes('.')) {
        showError(emailInput, 'emailError');
        isValid = false;
      } else {
        hideError(emailInput, 'emailError');
      }

      // Validate Password (min 6 chars)
      if (password.length < 6) {
        showError(passwordInput, 'passwordError');
        isValid = false;
      } else {
        hideError(passwordInput, 'passwordError');
      }

      if (!isValid) return;

      // =========================================
      // SAVE TO LOCAL STORAGE
      // =========================================
      const users = getFromStorage('shopverse_users') || [];

      // Check if email is already registered
      const existingUser = users.find(u => u.email === email);

      if (existingUser) {
        showError(emailInput, 'emailError');
        showToast('This email is already registered.', 'warning');
        return;
      }

      // Create new user object
      const newUser = {
        id: Date.now(), // Generate a unique ID based on time
        name: name,
        email: email,
        password: password, // In a real app, passwords must be encrypted/hashed!
        joinDate: new Date().toISOString()
      };

      // Add to array and save
      users.push(newUser);
      saveToStorage('shopverse_users', users);

      // Auto-login the new user
      const sessionUser = {
        name: newUser.name,
        email: newUser.email,
        id: newUser.id
      };
      saveToStorage('shopverse_currentUser', sessionUser);

      showToast('Account created successfully! 🎉', 'success');
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);

    });
  }

});
