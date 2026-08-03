<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
    <title>Availability | Kirti M. Doongursee College of Arts, Science and Commerce</title>
    <link rel="stylesheet" href="../../assets/vendors/mdi/css/materialdesignicons.min.css" />
    <link rel="stylesheet" href="../../assets/vendors/css/vendor.bundle.base.css" />
    <link rel="stylesheet" href="../../assets/css/style.css" />
    <link rel="shortcut icon" href="../../assets/images/favicon.png" />
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
      .brand-logo img {
        max-width: 100%;
        height: auto;
      }
      .auth-form-light h4 {
        margin-top: 20px;
        text-align: center;
      }
      .loader {
        border: 4px solid #f3f3f3;
        border-radius: 50%;
        border-top: 4px solid #3498db;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
        display: none;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .password-container {
        position: relative;
      }

      .eye-icon {
        position: absolute;
        top: 50%;
        right: 10px;
        cursor: pointer;
        font-size: 20px;
      }

      .error-message {
        color: red;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container-scroller">
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="content-wrapper d-flex align-items-center auth">
          <div class="row flex-grow">
            <div class="col-lg-4 mx-auto">
              <div class="auth-form-light text-left p-5">
                <div class="brand-logo text-center">
                  <img src="C:/tushaldemo/src/pages/samples/Logo.png" alt="Logo" />
                </div>
                <h4>Auditorium Admin</h4>
                <form id="bookingForm" class="pt-3">
                  <div class="form-group">
                    <label for="usernameInput">Username</label>
                    <input required type="text" class="form-control form-control-lg" id="usernameInput" placeholder="Enter your username" />
                    <div id="usernameError" class="error-message"></div>
                  </div>
                  <div class="form-group password-container">
                    <label for="passwordInput">Password</label>
                    <input required type="password" class="form-control form-control-lg" id="passwordInput" placeholder="Enter your password" />
                    <i id="togglePassword" class="mdi mdi-eye eye-icon"></i>
                    <div id="passwordError" class="error-message"></div>
                  </div>
                  <div class="mt-3 d-grid gap-2">
                    <button type="button" class="btn btn-block btn-gradient-primary btn-lg font-weight-medium auth-form-btn" id="checkAvailabilityButton" onclick="checkAvailability()">
                      Submit
                      <span class="loader" id="loader"></span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <script>
      // Toggle password visibility
      const togglePassword = document.getElementById("togglePassword");
      const passwordInput = document.getElementById("passwordInput");
    
      togglePassword.addEventListener("click", function () {
        const type = passwordInput.type === "password" ? "text" : "password";
        passwordInput.type = type;
        this.classList.toggle("mdi-eye-off");
      });
    
      // Validation Function
      function checkAvailability() {
        var loader = document.getElementById("loader");
        loader.style.display = "inline-block";
    
        setTimeout(() => {
          var usernameInput = document.getElementById("usernameInput").value;
          var passwordInputValue = document.getElementById("passwordInput").value;
    
          var usernameError = document.getElementById("usernameError");
          var passwordError = document.getElementById("passwordError");
    
          usernameError.textContent = "";
          passwordError.textContent = "";
    
          var isValid = true;
    
          // Username Validation
          if (!usernameInput) {
            usernameError.textContent = "Please enter a username.";
            isValid = false;
          }
    
          // Password Validation
          if (!passwordInputValue) {
            passwordError.textContent = "Please enter a password.";
            isValid = false;
          } else if (passwordInputValue.length < 6) {
            passwordError.textContent = "Password must be at least 6 characters.";
            isValid = false;
          }
    
          if (isValid) {
            // Save username to sessionStorage
            sessionStorage.setItem('username', usernameInput);
    
            // Redirect to the desired file after successful validation
            window.location.href = "file:///C:/auditorum_management/admin/pages/samples/index.html";
          }
    
          loader.style.display = "none";
        }, 1500);
      }
    </script>
    
  </body>
</html>
