console.log("QA CAN PROCEED");
const login = document.getElementById("loginButton");
const inputElement = document.getElementById("loginInput");
const errorDiv = document.getElementById("inputError");

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
  const errorDiv = document.getElementById("inputError");
  const input = inputElement.value.trim();
  const continueBtn = document.getElementById("continueButton");

  if (input === "") {
    continueBtn.disabled = true;
    errorDiv.textContent = "";
    inputElement.style.borderColor = "#D1D5DB"; // Reset to normal border
    return;
  }

  if (validateEmail(input) || validatePhone(input)) {
    continueBtn.disabled = false;
    errorDiv.textContent = "";
    inputElement.style.borderColor = "#D1D5DB"; // Reset to normal border
  } else {
    continueBtn.disabled = true;
    errorDiv.textContent =
      "Please enter a valid email address or 10-digit phone number.";
    errorDiv.style.color = "#B91C1C";
    inputElement.style.borderColor = "#B91C1C"; // Add red border
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
    input.style.borderColor = "#B91C1C";
    return;
  }

  // Start sending
  continueBtn.disabled = true;
  continueBtn.classList.add("button-loading");
  continueBtn.innerText = "SENDING...";
  error.innerText = "";
  input.style.borderColor = "#D1D5DB";

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
      console.log(response);
      if (response.status === 404) {
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("signupSection").style.display = "flex";
        document.getElementById("emailInput").value = value;
      }
      input.style.borderColor = "#B91C1C";
      error.innerText = text || "Login failed.";
      continueBtn.disabled = false;
      continueBtn.innerText = "CONTINUE";
      continueBtn.classList.remove("button-loading");
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
      const otpBox = document.querySelector(".otpInputBox");
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
    input.style.borderColor = "#B91C1C";
    error.innerText = "Something went wrong. Please try again.";
    continueBtn.disabled = false;
    continueBtn.innerText = "CONTINUE";
  }
}

function checkOtpAndToggleButton() {
  const otpInputs = document.querySelectorAll(".otpInputBox");
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
  } else if(enteredDigits.length === 0){
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    const otpError = document.getElementById("otpErrorMessage");
    if (otpError) otpError.remove();
  } else {
    signInButton.disabled = true;
    signInButton.style.cursor = "not-allowed";
    signInButton.style.opacity = "0.6";
    signInButton.style.backgroundColor = "transparent";
    signInButton.style.color = "white";
  }
}

