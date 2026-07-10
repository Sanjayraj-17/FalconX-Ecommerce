/* =====================================================
   SHOPVERSE - Forgot Password Page JavaScript
   =====================================================
   PURPOSE: Handle password recovery steps:
   
   Step 1: Check if email exists in Local Storage users list.
   Step 2: Generate a mock OTP code, show the verification form,
           check the code, validate the password strength,
           and update the user's password in Local Storage.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // =========================================
  // 1. SELECT DOM ELEMENTS
  // =========================================
  const requestForm = document.getElementById('requestResetForm');
  const resetForm = document.getElementById('resetPasswordForm');
  
  const emailInput = document.getElementById('resetEmail');
  const codeInput = document.getElementById('verificationCode');
  const passwordInput = document.getElementById('newPassword');
  
  const cardTitle = document.getElementById('resetTitle');
  const cardSubtitle = document.getElementById('resetSubtitle');
  const codeDisplay = document.getElementById('simulatedCodeDisplay');
  
  const togglePasswordBtn = document.getElementById('toggleResetPassword');
  const strengthFill = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');

  // We will store the generated code and matching user email in variables
  let generatedOtpCode = '';
  let targetUserEmail = '';

  // =========================================
  // 2. TOGGLE PASSWORD VISIBILITY
  // =========================================
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    });
  }

  // =========================================
  // 3. SHOW / HIDE ERROR UTILITIES
  // =========================================
  function showError(input, errorId) {
    input.classList.add('error');
    input.classList.remove('success');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.classList.add('show');
  }

  function hideError(input, errorId) {
    input.classList.remove('error');
    input.classList.add('success');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.classList.remove('show');
  }

  // =========================================
  // 4. PASSWORD STRENGTH CHECKER
  // =========================================
  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      const val = passwordInput.value;
      
      // Reset strength meter classes
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
  // 5. STEP 1: HANDLE REQUEST RESET (EMAIL VERIFICATION)
  // =========================================
  if (requestForm) {
    requestForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Stop page reload

      const email = emailInput.value.trim();

      // Check if email format is invalid
      if (!email.includes('@') || !email.includes('.')) {
        showError(emailInput, 'emailError');
        return;
      }

      // Read registered users from Local Storage
      const users = getFromStorage('shopverse_users') || [];

      // Look for a user with the matching email address
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser) {
        // User not found in storage database
        showError(emailInput, 'emailError');
        showToast('No account found with this email.', 'error');
        return;
      }

      // Email verified! Hide error if active
      hideError(emailInput, 'emailError');

      // Save email for step 2 password mutation
      targetUserEmail = email;

      // Generate a mock 6-digit verification code
      generatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update UI displays
      codeDisplay.textContent = generatedOtpCode;
      cardTitle.textContent = 'Enter Recovery Code';
      cardSubtitle.textContent = 'Use the recovery code displayed below to set a new password.';

      // Display Code step form, hide Email request form
      requestForm.style.display = 'none';
      resetForm.style.display = 'block';

      showToast('Recovery code generated!', 'info');
    });
  }

  // =========================================
  // 6. STEP 2: VERIFY CODE AND SET NEW PASSWORD
  // =========================================
  if (resetForm) {
    resetForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Stop page reload

      const codeVal = codeInput.value.trim();
      const newPasswordVal = passwordInput.value;
      let isValid = true;

      // Verify Recovery Code
      if (codeVal !== generatedOtpCode) {
        showError(codeInput, 'codeError');
        isValid = false;
      } else {
        hideError(codeInput, 'codeError');
      }

      // Verify Password Length (min 6 chars)
      if (newPasswordVal.length < 6) {
        showError(passwordInput, 'passwordError');
        isValid = false;
      } else {
        hideError(passwordInput, 'passwordError');
      }

      if (!isValid) return;

      // Update the user's password in Local Storage users database
      const users = getFromStorage('shopverse_users') || [];
      const userIndex = users.findIndex(u => u.email.toLowerCase() === targetUserEmail.toLowerCase());

      if (userIndex !== -1) {
        // Update user password
        users[userIndex].password = newPasswordVal;
        
        // Save the updated users array back to Local Storage
        saveToStorage('shopverse_users', users);

        showToast('Password reset successfully! Redirecting to login...', 'success');

        // Redirect user to login page after a short delay
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        showToast('An error occurred. Please try again.', 'error');
      }
    });
  }

});
