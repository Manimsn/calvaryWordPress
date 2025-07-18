function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email);
}

function validatePhone(phone) {
  const allowedChars = /^[\d\s\+\-]+$/;
  if (!allowedChars.test(phone)) return false;

  const cleaned = phone.replace(/\D/g, ""); // Remove all non-digits
  const isIndian = /^[6-9]\d{9}$/.test(cleaned);
  const isUS = /^\d{10}$/.test(cleaned);
  return isIndian || isUS;
}

function validateInput() {
  const inputElement = document.getElementById("loginInput");
  const input = inputElement.value.trim();
  const continueBtn = document.getElementById("continueButton");
  const errorDiv = document.getElementById("inputError");

  if (validateEmail(input) || validatePhone(input)) {
    continueBtn.disabled = false;
    errorDiv.textContent = "";
    inputElement.style.borderColor = "#ccc"; // Reset to normal border
  } else {
    continueBtn.disabled = true;
    errorDiv.textContent =
      "Please enter a valid email address or 10-digit phone number.";
    errorDiv.style.color = "red";
    inputElement.style.borderColor = "red"; // Add red border
  }
}

async function handleLogin() {
  const input = document.getElementById("loginInput");
  const continueBtn = document.getElementById("continueButton");
  const error = document.getElementById("inputError");
  const value = input.value.trim();

  // Double check validation before calling API
  if (!(validateEmail(value) || validatePhone(value))) {
    error.innerText = "Please enter a valid email or phone number.";
    input.style.borderColor = "red";
    return;
  }

  // Start sending
  continueBtn.disabled = true;
  continueBtn.classList.add("button-loading");
  continueBtn.innerText = "Sending...";
  error.innerText = "";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/LoginCode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Phone_Email: value }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      input.style.borderColor = "red";
      error.innerText = text || "Login failed.";
      continueBtn.disabled = false;
      continueBtn.innerText = "Continue";
    } else {
      // Success – show OTP section
      document.getElementById("otpSection").style.display = "flex";
      document.getElementById("userValueDisplay").innerText = value;

      // Hide initial login form
      // document.querySelector("img").style.display = "none";
      // document.querySelector("h2").style.display = "none";
      // document.querySelector("p").style.display = "none";
      document.getElementById("loginForm").style.display = "none";
      // input.style.display = "none";
      // continueBtn.style.display = "none";
      error.innerText = "";

      // Focus OTP box
      const otpBox = document.querySelector(".otpBox");
      if (otpBox) otpBox.focus();

      // Optional: Attach OTP listeners once
      if (!window.otpListenersAttached) {
        if (typeof setupOtpListeners === "function") {
          setupOtpListeners();
          window.otpListenersAttached = true;
        }
      }
    }
  } catch (err) {
    input.style.borderColor = "red";
    error.innerText = "Something went wrong. Please try again.";
    continueBtn.disabled = false;
    continueBtn.innerText = "Continue";
  }
}

function checkOtpAndToggleButton() {
  const otpInputs = document.querySelectorAll(".otpBox");
  const signInButton = document.getElementById("signInButton");

  const enteredDigits = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  if (enteredDigits.length === 6 && /^\d{6}$/.test(enteredDigits)) {
    signInButton.disabled = false;
    signInButton.style.cursor = "pointer";
    signInButton.style.opacity = "1";
    signInButton.style.backgroundColor = "white";
    signInButton.style.color = "#00B5EF";
  } else {
    signInButton.disabled = true;
    signInButton.style.cursor = "not-allowed";
    signInButton.style.opacity = "0.6";
    signInButton.style.backgroundColor = "transparent";
    signInButton.style.color = "white";
  }
}

function setupOtpListeners() {
  const otpInputs = document.querySelectorAll(".otpBox");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      if (value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }

      checkOtpAndToggleButton(); // ✅ Add this here
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener("keyup", () => {
      checkOtpAndToggleButton();
    });

    input.addEventListener("keypress", (e) => {
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });
  });

  checkOtpAndToggleButton(); // Initial state check
}

async function verifyOtp() {
  const signInBtn = document.getElementById("signInButton");
  const otpInputs = document.querySelectorAll(".otpBox");
  const Phone_Email = document
    .getElementById("userValueDisplay")
    .innerText.trim();
  const Code = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  // Reset previous error styles
  otpInputs.forEach((input) => (input.style.borderColor = "white"));

  // Remove existing error message
  const oldErr = document.getElementById("otpErrorMessage");
  if (oldErr) oldErr.remove();

  // Show loading UI
  signInBtn.disabled = true;
  signInBtn.classList.add("button-loading");
  signInBtn.innerText = "Verifying...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/v1.0/api/LoginCode/Confirm",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Phone_Email,
          Code,
          DeviceID: "dummy-device-id", // Replace if needed
          API_Key: "dummy-api-key", // Replace if needed
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ OTP Verified:", data);

      // Save JWT Token
      localStorage.setItem("mpp-widgets_AuthToken", data.JwtToken);

      // Proceed next - show phone field if SecondaryContact is null
      alert("SecondaryContact: " + data.SecondaryContact);
    } else {
      // Error: invalid OTP
      otpInputs.forEach((input) => (input.style.borderColor = "red"));

      const err = document.createElement("div");
      err.id = "otpErrorMessage";
      err.style.color = "red";
      err.style.fontSize = "14px";
      err.style.marginTop = "10px";
      err.innerText = "Invalid or expired code. Please try again.";
      document.getElementById("otpWrapper").appendChild(err);
    }
  } catch (err) {
    alert("Something went wrong. Please try again.");
    console.error("❌ OTP verification failed:", err);
  }

  // Reset button
  signInBtn.disabled = false;
  signInBtn.classList.remove("button-loading");
  signInBtn.innerText = "SIGN IN";
}

function showLoginForm() {
  console.log("showLoginForm");
  // Show login form
  const continueBtn = document.getElementById("continueButton");
  continueBtn.classList.remove("button-loading");
  continueBtn.innerText = "Continue";
  document.getElementById("loginForm").style.display = "block";

  // Hide OTP form
  document.getElementById("otpSection").style.display = "none";

  // Optional: Reset OTP inputs
  const otpInputs = document.querySelectorAll(".otpBox");
  otpInputs.forEach((input) => (input.value = ""));

  // Optional: Clear any OTP errors
  const otpError = document.getElementById("otpErrorMessage");
  if (otpError) otpError.remove();
}