function setupOtpListeners() {
  const otpInputs = document.querySelectorAll(".otpInputBox");
  
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      e.target.value = value.slice(0, 1); // allow only first digit
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
  const otpInputs = document.querySelectorAll(".otpInputBox");
  const Phone_Email = document
    .getElementById("userValueDisplay")
    .innerText.trim();
  const Code = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  // Reset previous error styles
  otpInputs.forEach((input) => (input.style.border = "2px solid white"));

  // Remove existing error message
  const oldErr = document.getElementById("otpErrorMessage");
  if (oldErr) oldErr.remove();

  // Show loading UI
  signInBtn.disabled = true;
  signInBtn.classList.add("button-loading");
  signInBtn.innerText = "VERIFYING...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/v1.1/api/LoginCode/Confirm",
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

      // Immediately update header UI
      if (typeof updateUserHeaderUI === "function") {
        updateUserHeaderUI();
      }

      // Proceed next - show phone field if SecondaryContact is null

      if (data.SecondaryContact.includes("null")) {
        // Hide OTP form
        document.getElementById("otpSection").style.display = "none";
        document.getElementById("secondaryContactForm").style.display = "flex";
        const isEmail = data.SecondaryContact == "Email_null";
        const contactType = isEmail ? "email address" : "phone number";

        document.querySelectorAll(".Phone_Email").forEach((el) => {
          el.textContent = contactType;
        });
        if (isEmail)
          document.getElementById("secondaryContactInputEmail").style.display =
            "flex";
        else
          document.getElementById("secondaryContactInputPhone").style.display =
            "flex";
      } else {
        $.magnificPopup.close();
      }
    } else {
      // Error: invalid OTP
      otpInputs.forEach((input) => (input.style.border = "2px solid #B91C1C"));

      const err = document.createElement("div");
      err.id = "otpErrorMessage";
      err.style.color = "#B91C1C";
      err.style.fontSize = "14px";
      err.style.marginTop = "8px";
      err.style.fontFamily = "Poppins, sans-serif";
      err.innerText = "Invalid or expired code. Please try again.";
      document.getElementById("otpResendSection").appendChild(err);
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

function validateInputEmail() {
  const inputElement = document.getElementById("secondaryContactInputEmail");
  const errorDiv = document.getElementById("inputErrorSecondary");
  const input = inputElement.value.trim();
  const continueBtn = document.getElementById("addButton");

  if (input === "") {
    continueBtn.disabled = true;
    errorDiv.textContent = "";
    inputElement.style.borderColor = "#D1D5DB";
    return;
  }

  if (validateEmail(input)) {
    continueBtn.disabled = false;
    errorDiv.textContent = "";
    inputElement.style.opacity = 1;
    inputElement.style.borderColor = "#D1D5DB";
  } else {
    continueBtn.disabled = true;
    errorDiv.textContent = "Please enter a valid email address";
    errorDiv.style.color = "#B91C1C";
    inputElement.style.borderColor = "#B91C1C";
  }
}

function validateInputPhone() {
  const inputElement = document.getElementById("secondaryContactInputPhone");
  const errorDiv = document.getElementById("inputErrorSecondary");
  let input = inputElement.value.trim();
  const continueBtn = document.getElementById("addButton");

  if (input === "") {
    continueBtn.disabled = true;
    errorDiv.textContent = "";
    inputElement.style.borderColor = "#D1D5DB";
    return;
  }
  if (input.length > 10){
    inputElement.value = input.slice(0, 10);
    input = inputElement.value.trim();
  }

  if (validatePhone(input)) {
    continueBtn.disabled = false;
    errorDiv.textContent = "";
    inputElement.style.opacity = 1;
    inputElement.style.borderColor = "#D1D5DB";
  } else {
    continueBtn.disabled = true;
    errorDiv.textContent = "Please enter a valid phone number";
    errorDiv.style.color = "#B91C1C";
    inputElement.style.borderColor = "#B91C1C";
  }
}

function checkSecondaryOtpAndToggleButton() {
  console.log("checkSecondaryOtpAndToggleButton called");
  const otpInputs = document.querySelectorAll(".secondaryotpInputBox");
  const secondaryLoginOTPButton = document.getElementById("secondaryOTPButton");

  const enteredDigits = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  console.log("CALLED checkSecondaryOtpAndToggleButton", enteredDigits);

  if (enteredDigits.length === 6 && /^\d{6}$/.test(enteredDigits)) {
    secondaryLoginOTPButton.disabled = false;
    secondaryLoginOTPButton.style.cursor = "pointer";
    secondaryLoginOTPButton.style.opacity = "1";
    secondaryLoginOTPButton.style.backgroundColor = "white";
    secondaryLoginOTPButton.style.color = "#00B5EF";
  } else if(enteredDigits.length === 0){
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    const otpError = document.getElementById("otpSecondaryLoginErrorMessage");
    if (otpError) otpError.remove();
  } else {
    secondaryLoginOTPButton.disabled = true;
    secondaryLoginOTPButton.style.cursor = "not-allowed";
    secondaryLoginOTPButton.style.opacity = "0.6";
    secondaryLoginOTPButton.style.backgroundColor = "transparent";
    secondaryLoginOTPButton.style.color = "white";
  }
}

function setupSecondaryOtpListeners() {
  const otpInputs = document.querySelectorAll(".secondaryotpInputBox");
  console.log("setupSecondaryOtpListeners called");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      e.target.value = value.slice(0, 1); // allow only first digit
      if (value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }

      checkSecondaryOtpAndToggleButton(); // ✅ Add this here
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener("keyup", () => {
      checkSecondaryOtpAndToggleButton();
    });

    input.addEventListener("keypress", (e) => {
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });
  });

  checkSecondaryOtpAndToggleButton(); // Initial state check
}

async function verifySecondaryContact() {
  const email_input = document.getElementById("secondaryContactInputEmail");
  const phone_input = document.getElementById("secondaryContactInputPhone");
  const addButton = document.getElementById("addButton");
  const error = document.getElementById("inputErrorSecondary");
  const input_value = email_input.value.trim() || phone_input.value.trim();
  const isEmail = email_input.value.trim() !== "" ? true : false;

  const jwtToken = localStorage.getItem("mpp-widgets_AuthToken");
  console.log("JWT Token:", jwtToken);

  // Start sending
  addButton.disabled = true;
  addButton.classList.add("button-loading");
  addButton.innerText = "SENDING...";
  error.innerText = "";
  isEmail
    ? (email_input.style.borderColor = "#D1D5DB")
    : (phone_input.style.borderColor = "#D1D5DB");
  console.log("input_value: " + input_value);
  console.log("input_value: isEmail " + isEmail);

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/My/SecondaryContact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ Phone_Email: input_value }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.log("API Response:", response);
      console.log("API Response:text", text);

      // Success – close modal
      // $.magnificPopup.close();

      isEmail
        ? (email_input.style.borderColor = "#B91C1C")
        : (phone_input.style.borderColor = "#B91C1C");
      error.innerText = text || "Something went wrong. Please try again.";
      addButton.disabled = false;
      addButton.classList.remove("button-loading");
      addButton.innerText = isEmail ? "add email address" : "add phone number";
    } else {
      addButton.disabled = false;
      addButton.classList.remove("button-loading");
      addButton.innerText = isEmail ? "add email address" : "add phone number";
      error.innerText = "";
      document.getElementById("secondaryContactForm").style.display = "none";
      document.getElementById("secondaryotpSection").style.display = "flex";
      document.getElementById("secondaryValueDisplay").innerText = input_value;

      // Focus OTP box
      const otpBox = document.querySelector(".secondaryotpInputBox");
      if (otpBox) otpBox.focus();

      // Optional: Attach OTP listeners once
      // ✅ Replace with this:
      if (typeof setupSecondaryOtpListeners === "function") {
        setupSecondaryOtpListeners();
      }
    }
  } catch (err) {
    isEmail
      ? (email_input.style.borderColor = "#B91C1C")
      : (phone_input.style.borderColor = "#B91C1C");
    error.innerText = "Something went wrong. Please try again.";
    addButton.disabled = false;
    addButton.classList.remove("button-loading");
    addButton.innerText = isEmail ? "add email address" : "add phone number";
  }
}

