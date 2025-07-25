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
      "https://mobileserverdev.calvaryftl.org/v1.0/api/LoginCode/Confirm", // needs to be changed to new version v1.1
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
      // alert("SecondaryContact: " + data.SecondaryContact);
      if (data.SecondaryContact == null) {
        const isEmail = Phone_Email.includes("@");
        const contactType = !isEmail ? "email address" : "phone number";
        const placeholder = !isEmail
          ? "Enter your Email Address"
          : "Enter your Phone Number";

        document.querySelectorAll(".Phone_Email").forEach((el) => {
          el.textContent = contactType;
        });

        document.getElementById("secondaryContactInput").placeholder =
          placeholder;
      }
      // Hide OTP form
      document.getElementById("otpSection").style.display = "none";

      document.getElementById("secondaryContactForm").style.display = "flex";
    } else {
      // Error: invalid OTP
      otpInputs.forEach((input) => (input.style.border = "2px solid #B91C1C"));

      const err = document.createElement("div");
      err.id = "otpErrorMessage";
      err.style.color = "#B91C1C";
      err.style.fontSize = "14px";
      err.style.marginTop = "8px";
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

function verifySecondaryContact() {
  const input = document.getElementById("secondaryContactInput");
  // const continueBtn = document.getElementById("continueButton");
  const error = document.getElementById("inputErrorSecondary");
  const value = input.value.trim();

  // Double check validation before calling API
  if (!(validateEmail(value) || validatePhone(value))) {
    error.innerText = "Please enter a valid email or phone number.";
    input.style.borderColor = "#B91C1C";
    return;
  }
}

function showLoginForm() {
  console.log("showLoginForm");
  // Show login form
  const continueBtn = document.getElementById("continueButton");
  continueBtn.classList.remove("button-loading");
  continueBtn.innerText = "CONTINUE";
  document.getElementById("loginForm").style.display = "block";

  // Hide OTP form
  document.getElementById("otpSection").style.display = "none";

  // Optional: Reset OTP inputs
  const otpInputs = document.querySelectorAll(".otpInputBox");
  otpInputs.forEach((input) => (input.value = ""));

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

document.addEventListener("click", function (e) {
  // Match only the close button with class "mfp-close"
  const isCloseButton = e.target.closest(".mfp-close");

  if (isCloseButton) {
    console.log("✅ DIVI modal close button clicked");

    // Clear your modal-related inputs here
    const input = document.getElementById("loginInput");
    const continueBtn = document.getElementById("continueButton");
    const error = document.getElementById("inputError");
    const otpInputs = document.querySelectorAll(".otpInputBox");
    const oldErr = document.getElementById("otpErrorMessage");

    if (oldErr) oldErr.remove();

    if (otpInputs) {
      otpInputs.forEach((input) => (input.value = ""));
      // Reset previous error styles
      otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    }

    if (input) {
      input.value = "";
      input.style.borderColor = "";
    }

    if (error) {
      error.innerText = "";
    }

    if (continueBtn) {
      continueBtn.innerText = "CONTINUE";
    }
  }
});

jQuery(document).ready(function ($) {
  $(document).on("mfpClose", function () {
    console.log("Modal closed (by close button or outside click)");

    const input = document.getElementById("loginInput");
    const continueBtn = document.getElementById("continueButton");
    const error = document.getElementById("inputError");

    if (input) {
      input.value = "";
      input.style.borderColor = "";
    }
    if (error) error.innerText = "";
    if (continueBtn) {
      continueBtn.innerText = "CONTINUE";
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
  
  const signUpOTPButton = document.getElementById("signupOTPButton");
  singupBtn.classList.remove("button-loading");
  singupBtn.innerText = "CONTINUE";
  document.getElementById("signupSection").style.display = "block";

  // Hide OTP form
  document.getElementById("signupotpSection").style.display = "none";

  // Optional: Reset OTP inputs
  const otpInputs = document.querySelectorAll(".signupotpInputBox");
  otpInputs.forEach((input) => (input.value = ""));
  signUpOTPButton.disabled = true;

  // Optional: Clear any OTP errors
  const otpError = document.getElementById("otpErrorMessage");
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
  } else {
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