function showLoginForm() {
  console.log("showLoginForm");
  // Show login form
  const continueBtn = document.getElementById("continueButton");
  continueBtn.classList.remove("button-loading");
  continueBtn.disabled = false;
  continueBtn.innerText = "CONTINUE";
  document.getElementById("loginForm").style.display = "block";

  // Hide OTP form
  document.getElementById("otpSection").style.display = "none";

  // Optional: Reset OTP inputs
  const otpInputs = document.querySelectorAll(".otpInputBox");
  otpInputs.forEach((input) => (input.value = ""));
  // Reset previous error styles
  otpInputs.forEach((input) => (input.style.border = "2px solid white"));
  document.getElementById("userValueDisplay").textContent = "";

  // Optional: Clear any OTP errors
  const otpError = document.getElementById("otpErrorMessage");
  if (otpError) otpError.remove();
}

let isResending = false;

async function resendOtp() {
  console.log("CALLING RESEND OTP", isResending);
  if (isResending) return; // Prevent multiple clicks
  const input = document.getElementById("loginInput");
  const value = input.value.trim();
  const resetCodeLink = document.getElementById("resetCodeLink");
  const otpInputs = document.querySelectorAll(".otpInputBox"); // Remove existing error message
  const oldErr = document.getElementById("otpErrorMessage");
  const signInButton = document.getElementById("signInButton");

  resetCodeLink.classList.add("link-loading");
  resetCodeLink.textContent = "Resending...";

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
      console.log(response);
      if (response.status === 404) {
        console.log(response.status);
        // document.getElementById("loginForm").style.display = "none";
        // document.getElementById("signupSection").style.display = "flex";
      }
      // input.style.borderColor = "#B91C1C";
      // error.innerText = text || "Login failed.";
      resetCodeLink.classList.remove("link-loading");
      resetCodeLink.textContent = "Resend Code";
      isResending = false;
    } else {
      resetCodeLink.classList.remove("link-loading");
      resetCodeLink.textContent = "Resend Code";
      isResending = false;
      // alert(value);
      otpInputs.forEach((input) => (input.value = ""));
      // Reset previous error styles
      otpInputs.forEach((input) => (input.style.border = "2px solid white"));
      if (!oldErr) {
        otpSucess = document.createElement("div");
        otpSucess.id = "otpErrorMessage";
        otpSucess.style.fontSize = "14px";
        otpSucess.style.marginTop = "8px";
        otpSucess.style.color = "Green";
        otpSucess.style.fontFamily = "Poppins, sans-serif";
        otpSucess.innerText = "Verification code sent successfully!";
        otpSucess.classList.add("blink");
        document.getElementById("otpResendSection").appendChild(otpSucess);

        setTimeout(() => {
          if (otpSucess) otpSucess.remove();
        }, 3000);
      }

      oldErr.style.color = "Green";
      oldErr.innerText = "Verification code sent successfully!";
      oldErr.classList.add("blink");

      setTimeout(() => {
        oldErr.innerText = "";
        oldErr.classList.remove("blink");
      }, 3000);

      signInButton.disabled = true;
      signInButton.style.cursor = "not-allowed";
      signInButton.style.opacity = "0.6";
      signInButton.style.backgroundColor = "transparent";
      signInButton.style.color = "white";
    }
  } catch (err) {
    // input.style.borderColor = "#B91C1C";
    // error.innerText = "Something went wrong. Please try again.";

    resetCodeLink.classList.remove("link-loading");
    resetCodeLink.textContent = "Resend Code";
    isResending = false;
  }
}

function resetLoginModalState() {
  console.log("🔁 Resetting modal state...");

  // Login - First Page
  const input = document.getElementById("loginInput");
  const error = document.getElementById("inputError");
  const continueBtn = document.getElementById("continueButton");

  // Login OTP
  const otpInputs = document.querySelectorAll(".otpInputBox");
  const oldErr = document.getElementById("otpErrorMessage");

  // Secondary contact
  document.getElementById("secondaryContactInputEmail").value = "";
  document.getElementById("secondaryContactInputPhone").value = "";
  document.querySelector(".Phone_Email").innerText = "";
  document.getElementById("inputErrorSecondary").innerText = "";
  const addButton = document.getElementById("addButton");

  // Secondary OTP section
  document.getElementById("secondaryValueDisplay").innerText = "";
  const secondaryotpInputs = document.querySelectorAll(".secondaryotpInputBox");
  const secondaryOTPButton = document.getElementById("secondaryOTPButton");

  if (input) {
    input.value = "";
    input.style.borderColor = "";
  }

  if (error) {
    error.innerText = "";
  }

  if (continueBtn) {
    continueBtn.innerText = "CONTINUE";
    continueBtn.disabled = true;
    continueBtn.classList.remove("button-loading");
  }

  if (oldErr) oldErr.remove();

  if (otpInputs) {
    otpInputs.forEach((input) => {
      input.value = "";
      input.style.border = "2px solid white";
    });
  }

  if (addButton) {
    addButton.disabled = true;
    addButton.classList.remove("button-loading");
  }

  if (secondaryotpInputs) {
    secondaryotpInputs.forEach((input) => {
      input.value = "";
      input.style.border = "2px solid white";
    });
  }

  if (secondaryOTPButton) {
    secondaryOTPButton.disabled = true;
    secondaryOTPButton.classList.remove("button-loading");
  }

  // Reset form sections
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("otpSection").style.display = "none";
  document.getElementById("secondaryContactForm").style.display = "none";
  document.getElementById("signupSection").style.display = "none";
}

// Close button click listener
document.addEventListener("click", function (e) {
  const isCloseButton = e.target.closest(".mfp-close");

  if (isCloseButton) {
    console.log("✅ DIVI modal close button clicked");
    resetLoginModalState();
  }
});

// DIVI modal closed via overlay or close button
jQuery(document).ready(function ($) {
  $(document).on("mfpClose", function () {
    console.log("✅ Modal closed (by close button or outside click)");
    // Enable scrolling
    // document.body.style.overflow = '';
    // document.body.style.position = '';
    // document.body.style.width = '';
 
    resetLoginModalState();
  });

  $(document).on("mfpOpen", function () {
    const successModal = document.getElementById("successModal");
    const mfpBg = document.querySelector(".mfp-bg");

    // Disable scrolling
    // document.body.style.overflow = 'hidden';
    // document.body.style.position = 'fixed'; 
    // document.body.style.width = '100%';  

    if (mfpBg && successModal) {
      const style = window.getComputedStyle(successModal);
      if (style.display === "flex") {
        mfpBg.classList.add("no-bg");
        mfpBg.classList.remove("fadeIn", "animated");
      } else {
        mfpBg.classList.remove("no-bg");
      }
    }
  });

});

// ----------------------------------SING UP---------------------------
function validateFirstName() {
  const firstName = document.getElementById("firstNameInput");
  const firstNameError = document.getElementById("inputErrorFirstName");

  const input = firstName.value.trim();
  if (input === "") {
    firstNameError.textContent = "";
    firstName.style.borderColor = "#D1D5DB"; // Reset to normal border
    return false;
  } else if (input.length > 25) {
    firstNameError.textContent =
      "First name should not be greater than 25 characters.";
    firstNameError.style.color = "#B91C1C";
    firstName.style.borderColor = "#B91C1C"; // Add red border
    return false;
  } else {
    firstNameError.textContent = "";
    firstName.style.borderColor = "#D1D5DB"; // Reset to normal border
    return true;
  }
}

function validateLastName() {
  const lastName = document.getElementById("lastNameInput");
  const lastNameError = document.getElementById("inputErrorLastName");

  const input = lastName.value.trim();
  if (input === "") {
    lastNameError.textContent = "";
    lastName.style.borderColor = "#D1D5DB"; // Reset to normal border
    return false;
  } else if (input.length > 25) {
    lastNameError.textContent =
      "Last name should not be greater than 25 characters.";
    lastNameError.style.color = "#B91C1C";
    lastName.style.borderColor = "#B91C1C"; // Add red border
    return false;
  } else {
    lastNameError.textContent = "";
    lastName.style.borderColor = "#D1D5DB"; // Reset to normal border
    return true;
  }
}

let emailTouched = false;

function validateSignupInput(event) {
  const inputElement = document.getElementById("emailInput");
  const errorDiv = document.getElementById("inputErrorEmail");

  if (event?.target?.id === "emailInput") {
    emailTouched = true;
  }

  const isFirstNameValid = validateFirstName();
  const isLastNameValid = validateLastName();
  const input = inputElement.value.trim();
  const signUpButton = document.getElementById("signUpButton");

  if (input === "") {
    if (emailTouched || !event) {
      errorDiv.textContent = "Email or phone number is required.";
      errorDiv.style.color = "#B91C1C";
      inputElement.style.borderColor = "#B91C1C";
    }
    signUpButton.disabled = true;
    signUpButton.style.cursor = "not-allowed";
    return false;
  }

  const isEmailValid = validateEmail(input);
  const isPhoneValid = validatePhone(input);
  const isEmailOrPhoneValid = isEmailValid || isPhoneValid;

  const allValid = isFirstNameValid && isLastNameValid && isEmailOrPhoneValid;

  if ((emailTouched || !event) && !isEmailOrPhoneValid) {
    errorDiv.textContent =
      "Please enter a valid email address or 10-digit phone number.";
    errorDiv.style.color = "#B91C1C";
    inputElement.style.borderColor = "#B91C1C";
  } else if (emailTouched || !event) {
    errorDiv.textContent = "";
    inputElement.style.borderColor = "#D1D5DB";
  }

  signUpButton.disabled = !allValid;
  signUpButton.style.cursor = allValid ? "pointer" : "not-allowed";

  return allValid;
}

async function submitSignup(event) {
  event.preventDefault();
  const firstName = document.getElementById("firstNameInput");
  const lastName = document.getElementById("lastNameInput");
  const emailInput = document.getElementById("emailInput");
  const errorDiv = document.getElementById("inputErrorEmail");
  const signUpButton = document.getElementById("signUpButton");
  const errorFirstName = document.getElementById("inputErrorFirstName");
  const errorlastName = document.getElementById("inputErrorLastName");

  const isValid = validateSignupInput(); // No event passed
  const email_phone = emailInput.value.trim();
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();

  if (!isValid) return;

  const payload = {
    code: {
      Phone_Email: email_phone,
    },
    First_Name: firstNameValue,
    Last_Name: lastNameValue,
  };

  // Start sending
  signUpButton.disabled = true;
  signUpButton.classList.add("button-loading");
  signUpButton.innerText = "SENDING...";
  errorDiv.innerText = "";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/SignupCode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      if (firstName.value.trim().length === 0) {
        // status - 400
        errorFirstName.innerText = "First name is required.";
        errorFirstName.style.color = "#B91C1C";
        document.getElementById("firstNameInput").style.borderColor = "#B91C1C";
      }
      if (lastName.value.trim().length === 0) {
        errorlastName.innerText = "Last name is required.";
        errorlastName.style.color = "#B91C1C";
        lastName.style.borderColor = "#B91C1C";
      }
      if (emailInput.value.trim().length === 0) {
        errorDiv.innerText = "Email or phone number is required.";
        errorDiv.style.color = "#B91C1C";
        emailInput.style.borderColor = "#B91C1C";
      }
      emailInput.style.borderColor = "#B91C1C";
      errorDiv.innerText = text || "Login failed.";
      signUpButton.classList.remove("button-loading");
      signUpButton.disabled = false;
      signUpButton.innerText = "CONTINUE";
    } else {
      console.log("API Response:else", response);
      signUpButton.classList.remove("button-loading");
      signUpButton.disabled = false;
      signUpButton.innerText = "CONTINUE";
      document.getElementById("signupSection").style.display = "none";
      document.getElementById("signupotpSection").style.display = "flex";
      document.getElementById("signupUserValueDisplay").innerText = email_phone;
      errorFirstName.innerText = "";
      errorlastName.innerText = "";
      errorDiv.innerText = "";

      console.log("API Response:", response);
      console.log("API Response:text", text);
      console.log("API Response:firstName length", firstNameValue);
      console.log("API Response:lastName length", lastNameValue);
      console.log("API Response:emailInput length", email_phone);

      // Focus OTP box
      const otpBox = document.querySelector(".signupotpInputBox");
      if (otpBox) otpBox.focus();

      // Optional: Attach OTP listeners once
      if (!window.otpListenersAttached) {
        if (typeof setupSignUpOtpListeners === "function") {
          setupSignUpOtpListeners();
          window.otpListenersAttached = true;
        }
      }
    }
  } catch (error) {
    console.error("Error submitting signup:", error);
    emailInput.style.borderColor = "#B91C1C";
    errorDiv.innerText = "Something went wrong. Please try again.";
    signUpButton.disabled = false;
    signUpButton.innerText = "CONTINUE";
    alert("An error occurred while submitting your signup. Please try again.");
  }
}

function showSignupForm() {
  console.log("showSignupForm");
  // Show login form
  const singupBtn = document.getElementById("signUpButton");

  // const signUpOTPButton = document.getElementById("signupOTPButton");
  singupBtn.classList.remove("button-loading");
  singupBtn.disabled = false;
  singupBtn.innerText = "CONTINUE";
  document.getElementById("signupSection").style.display = "block";

  // Hide OTP form
  document.getElementById("signupotpSection").style.display = "none";

  // Optional: Reset OTP inputs
  const otpInputs = document.querySelectorAll(".signupotpInputBox");
  otpInputs.forEach((input) => (input.value = ""));
  otpInputs.forEach((input) => (input.style.border = "2px solid white"));
  document.getElementById("signupUserValueDisplay").textContent = "";

  // Optional: Clear any OTP errors
  const otpError = document.getElementById("otpSignupErrorMessage");
  if (otpError) otpError.remove();
}

function checkSignupOtpAndToggleButton() {
  const otpInputs = document.querySelectorAll(".signupotpInputBox");
  const signUpOTPButton = document.getElementById("signupOTPButton");

  const enteredDigits = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  if (enteredDigits.length === 6 && /^\d{6}$/.test(enteredDigits)) {
    signUpOTPButton.disabled = false;
    signUpOTPButton.style.cursor = "pointer";
    signUpOTPButton.style.opacity = "1";
    signUpOTPButton.style.backgroundColor = "white";
    signUpOTPButton.style.color = "#00B5EF";
  }else if(enteredDigits.length === 0){
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    const otpError = document.getElementById("otpSignupErrorMessage");
    if (otpError) otpError.remove();
  }  else {
    signUpOTPButton.disabled = true;
    signUpOTPButton.style.cursor = "not-allowed";
    signUpOTPButton.style.opacity = "0.6";
    signUpOTPButton.style.backgroundColor = "transparent";
    signUpOTPButton.style.color = "white";
  }
}

function setupSignUpOtpListeners() {
  const otpInputs = document.querySelectorAll(".signupotpInputBox");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      e.target.value = value.slice(0, 1); // allow only first digit
      if (value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }

      checkSignupOtpAndToggleButton(); // ✅ Add this here
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener("keyup", () => {
      checkSignupOtpAndToggleButton();
    });

    input.addEventListener("keypress", (e) => {
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });
  });

  checkSignupOtpAndToggleButton(); // Initial state check
}

let isSignUpResending = false;

async function resendSignUpOtp() {
  console.log("CALLING RESEND OTP", isSignUpResending);
  if (isSignUpResending) return; // Prevent multiple clicks

  const firstName = document.getElementById("firstNameInput");
  const lastName = document.getElementById("lastNameInput");
  const emailInput = document.getElementById("emailInput");
  const resetCodeLink = document.getElementById("signupResetCodeLink");
  const otpInputs = document.querySelectorAll(".signupotpInputBox"); // Remove existing error message
  const signUpOtpBtn = document.getElementById("signupOTPButton");
  const oldErr = document.getElementById("otpSignupErrorMessage");

  const isValid = validateSignupInput(); // No event passed
  const email_phone = emailInput.value.trim();
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();

  if (!isValid) return;

  const payload = {
    code: {
      Phone_Email: email_phone,
    },
    First_Name: firstNameValue,
    Last_Name: lastNameValue,
  };

  resetCodeLink.classList.add("link-loading");
  resetCodeLink.textContent = "Resending...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/SignupCode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.log(response);
      if (response.status === 404) {
        console.log(response.status);
      }

      resetCodeLink.classList.remove("link-loading");
      resetCodeLink.textContent = "Resend Code";
      isSignUpResending = false;
    } else {
      resetCodeLink.classList.remove("link-loading");
      resetCodeLink.textContent = "Resend Code";
      isSignUpResending = false;
      // alert(value);
      otpInputs.forEach((input) => (input.value = ""));
      // Reset previous error styles
      otpInputs.forEach((input) => (input.style.border = "2px solid white"));
      if (!oldErr) {
        otpSucess = document.createElement("div");
        otpSucess.id = "otpSignupErrorMessage";
        otpSucess.style.fontSize = "14px";
        otpSucess.style.marginTop = "8px";
        otpSucess.style.color = "Green";
        otpSucess.style.fontFamily = "Poppins, sans-serif";
        otpSucess.innerText = "Verification code sent successfully!";
        otpSucess.classList.add("blink");
        document
          .getElementById("signupotpResendSection")
          .appendChild(otpSucess);

        setTimeout(() => {
          if (otpSucess) otpSucess.remove();
        }, 3000);
      }

      oldErr.style.color = "Green";
      oldErr.innerText = "Verification code sent successfully!";
      oldErr.classList.add("blink");

      setTimeout(() => {
        oldErr.innerText = "";
        oldErr.classList.remove("blink");
      }, 3000);

      signUpOtpBtn.disabled = true;
      signUpOtpBtn.style.cursor = "not-allowed";
      signUpOtpBtn.style.opacity = "0.6";
      signUpOtpBtn.style.backgroundColor = "transparent";
      signUpOtpBtn.style.color = "white";
    }
  } catch (err) {
    resetCodeLink.classList.remove("link-loading");
    resetCodeLink.textContent = "Resend Code";
    isSignUpResending = false;
  }
}

async function verifySingupOtp() {
  const signUpOtpBtn = document.getElementById("signupOTPButton");
  const signUpotpInputs = document.querySelectorAll(".signupotpInputBox");

  const firstName = document.getElementById("firstNameInput");
  const lastName = document.getElementById("lastNameInput");
  const emailInput = document.getElementById("emailInput");

  const Code = Array.from(signUpotpInputs)
    .map((input) => input.value.trim())
    .join("");

  const email_phone = emailInput.value.trim();
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();

  const payload = {
    code: {
      Phone_Email: email_phone,
      Code,
      DeviceID: "string",
      API_Key: "string",
    },
    First_Name: firstNameValue,
    Last_Name: lastNameValue,
  };

  // Reset previous error styles
  signUpotpInputs.forEach((input) => (input.style.border = "2px solid white"));

  // Remove existing error message
  const oldErr = document.getElementById("otpSignupErrorMessage");
  if (oldErr) oldErr.remove();

  // Show loading UI
  signUpOtpBtn.disabled = true;
  signUpOtpBtn.classList.add("button-loading");
  signUpOtpBtn.innerText = "VERIFYING...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/SignUpCode/Confirm", // needs to be changed to new version v1.1
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ OTP Verified:", data);

      // Save JWT Token
      localStorage.setItem("mpp-widgets_AuthToken", data.JwtToken);

      // Proceed next - show phone field if SecondaryContact is null
      // alert("SecondaryContact: " + data.SecondaryContact);
      if (data.SecondaryContact.includes("null")) {
        // Hide OTP form
        document.getElementById("signupotpSection").style.display = "none";
        document.getElementById("secondaryContactForm").style.display = "flex";
        const isEmail = data.SecondaryContact == "Email_null";
        const contactType = isEmail ? "email address" : "phone number";

        if (isEmail) {
          document.getElementById("secondaryContactInputEmail").style.display =
            "flex";
        } else {
          document.getElementById("secondaryContactInputPhone").style.display =
            "flex";
        }

        const placeholder = false
          ? "Enter your Email Address"
          : "Enter your Phone Number";

        document.querySelectorAll(".Phone_Email").forEach((el) => {
          el.textContent = contactType;
        });
      } else {
        // Need to handle if user created an account but for some reason he has deleted and again trying to signup
        // in this scenario he might have added an secondary contact when he previously created an account so we are mapping to the old account
        // so secondary contact will not be null
        // Close the modal
        $.magnificPopup.close();

        // Show success message or redirect
        alert("Sign up successful! You are now logged in.");
      }
    } else {
      console.log("✅ OTP failed:", response);
      // Error: invalid OTP
      signUpotpInputs.forEach(
        (input) => (input.style.border = "2px solid #B91C1C")
      );

      const err = document.createElement("div");
      err.id = "otpSignupErrorMessage";
      err.style.color = "#B91C1C";
      err.style.fontSize = "14px";
      err.style.marginTop = "8px";
      err.style.fontFamily = "Poppins, sans-serif";
      err.innerText = "Invalid or expired code. Please try again.";
      document.getElementById("signupotpResendSection").appendChild(err);
    }
  } catch (err) {
    alert("Something went wrong. Please try again.");
    console.error("❌ OTP verification failed:", err);
  }

  // Reset button
  signUpOtpBtn.disabled = false;
  signUpOtpBtn.classList.remove("button-loading");
  signUpOtpBtn.innerText = "SIGN IN";
}

function showAddSecondaryContactForm() {
  console.log("showAddSecondaryContactForm");
  // Show login form
  const singupBtn = document.getElementById("addButton");
  singupBtn.classList.remove("button-loading");
  singupBtn.disabled = false;
  singupBtn.innerText = "ADD PHONE NUMBER";
  document.getElementById("secondaryContactForm").style.display = "flex";

  // Hide OTP form
  document.getElementById("secondaryotpSection").style.display = "none";

  // Optional: Reset OTP inputs
  const otpInputs = document.querySelectorAll(".secondaryotpInputBox");
  otpInputs.forEach((input) => (input.value = ""));
  // Reset previous error styles
  otpInputs.forEach((input) => (input.style.border = "2px solid white"));
  document.getElementById("secondaryValueDisplay").textContent = "";

  // Optional: Clear any OTP errors
  const otpError = document.getElementById("otpSecondaryLoginErrorMessage");
  if (otpError) otpError.remove();
}

async function secodaryLoginverifyOtp() {
  const secondaryLoginOtpBtn = document.getElementById("secondaryOTPButton");
  const secondaryLoginotpInputs = document.querySelectorAll(
    ".secondaryotpInputBox"
  );
  const errorDiv = document.getElementById("inputErrorSecondary");

  const email_input = document.getElementById("secondaryContactInputEmail");
  const phone_input = document.getElementById("secondaryContactInputPhone");

  const email_phone = email_input.value.trim() || phone_input.value.trim();
  const jwtToken = localStorage.getItem("mpp-widgets_AuthToken");
  console.log("JWT Token:", jwtToken);

  const Code = Array.from(secondaryLoginotpInputs)
    .map((input) => input.value.trim())
    .join("");

  const payload = {
    Phone_Email: email_phone,
    Code: Code,
    DeviceID: "string",
    API_Key: "string",
  };

  // Reset previous error styles
  secondaryLoginotpInputs.forEach(
    (input) => (input.style.border = "2px solid white")
  );

  // Remove existing error message
  const oldErr = document.getElementById("otpSecondaryLoginErrorMessage");
  if (oldErr) oldErr.remove();

  // Start sending
  secondaryLoginOtpBtn.disabled = true;
  secondaryLoginOtpBtn.classList.add("button-loading");
  secondaryLoginOtpBtn.innerText = "VERIFYING...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/My/SecondaryContact/Confirm",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();
    console.log("API Response:", response);
    console.log("API Response:text", text);
    if (response.ok) {
      console.log("✅ OTP success:", response);
      // Start sending
      secondaryLoginOtpBtn.disabled = false;
      secondaryLoginOtpBtn.classList.remove("button-loading");
      secondaryLoginOtpBtn.innerText = "VERIFY";
      //NEEDTOWORK - CONGRATS MODAL
      closeModal();
    } else {
      console.log("✅ OTP failed:", response);
      secondaryLoginotpInputs.forEach(
        (input) => (input.style.border = "2px solid #B91C1C")
      );

      const secondaryotperr = document.createElement("div");
      secondaryotperr.id = "otpSecondaryLoginErrorMessage";
      secondaryotperr.style.color = "#B91C1C";
      secondaryotperr.style.fontSize = "14px";
      secondaryotperr.style.marginTop = "8px";
      secondaryotperr.innerText =
        text || "Invalid or expired code. Please try again.";
      document
        .getElementById("secondaryLoginotpResendSection")
        .appendChild(secondaryotperr);
      secondaryLoginOtpBtn.disabled = false;
      secondaryLoginOtpBtn.classList.remove("button-loading");
      secondaryLoginOtpBtn.innerText = "VERIFY";
    }
  } catch (err) {
    // alert("Something went wrong. Please try again.");
    console.error("❌ OTP verification failed:", err);
    secondaryLoginotpInputs.forEach(
      (input) => (input.style.border = "2px solid #B91C1C")
    );

    const secondaryotperr = document.createElement("div");
    secondaryotperr.id = "otpSecondaryLoginErrorMessage";
    secondaryotperr.style.color = "#B91C1C";
    secondaryotperr.style.fontSize = "14px";
    secondaryotperr.style.marginTop = "8px";
    secondaryotperr.innerText = "Something went wrong. Please try again.";
    document
      .getElementById("secondaryLoginotpResendSection")
      .appendChild(secondaryotperr);
    secondaryLoginOtpBtn.disabled = false;
    secondaryLoginOtpBtn.classList.remove("button-loading");
    secondaryLoginOtpBtn.innerText = "VERIFY";
    return;
  }

  console.log("secodaryLoginverifyOtp", payload);
}

let isSecondaryLoginResending = false;
async function resendSecondaryLoginOtp() {
  console.log(
    "CALLING RESEND OTP isSecondaryLoginResending",
    isSecondaryLoginResending
  );

  if (isSecondaryLoginResending) return; // Prevent multiple clicks

  const email_input = document.getElementById("secondaryContactInputEmail");
  const phone_input = document.getElementById("secondaryContactInputPhone");
  const email_phone = email_input.value.trim() || phone_input.value.trim();

  const resetCodeLink = document.getElementById("secondaryLoginresetCodeLink");
  const otpInputs = document.querySelectorAll(".secondaryotpInputBox"); // Remove existing error message
  const signUpOtpBtn = document.getElementById("secondaryOTPButton");
  const oldErr = document.getElementById("otpSecondaryLoginErrorMessage");
  const jwtToken = localStorage.getItem("mpp-widgets_AuthToken");
  console.log("JWT Token:", jwtToken);

  const payload = {
    Phone_Email: email_phone,
  };

  console.log("object", payload);

  resetCodeLink.classList.add("link-loading");
  resetCodeLink.textContent = "Resending...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/My/SecondaryContact",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();
    console.log("object", text);

    if (!response.ok) {
      console.log("✅ Resend OTP failed:", response);

      if (response.status === 404) {
        console.log(response.status);
      }

      resetCodeLink.classList.remove("link-loading");
      resetCodeLink.textContent = "Resend Code";
      isSecondaryLoginResending = false;
    } else {
      resetCodeLink.classList.remove("link-loading");
      resetCodeLink.textContent = "Resend Code";
      isSecondaryLoginResending = false;
      otpInputs.forEach((input) => (input.value = "")); // Reset previous error styles
      otpInputs.forEach((input) => (input.style.border = "2px solid white"));
      if (!oldErr) {
        otpSucess = document.createElement("div");
        otpSucess.id = "otpSecondaryLoginErrorMessage";
        otpSucess.style.fontSize = "14px";
        otpSucess.style.marginTop = "8px";
        otpSucess.style.color = "Green";
        otpSucess.innerText = "Verification code sent successfully!";
        otpSucess.classList.add("blink");
        document
          .getElementById("secondaryLoginotpResendSection")
          .appendChild(otpSucess);

        setTimeout(() => {
          if (otpSucess) otpSucess.remove();
        }, 3000);
      }

      oldErr.style.color = "Green";
      oldErr.innerText = "Verification code sent successfully!";
      oldErr.classList.add("blink");

      setTimeout(() => {
        oldErr.innerText = "";
        oldErr.classList.remove("blink");
      }, 3000);

      signUpOtpBtn.disabled = true;
      signUpOtpBtn.style.cursor = "not-allowed";
      signUpOtpBtn.style.opacity = "0.6";
      signUpOtpBtn.style.backgroundColor = "transparent";
      signUpOtpBtn.style.color = "white";
    }
  } catch (err) {
    console.log("err", err);
    resetCodeLink.classList.remove("link-loading");
    resetCodeLink.textContent = "Resend Code";
    isSecondaryLoginResending = false;
  }
}

function closeModal() {
  $.magnificPopup.close();
}

function updateUserHeaderUI() {
  const token = localStorage.getItem("mpp-widgets_AuthToken");
  const loginButton = document.getElementById("loginButton");
  const userInfo = document.getElementById("user-info");
  const userAvatar = document.getElementById("user-avatar");
  const userNameSpan = document.getElementById("user-name");

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded JWT payload:", payload);

      const firstName = payload.FirstName || "";
      const lastName = payload.LastName || "";
      const email = payload.UserName || "";

      const fullName =
        firstName && lastName ? `${firstName} ${lastName}` : email;
      const initials =
        firstName && lastName
          ? `${firstName.charAt(0)}${lastName.charAt(0)}`
          : email.charAt(0).toUpperCase();

      // Update UI
      if (loginButton) loginButton.style.display = "none";
      if (userInfo) {
        userInfo.style.display = "flex";
        userAvatar.textContent = initials;
        userNameSpan.textContent = fullName;
      }
    } catch (error) {
      console.error("Invalid JWT token", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", updateUserHeaderUI);
