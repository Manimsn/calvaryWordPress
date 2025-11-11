const login = document.getElementById("loginButton");
const inputElement = document.getElementById("loginInput");
const errorDiv = document.getElementById("inputError");
let globalSuccessText = document.getElementById("secondaryContactSuccess");
let nickname = document.getElementById("nickName");
let phone_email = "";
let signUpPayload = {
  code: {},
  First_Name: "",
  Last_Name: "",
};
let timeoutDidnotReceiveMessage;
let userNameForgotPass = false;

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
  const errorDivText = document.querySelector('#inputError .errorText')
  const input = inputElement.value.trim();
  const continueBtn = document.getElementById("continueButton");

  if (input === "") {
    continueBtn.disabled = true;
    errorDivText.textContent = "";
    errorDiv.style.visibility = 'hidden';
    inputElement.style.borderColor = "#D1D5DB";
    return;
  }

  if (validateEmail(input) || validatePhone(input)) {
    continueBtn.disabled = false;
    errorDivText.textContent = "";
    errorDiv.style.visibility = 'hidden';
    inputElement.style.borderColor = "#D1D5DB"; // Reset to normal border
  } else {
    continueBtn.disabled = true;
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent = "Please enter a 10-digit cell phone number or valid email address.";
    inputElement.style.borderColor = "#B91C1C"; // Add red border
  }

  if(input.length == 255){
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent = "You’ve reached the 255-character limit";
    inputElement.style.borderColor = "#D1D5DB";
  }
}

function onBlurvalidatePhone() {
  const inputElement = document.getElementById("loginInput");
  const rawInput = inputElement.value.trim();

  const formattedPattern = /^\d{3}-\d{3}-\d{4}$/;
  if (formattedPattern.test(rawInput)) {
    return;
  }

  const digitsOnly = rawInput.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    const formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
      3,
      6
    )}-${digitsOnly.slice(6)}`;
    inputElement.value = formatted;
  } else {
    inputElement.value = rawInput;
  }
}

async function handleLogin() {
  onBlurvalidatePhone();
  const input = document.getElementById("loginInput");
  const continueBtn = document.getElementById("continueButton");
  const error = document.getElementById("inputError");
  const errorDivText = document.querySelector('#inputError .errorText')
  let value = input.value.trim();

  // Double check validation before calling API
  if (!(validateEmail(value) || validatePhone(value))) {
    error.style.visibility = 'hidden';
    errorDivText.innerText = "Please enter a valid email or cell phone number.";
    input.style.borderColor = "#B91C1C";
    return;
  }

  // Start sending
  continueBtn.disabled = true;
  continueBtn.classList.add("button-loading");
  continueBtn.innerText = "SENDING...";
  error.style.visibility = 'hidden';
  errorDivText.innerText = "";
  input.style.borderColor = "#D1D5DB";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/v1.2/api/Login",
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
        if (!value.includes("@")) {
          document.querySelector("label[for='signupemail']").innerHTML =
            "Cell Phone Number*";
          const input = document.getElementById("emailInput");
          input.classList.add("no-spinner");
          input.type = "tel";
          input.setAttribute("pattern", "[0-9\\-]*");
          input.setAttribute("inputmode", "numeric");
          input.setAttribute("placeholder", "999-999-9999");
          const formattedPattern = /^\d{3}-\d{3}-\d{4}$/;
          if (!formattedPattern.test(value)) {
            value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(
              6
            )}`;
          }
        }
        document.getElementById("emailInput").value = value;
      }
      input.style.borderColor = "#B91C1C";
      error.style.visibility = 'visible';
      errorDivText.innerText = text || "Login failed.";
      continueBtn.disabled = false;
      continueBtn.innerText = "CONTINUE";
      continueBtn.classList.remove("button-loading");
      continueBtn.style.border = "1px solid white";
      continueBtn.style.color = "white";
    } else if (text.includes("Your authentication code was sent by")) {
      // Success – show OTP section
      document.getElementById("otpSection").style.display = "flex";
      timeoutDidnotReceiveMessage = setTimeout(showLDidnotReceiveMessage, 10000);
      document.getElementById("signInButton").disabled = true;
      document.getElementById("userValueDisplay").innerText = value;
      phone_email = value;
      // Hide initial login form
      // document.querySelector("img").style.display = "none";
      // document.querySelector("h2").style.display = "none";
      // document.querySelector("p").style.display = "none";
      document.getElementById("loginForm").style.display = "none";
      // input.style.display = "none";
      // continueBtn.style.display = "none";
      error.style.visibility = 'hidden';
      errorDivText.innerText = "";

      // Focus OTP box
      const otpBox = document.querySelector(".otpInputBox");
      if (otpBox) otpBox.focus();

      // Optional: Attach OTP listeners once
      // if (!window.otpListenersAttached) {
        if (typeof setupOtpListeners === "function") {
          setupOtpListeners();
        //   window.otpListenersAttached = true;
        // }
      }
    }
    else {
      // Password prompt
      document.getElementById("exPasswordForm").style.display = "flex";
      document.getElementById("loginForm").style.display = "none";
      nickname.innerText = text.replace(/^"|"$/g, "");
      phone_email = value;
    }
  } catch (err) {
    input.style.borderColor = "#B91C1C";
    error.style.visibility = 'visible';
    errorDivText.innerText = "Something went wrong. Please try again.";
    continueBtn.disabled = false;
    continueBtn.innerText = "CONTINUE";
  }
}

function checkshowLoginForm(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showLoginForm();
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
  } else {
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    const otpError = document.getElementById("otpErrorMessage");
    if (otpError) otpError.remove();
    signInButton.disabled = true;
  }
}

function setupOtpListeners() {
  const otpInputs = document.querySelectorAll(".otpInputBox");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      if (value.length === 6) {
        for (let i = 0; i < 6; i++) {
          if (otpInputs[i]) {
            otpInputs[i].value = value[i];
          }
        }
        otpInputs[5].focus();
      }
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
      // paste for safari ----------------------------------------
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        setTimeout(async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (text && /^\d{6}$/.test(text)) {
              for (let i = 0; i < otpInputs.length; i++) {
                otpInputs[i].value = text[i] || "";
              }
              otpInputs[5].focus();
              checkOtpAndToggleButton();
            }
          } catch (err) {
            console.warn("Clipboard read failed", err);
          }
        }, 0);
      }
      // ---------------------------------------
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const btn = document.getElementById("signInButton");
        if (!btn.disabled) {
          btn.click();
        }
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
      "https://mobileserverdev.calvaryftl.org/v1.2/api/LoginCode/Confirm",
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

      document.getElementById("setPasswordForm").style.display = "flex";
      document.getElementById("otpSection").style.display = "none";
      phone_email = Phone_Email;

    } else {
      // Error: invalid OTP
      otpInputs.forEach((input) => (input.style.border = "2px solid #B91C1C"));
      const exclamationSpan = document.createElement('span');
      exclamationSpan.classList.add('helperText');
      exclamationSpan.textContent = '!';
      const err = document.createElement("div");
      err.id = "otpErrorMessage";
      err.style.color = "#B91C1C";
      err.style.fontSize = "14px";
      err.style.marginTop = "8px";
      err.style.fontFamily = "Poppins, sans-serif";
      err.style.visibility = 'visible';
      const errorTextSpan = document.createElement('span');
      errorTextSpan.classList.add('errorText');
      errorTextSpan.innerText = "Invalid or expired code. Please try again.";
      document.getElementById("otpResendSection").appendChild(err);
      document.getElementById("otpErrorMessage").appendChild(exclamationSpan);
      document.getElementById("otpErrorMessage").appendChild(errorTextSpan);
    }
  } catch (err) {
    alert("Something went wrong. Please try again.");
    console.error("❌ OTP verification failed:", err);
  }

  // Reset button
  signInBtn.disabled = false;
  signInBtn.classList.remove("button-loading");
  signInBtn.innerText = "VERIFY";
}

function validateInputEmail() {
  const inputElement = document.getElementById("secondaryContactInputEmail");
  const errorDiv = document.getElementById("inputErrorSecondary");
  const errorDivText = document.querySelector('#inputErrorSecondary .errorText')
  const input = inputElement.value.trim();
  const continueBtn = document.getElementById("addButton");

  if (input === "") {
    continueBtn.disabled = true;
    errorDiv.style.visibility = 'hidden';
    errorDivText.textContent = "";
    inputElement.style.borderColor = "#D1D5DB";
    return;
  }

  if (validateEmail(input)) {
    continueBtn.disabled = false;
    errorDiv.style.visibility = 'hidden';
    errorDivText.textContent = "";
    inputElement.style.opacity = 1;
    inputElement.style.borderColor = "#D1D5DB";
  } else {
    continueBtn.disabled = true;
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent = "Please enter a valid email address";
    // errorDivText.style.color = "#B91C1C";
    inputElement.style.borderColor = "#B91C1C";
  }

  if(input.length == 255){
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent = "You’ve reached the 255-character limit";
    inputElement.style.borderColor = "#D1D5DB";
  }
}

function validateInputPhone() {
  const inputElement = document.getElementById("secondaryContactInputPhone");
  const errorDiv = document.getElementById("inputErrorSecondary");
  const errorDivText = document.querySelector('#inputErrorSecondary .errorText')
  const continueBtn = document.getElementById("addButton");

  let input = inputElement.value.replace(/[^\d]/g, "").slice(0, 10);
  let formatted = input;
  if (input.length > 6) {
    formatted = `${input.slice(0, 3)}-${input.slice(3, 6)}-${input.slice(6)}`;
  } else if (input.length > 3) {
    formatted = `${input.slice(0, 3)}-${input.slice(3)}`;
  }

  inputElement.value = formatted;

  if (input === "") {
    continueBtn.disabled = true;
    errorDiv.style.visibility = 'hidden';
    errorDivText.textContent = "";
    inputElement.style.borderColor = "#D1D5DB";
    return;
  }

  if (validatePhone(input)) {
    continueBtn.disabled = false;
    errorDiv.style.visibility = 'hidden';
    errorDivText.textContent = "";
    inputElement.style.opacity = 1;
    inputElement.style.borderColor = "#D1D5DB";
  } else {
    continueBtn.disabled = true;
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent = "Please enter a valid cell phone number";
    // errorDiv.style.color = "#B91C1C";
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
  } else {
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    const otpError = document.getElementById("otpSecondaryLoginErrorMessage");
    if (otpError) otpError.remove();
    secondaryLoginOTPButton.disabled = true;
  }
}

function checkshowAddSecondaryContactForm(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showAddSecondaryContactForm();
  }
}

function setupSecondaryOtpListeners() {
  const otpInputs = document.querySelectorAll(".secondaryotpInputBox");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      if (value.length === 6) {
        for (let i = 0; i < 6; i++) {
          if (otpInputs[i]) {
            otpInputs[i].value = value[i];
          }
        }
        otpInputs[5].focus();
      }
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
      // paste for safari ----------------------------------------
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        setTimeout(async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (text && /^\d{6}$/.test(text)) {
              for (let i = 0; i < otpInputs.length; i++) {
                otpInputs[i].value = text[i] || "";
              }
              otpInputs[5].focus();
              checkOtpAndToggleButton();
            }
          } catch (err) {
            console.warn("Clipboard read failed", err);
          }
        }, 0);
      }
      // ---------------------------------------
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const btn = document.getElementById("secondaryOTPButton");
        if (!btn.disabled) {
          btn.click();
        }
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
  const errorDivText = document.querySelector('#inputErrorSecondary .errorText')
  const input_value = email_input.value.trim() || phone_input.value.trim();
  const isEmail = email_input.value.trim() !== "" ? true : false;

  const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");
  console.log("JWT Token:", jwtToken);

  // Start sending
  addButton.disabled = true;
  addButton.classList.add("button-loading");
  addButton.innerText = "SENDING...";
  error.style.visibility = 'hidden';
  errorDivText.innerText = "";
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
      error.style.visibility = 'visible';
      errorDivText.innerText = text || "Something went wrong. Please try again.";
      addButton.disabled = false;
      addButton.classList.remove("button-loading");
      addButton.innerText = isEmail ? "add email address" : "add cell phone number";
    } else {
      addButton.disabled = false;
      addButton.classList.remove("button-loading");
      addButton.innerText = isEmail ? "add email address" : "add cell phone number";
      error.style.visibility = 'hidden';
      errorDivText.innerText = "";
      document.getElementById("secondaryContactForm").style.display = "none";
      document.getElementById("secondaryotpSection").style.display = "flex";
      timeoutDidnotReceiveMessage = setTimeout(showSCDidnotReceiveMessage, 10000);
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
    error.style.visibility = 'visible';
    errorDivText.innerText = "Something went wrong. Please try again.";
    addButton.disabled = false;
    addButton.classList.remove("button-loading");
    addButton.innerText = isEmail ? "add email address" : "add cell phone number";
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

  document.getElementById("loginCodeMessage").style.display="none";
  clearTimeout(timeoutDidnotReceiveMessage);
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
    el.style.pointerEvents = 'auto';
  });
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
        otpSucess.style.visibility = "visible";
        otpSucess.innerText = "Verification code sent successfully!";
        otpSucess.classList.add("blink");
        document.getElementById("otpResendSection").appendChild(otpSucess);

        setTimeout(() => {
          if (otpSucess) otpSucess.remove();
        }, 3000);
      }
      signInButton.disabled = true;
      oldErr.style.visibility = "visible";
      oldErr.style.color = "Green";
      oldErr.innerText = "Verification code sent successfully!";
      oldErr.classList.add("blink");

      setTimeout(() => {
        oldErr.innerText = "";
        oldErr.classList.remove("blink");
      }, 3000);
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
  document.getElementById("loginCodeMessage").style.display="none";


  // Secondary contact
  const email_secondary_Input = document.getElementById("secondaryContactInputEmail");
  const phone_secondary_Input = document.getElementById("secondaryContactInputPhone");
  const addButton = document.getElementById("addButton");
  document.querySelector(".Phone_Email").textContent = "";
  document.getElementById("inputErrorSecondary").style.visibility = "hidden";

  // Secondary OTP section
  document.getElementById("secondaryValueDisplay").textContent = "";
  const secondaryotpInputs = document.querySelectorAll(".secondaryotpInputBox");
  const secondaryOTPButton = document.getElementById("secondaryOTPButton");
  document.getElementById("secondaryContactCodeMessage").style.display="none";

  //Signup section
  document.getElementById("firstNameInput").value = "";
  document.getElementById("lastNameInput").value = "";
  document.getElementById("inputErrorFirstName").style.visibility = "hidden";
  document.getElementById("inputErrorLastName").style.visibility = "hidden";
  document.getElementById("inputErrorEmail").style.visibility = "hidden";
  const signupBtn = document.getElementById("signUpButton");
  const signupInput = document.getElementById("emailInput");
  document.querySelector("label[for='signupemail']").innerHTML =
    "Email Address*";

  //signup OTP section
  const signupotpInputs = document.querySelectorAll(".signupotpInputBox");
  const signupOTPButton = document.getElementById("signupOTPButton");
  document.getElementById("signupCodeMessage").style.display="none";

  // username/password section
  document.getElementById("usernameInput").value = "";
  document.getElementById("passwordInput").value = "";
  usernameInput.style.borderColor = "";
  passwordInput.style.borderColor = "";
  usernameErrorDiv.style.visibility = "hidden";
  usernameSignInBtn.disabled = true;
  usernameSignInBtn.innerText = "SIGN IN";
  usernameSignInBtn.classList.remove("button-loading");

  // Existing user - password section
  document.getElementById("exPasswordInput").value = "";
  exPasswordInput.style.borderColor = "";
  exPasswordErrorDiv.style.visibility = "hidden";
  exPasswordSignInBtn.disabled = true;
  exPasswordSignInBtn.innerText = "SIGN IN";
  exPasswordSignInBtn.classList.remove("button-loading");

  document.querySelectorAll(".password-container").forEach((container) => {
    const input = container.querySelector("input");
    const eyeIcon = container.querySelector(".eyeIcon");

    if (input) input.type = "password"; // Re-mask
    if (eyeIcon) eyeIcon.innerHTML = eyeSVG; // Reset icon to default
  });

  // Set password section
  setPasswordInput.value = "";
  setPasswordConfirmInput.value = "";
  setPasswordInput.style.borderColor = "";
  setPasswordConfirmInput.style.borderColor = "";
  setPasswordErrorDiv.style.visibility = "hidden";
  setPasswordBtn.disabled = true;
  setPasswordBtn.innerText = "SET PASSWORD";
  setPasswordBtn.classList.remove("button-loading");

  // Sign Up password section
  signUpPasswordInput.value = "";
  signUpPasswordConfirmInput.value = "";
  signUpPasswordInput.style.borderColor = "";
  signUpPasswordConfirmInput.style.borderColor = "";
  signUpPasswordErrorDiv.style.visibility = "hidden";
  signUpPasswordBtn.disabled = true;
  signUpPasswordBtn.innerText = "SIGN IN";
  signUpPasswordBtn.classList.remove("button-loading");

  // Reset Password - First Page
  const RPinput = document.getElementById("resetPasswordInput");
  const RPerror = document.getElementById("inputRPError");
  const RPcontinueBtn = document.getElementById("resetPasswordContinueButton");

  // Reset Password OTP
  const RPotpInputs = document.querySelectorAll(".resetotpInputBox");
  const RPoldErr = document.getElementById("otpResetPasswordErrorMessage");
  document.getElementById("resetPasswordValueDisplay").textContent = "";
  document.getElementById("resetPasswordMessage").style.display = "none";
  userNameForgotPass = false;
  clearTimeout(timeoutDidnotReceiveMessage);
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
    el.style.pointerEvents = 'auto';
  });

  if (input) {
    input.value = "";
    input.style.borderColor = "";
  }

  if (error) {
    error.style.visibility = "hidden";
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

  if(email_secondary_Input){
    email_secondary_Input.value = "";
    email_secondary_Input.style.display = "none";
    email_secondary_Input.style.border = "2px solid #d1d5db";
  }

  if(phone_secondary_Input){
    phone_secondary_Input.value = "";
    phone_secondary_Input.style.display = "none";
    phone_secondary_Input.style.border = "2px solid #d1d5db";
  }

  if (signupBtn) {
    signupBtn.disabled = true;
    signupBtn.classList.remove("button-loading");
  }

  if (signupotpInputs) {
    signupotpInputs.forEach((input) => {
      input.value = "";
      input.style.border = "2px solid white";
    });
  }

  if (signupOTPButton) {
    signupOTPButton.disabled = true;
    signupOTPButton.classList.remove("button-loading");
  }

  if (signupInput) {
    signupInput.type = "email";
    signupInput.classList.remove("no-spinner");
    signupInput.removeAttribute("pattern");
    signupInput.removeAttribute("inputmode");
    signupInput.style.borderColor = "#D1D5DB";
    signupInput.value = "";
  }

  if (RPinput) {
    RPinput.value = "";
    RPinput.style.borderColor = "";
  }

  if (RPerror) {
    RPerror.style.visibility = "hidden";
  }

  if (RPcontinueBtn) {
    RPcontinueBtn.innerText = "CONTINUE";
    RPcontinueBtn.disabled = true;
    RPcontinueBtn.classList.remove("button-loading");
  }

  if (RPotpInputs) {
    RPotpInputs.forEach((input) => {
      input.value = "";
      input.style.border = "2px solid white";
    });
  }

  if (RPoldErr) RPoldErr.remove();

  setTimeout(() => {
    // Reset form sections
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("otpSection").style.display = "none";
    document.getElementById("signupSection").style.display = "none";
    document.getElementById("signupotpSection").style.display = "none";
    document.getElementById("secondaryContactForm").style.display = "none";
    document.getElementById("secondaryotpSection").style.display = "none";
    document.getElementById("usernameForm").style.display = "none";
    document.getElementById("exPasswordForm").style.display = "none";
    document.getElementById("reLoginSuccessSection").style.display = "none";
    document.getElementById("setPasswordForm").style.display = "none";
    document.getElementById("signUpPasswordForm").style.display = "none";
    document.getElementById("resetPasswordForm").style.display = "none";
    document.getElementById("resetPasswordOtpSection").style.display = "none";
  }, 900); // 1000 milliseconds = 1 second

  const AccessToken = localStorage.getItem("mpp-widgets_AuthToken");
  const valid = isAccessTokenValid(AccessToken, "https://mybeta.calvaryftl.org/ministryplatformapi/oauth", "https://mybeta.calvaryftl.org/ministryplatformapi/oauth/resources");
  const reloadUrlPath = ["/events/", "/custom-form-2/", "/opportunity/"]
  if(reloadUrlPath.includes(window.location.pathname) && valid){
    window.location.reload();
    return;
  }
}

// Close button click listener
document.addEventListener("click", function (e) {
  const isCloseButton = e.target.closest(".mfp-close");

  if (isCloseButton) {
    console.log("✅ DIVI modal close button clicked");
    resetLoginModalState();
  }
});

function preventTouchMove(e) {
  e.preventDefault();
}

function lockScroll() {
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.position = "fixed";
  document.addEventListener("touchmove", preventTouchMove, { passive: false });
}

function unlockScroll() {
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
  document.documentElement.style.overflow = "";
  document.documentElement.style.position = "";
  document.removeEventListener("touchmove", preventTouchMove);
}

function showSuccessModal(boolCheck = false) {
  const style = document.createElement("style");
  style.id = "remove-zindex-style";
  style.innerHTML = `
          .et_pb_row:not(.custom-menu-row),
          .et_pb_column:(.custom-menu-column, .custom-header-logo-column, .desktop_button_column) {
            z-index: auto !important;
            position: static !important;
          }
          .tab-row .dsm-active{
            z-index: 999 !important;
          }
        `;
  if (
    globalSuccessText.innerText.trim() === "You're all set!" &&
    (document.getElementById("secondaryotpSection").style.display === "flex" ||
      document.getElementById("secondaryContactForm").style.display === "flex")
  ) {
    resetLoginModalState();
    setTimeout(() => {
      document.head.appendChild(style);
      document.getElementById("successModal").style.display = "flex";
      document.getElementById("successTitle").style.display = "block";
      document.getElementById("successMessage").innerText =
        "We have added your details.";
      lockScroll();
    }, 500);
    return true;
  } else if (
    globalSuccessText.innerText.trim() === "You've logged in!" &&
    boolCheck == true
  ) {
    resetLoginModalState();
    document.head.appendChild(style);
    document.getElementById("successModal").style.display = "flex";
    lockScroll();
  }
  return false;
}

// ESC key listener
document.addEventListener("keydown", function (e) {
  if (
    e.key === "Escape" &&
    document.getElementById("successModal").style.display != "flex"
  ) {
    console.log("✅ ESC key pressed");
    unlockScroll();
    if (!showSuccessModal()) {
      resetLoginModalState();
    }
  }
});

// DIVI modal closed via overlay or close button
jQuery(document).ready(function ($) {
  $(document).on("mfpClose", function () {
    console.log("✅ Modal closed (by close button or outside click)");
    // Enable scrolling
    unlockScroll();
    if (!showSuccessModal()) {
      resetLoginModalState();
    }
  });

  $(document).on("mfpOpen", function () {
    const successModal = document.getElementById("successModal");
    const mfpBg = document.querySelector(".mfp-bg");
    // Disable scrolling
    const width = window.screen.width;
    if(width < 768 || width > 1024){
      lockScroll();
    }
    else{
      document.body.style.position = "fixed";
    }

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
  const signUpButton = document.getElementById("signUpButton");
  const firstName = document.getElementById("firstNameInput");
  const firstNameError = document.getElementById("inputErrorFirstName");
  const firstNameErrorText = document.querySelector('#inputErrorFirstName .errorText')
  let input = firstName.value.replace(/[^a-zA-Z.,'’‘\- ]/g, "").slice(0, 25);
  firstName.value = input;

  if (input === ""){
    firstNameError.style.visibility = 'hidden';
    firstNameErrorText.textContent = "";
  }
  else if (input.length == 25)
  {
    firstNameError.style.visibility = 'visible';
    firstNameErrorText.textContent = "You’ve reached the 25-character limit";
  }
  else {
    firstNameError.style.visibility = 'hidden';
    firstNameErrorText.textContent = "";
  }
  const allValid = checkSignupInputs();
  signUpButton.disabled = !allValid;
  signUpButton.style.cursor = allValid ? "pointer" : "not-allowed";
}

function validateLastName() {
  const signUpButton = document.getElementById("signUpButton");
  const lastName = document.getElementById("lastNameInput");
  const lastNameError = document.getElementById("inputErrorLastName");
  const lastNameErrorText = document.querySelector('#inputErrorLastName .errorText')
  let input = lastName.value.replace(/[^a-zA-Z.,'’‘\- ]/g, "").slice(0, 25);
  lastName.value = input;

  if (input === ""){
    lastNameError.style.visibility = 'hidden';
    lastNameErrorText.textContent = "";
  }
  else if (input.length == 25){
    lastNameError.style.visibility = 'visible';
    lastNameErrorText.textContent = "You’ve reached the 25-character limit";
  }
  else{
    lastNameError.style.visibility = 'hidden';
    lastNameErrorText.textContent = "";
  }
  const allValid = checkSignupInputs();
  signUpButton.disabled = !allValid;
  signUpButton.style.cursor = allValid ? "pointer" : "not-allowed";
}

function validateSignupInput() {
  const inputElement = document.getElementById("emailInput");
  const errorDiv = document.getElementById("inputErrorEmail");
  const errorDivText = document.querySelector('#inputErrorEmail .errorText')
  const isEmail = inputElement.type == "email";

  const input = isEmail
    ? inputElement.value.trim()
    : inputElement.value.replace(/[^\d]/g, "").slice(0, 10);
  const signUpButton = document.getElementById("signUpButton");

  if (!isEmail) {
    let formatted = input;
    if (input.length > 6)
      formatted = `${input.slice(0, 3)}-${input.slice(3, 6)}-${input.slice(6)}`;
    else if (input.length > 3)
      formatted = `${input.slice(0, 3)}-${input.slice(3)}`;

    inputElement.value = formatted;
  }
  if (input === "") {
    errorDiv.style.visibility = 'hidden';
    errorDivText.textContent = isEmail
      ? "Email is required."
      : "Cell Phone number is required.";
    // errorDivText.style.color = "#B91C1C";
    inputElement.style.borderColor = "#B91C1C";
    signUpButton.disabled = true;
    signUpButton.style.cursor = "not-allowed";
    return false;
  }

  const isEmailValid = validateEmail(input);
  const isPhoneValid = validatePhone(input);
  const isEmailOrPhoneValid = isEmail ? isEmailValid : isPhoneValid;

  if (isEmailOrPhoneValid) {
    errorDiv.style.visibility = 'hidden';
    errorDivText.textContent = "";
    inputElement.style.borderColor = "#D1D5DB";
  } else {
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent = isEmail
      ? "Please enter a valid email address."
      : "Please enter a valid cell phone number.";
    // errorDivText.style.color = "#B91C1C";
    inputElement.style.borderColor = "#B91C1C";
  }

  if(input.length == 255){
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent = "You’ve reached the 255-character limit";
    inputElement.style.borderColor = "#D1D5DB";
  }

  const allValid = checkSignupInputs();
  signUpButton.disabled = !allValid;
  signUpButton.style.cursor = allValid ? "pointer" : "not-allowed";
}

function checkSignupInputs() {
  const firstName = document.getElementById("firstNameInput");
  const lastName = document.getElementById("lastNameInput");
  const emailInput = document.getElementById("emailInput");
  const isEmail = emailInput.type == "email";

  const email_phone = emailInput.value.trim();
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();

  const firstNameValid = firstNameValue.length > 0;
  const lastNameValid = lastNameValue.length > 0;

  const isEmailValid = validateEmail(email_phone);
  const isPhoneValid = validatePhone(email_phone);
  const isEmailOrPhoneValid = isEmail ? isEmailValid : isPhoneValid;

  return firstNameValid && lastNameValid && isEmailOrPhoneValid;
}

async function submitSignup(event) {
  event.preventDefault();
  const firstName = document.getElementById("firstNameInput");
  const lastName = document.getElementById("lastNameInput");
  const emailInput = document.getElementById("emailInput");
  const errorDiv = document.getElementById("inputErrorEmail");
  const errorDivText = document.querySelector('#inputErrorEmail .errorText')
  const signUpButton = document.getElementById("signUpButton");
  const errorFirstName = document.getElementById("inputErrorFirstName");
  const firstNameErrorText = document.querySelector('#inputErrorFirstName .errorText');
  const errorlastName = document.getElementById("inputErrorLastName");
  const lastNameErrorText = document.querySelector('#inputErrorLastName .errorText');

  const email_phone = emailInput.value.trim();
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();

  if (!checkSignupInputs()) return;

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
  errorDiv.style.visibility = 'hidden';
  errorDivText.innerText = "";

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
        errorFirstName.style.visibility = 'visible';
        firstNameErrorText.innerText = "First name is required.";
        // errorFirstName.style.color = "#B91C1C";
        document.getElementById("firstNameInput").style.borderColor = "#B91C1C";
      }
      if (lastName.value.trim().length === 0) {
        errorlastName.style.visibility = 'visible';
        lastNameErrorText.innerText = "Last name is required.";
        // errorlastName.style.color = "#B91C1C";
        lastName.style.borderColor = "#B91C1C";
      }
      if (emailInput.value.trim().length === 0) {
        errorDiv.style.visibility = 'visible';
        errorDivText.innerText = "Email or cell phone number is required.";
        // errorDivText.style.color = "#B91C1C";
        emailInput.style.borderColor = "#B91C1C";
      }
      emailInput.style.borderColor = "#B91C1C";
      errorDiv.style.visibility = 'visible';
      errorDivText.innerText = text || "Login failed.";
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
      timeoutDidnotReceiveMessage = setTimeout(showSUDidnotReceiveMessage,10000);
      document.getElementById("signupUserValueDisplay").innerText = email_phone;
      errorFirstName.style.visibility = 'hidden';
      firstNameErrorText.innerText = "";
      errorlastName.style.visibility = 'hidden';
      lastNameErrorText.innerText = "";
      errorDiv.style.visibility = 'hidden';
      errorDivText.innerText = "";

      console.log("API Response:", response);
      console.log("API Response:text", text);
      console.log("API Response:firstName length", firstNameValue);
      console.log("API Response:lastName length", lastNameValue);
      console.log("API Response:emailInput length", email_phone);

      // Focus OTP box
      const otpBox = document.querySelector(".signupotpInputBox");
      if (otpBox) otpBox.focus();

      // Optional: Attach OTP listeners once
      if (typeof setupSignUpOtpListeners === "function") {
        setupSignUpOtpListeners();
      }
    }
  } catch (error) {
    console.error("Error submitting signup:", error);
    emailInput.style.borderColor = "#B91C1C";
    errorDiv.style.visibility = 'visible';
    errorDivText.innerText = "Something went wrong. Please try again.";
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

  document.getElementById("signupCodeMessage").style.display="none";
  clearTimeout(timeoutDidnotReceiveMessage);
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
    el.style.pointerEvents = 'auto';
  });
}

function checkSignupOtpAndToggleButton() {
  const otpInputs = document.querySelectorAll(".signupotpInputBox");
  const signUpOTPButton = document.getElementById("signupOTPButton");

  const enteredDigits = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  if (enteredDigits.length === 6 && /^\d{6}$/.test(enteredDigits)) {
    signUpOTPButton.disabled = false;
  } else {
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    const otpError = document.getElementById("otpSignupErrorMessage");
    if (otpError) otpError.remove();
    signUpOTPButton.disabled = true;
  }
}

function checkshowSignupForm(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showSignupForm();
  }
}

function setupSignUpOtpListeners() {
  const otpInputs = document.querySelectorAll(".signupotpInputBox");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      if (value.length === 6) {
        for (let i = 0; i < 6; i++) {
          if (otpInputs[i]) {
            otpInputs[i].value = value[i];
          }
        }
        otpInputs[5].focus();
      }
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
      // paste for safari ----------------------------------------
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        setTimeout(async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (text && /^\d{6}$/.test(text)) {
              for (let i = 0; i < otpInputs.length; i++) {
                otpInputs[i].value = text[i] || "";
              }
              otpInputs[5].focus();
              checkOtpAndToggleButton();
            }
          } catch (err) {
            console.warn("Clipboard read failed", err);
          }
        }, 0);
      }
      // ---------------------------------------
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const btn = document.getElementById("signupOTPButton");
        if (!btn.disabled) {
          btn.click();
        }
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

  const email_phone = emailInput.value.trim();
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();

  if (!checkSignupInputs()) return;

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
        otpSucess.style.visibility = "visible";
        otpSucess.innerText = "Verification code sent successfully!";
        otpSucess.classList.add("blink");
        document
          .getElementById("signupotpResendSection")
          .appendChild(otpSucess);

        setTimeout(() => {
          if (otpSucess) otpSucess.remove();
        }, 3000);
      }
      signUpOtpBtn.disabled = true;
      oldErr.style.visibility = "visible";
      oldErr.style.color = "Green";
      oldErr.innerText = "Verification code sent successfully!";
      oldErr.classList.add("blink");

      setTimeout(() => {
        oldErr.innerText = "";
        oldErr.classList.remove("blink");
      }, 3000);
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
      "https://mobileserverdev.calvaryftl.org/v1.2/api/SignUpCode/Confirm",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      signUpPayload.First_Name = firstNameValue;
      signUpPayload.Last_Name = lastNameValue;
      signUpPayload.code.Phone_Email = email_phone;
      document.getElementById("signUpPasswordForm").style.display = "flex";
      document.getElementById("signupotpSection").style.display = "none";
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
      err.style.visibility = 'visible';
      const exclamationSpan = document.createElement('span');
      exclamationSpan.classList.add('helperText');
      exclamationSpan.textContent = '!';
      const errorTextSpan = document.createElement('span');
      errorTextSpan.classList.add('errorText');
      errorTextSpan.innerText = "Invalid or expired code. Please try again.";
      document.getElementById("signupotpResendSection").appendChild(err);
      document.getElementById("otpSignupErrorMessage").appendChild(exclamationSpan);
      document.getElementById("otpSignupErrorMessage").appendChild(errorTextSpan);
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
  const secondaryValueDisplay = document.getElementById("secondaryValueDisplay").textContent.trim();
  const isEmail = secondaryValueDisplay.includes('@');
  const singupBtn = document.getElementById("addButton");
  singupBtn.classList.remove("button-loading");
  singupBtn.disabled = false;
  singupBtn.innerText = isEmail ? "ADD EMAIL ADDRESS" : "ADD CELL PHONE NUMBER";
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

  document.getElementById("secondaryContactCodeMessage").style.display="none";
  clearTimeout(timeoutDidnotReceiveMessage);
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
    el.style.pointerEvents = 'auto';
  });
}

async function secodaryLoginverifyOtp() {
  const secondaryLoginOtpBtn = document.getElementById("secondaryOTPButton");
  const secondaryLoginotpInputs = document.querySelectorAll(
    ".secondaryotpInputBox"
  );

  const email_input = document.getElementById("secondaryContactInputEmail");
  const phone_input = document.getElementById("secondaryContactInputPhone");

  const email_phone = email_input.value.trim() || phone_input.value.trim();
  const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");
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
      // closeModal();
      $.magnificPopup.close();
      resetLoginModalState();
      showSuccessModal(true);
      lockScroll();
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
      secondaryotperr.style.visibility = 'visible';
      const exclamationSpan = document.createElement('span');
      exclamationSpan.classList.add('helperText');
      exclamationSpan.textContent = '!';
      const errorTextSpan = document.createElement('span');
      errorTextSpan.classList.add('errorText');
      errorTextSpan.innerText = "Invalid or expired code. Please try again.";
      document.getElementById("secondaryLoginotpResendSection").appendChild(secondaryotperr);
      document.getElementById("otpSecondaryLoginErrorMessage").appendChild(exclamationSpan);
      document.getElementById("otpSecondaryLoginErrorMessage").appendChild(errorTextSpan);
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
    secondaryotperr.style.visibility = 'visible';
    const exclamationSpan = document.createElement('span');
    exclamationSpan.classList.add('helperText');
    exclamationSpan.textContent = '!';
    const errorTextSpan = document.createElement('span');
    errorTextSpan.classList.add('errorText');
    errorTextSpan.innerText = "Something went wrong. Please try again.";
    document.getElementById("secondaryLoginotpResendSection").appendChild(secondaryotperr);
    document.getElementById("otpSecondaryLoginErrorMessage").appendChild(exclamationSpan);
    document.getElementById("otpSecondaryLoginErrorMessage").appendChild(errorTextSpan);
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
  const jwtToken = localStorage.getItem("mpp-widgets_JwtToken");
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
        otpSucess.style.visibility = "visible";
        otpSucess.innerText = "Verification code sent successfully!";
        otpSucess.classList.add("blink");
        document
          .getElementById("secondaryLoginotpResendSection")
          .appendChild(otpSucess);

        setTimeout(() => {
          if (otpSucess) otpSucess.remove();
        }, 3000);
      }

      signUpOtpBtn.disabled = true;
      oldErr.style.visibility = "visible";
      oldErr.style.color = "Green";
      oldErr.innerText = "Verification code sent successfully!";
      oldErr.classList.add("blink");

      setTimeout(() => {
        oldErr.innerText = "";
        oldErr.classList.remove("blink");
      }, 3000);
    }
  } catch (err) {
    console.log("err", err);
    resetCodeLink.classList.remove("link-loading");
    resetCodeLink.textContent = "Resend Code";
    isSecondaryLoginResending = false;
  }
}

function closeModal() {
  if (globalSuccessText.innerText.trim() === "You're all set!") {
    setTimeout(() => {
      document.getElementById("successModal").style.display = "flex";
      document.getElementById("successTitle").style.display = "block";
      document.getElementById("successMessage").innerText =
        "We have added your details.";
    }, 500);
  }
  $.magnificPopup.close();
}

function hideMobileLoginBtn() {
  document.querySelectorAll("#menu-item-42971").forEach((el) => {
    el.style.setProperty("display", "none", "important");
  });
  document.querySelectorAll("#menu-item-43017").forEach((el) => {
    el.style.setProperty("display", "block", "important");
    el.style.setProperty("padding-top", "10px");
    el.style.setProperty("border-top", "2px solid white");
  });
  document.querySelectorAll("#menu-item-43016").forEach((el) => {
    el.style.setProperty("display", "block", "important");
  });
  document.querySelectorAll("#menu-item-42887").forEach((el) => {
    el.style.setProperty("padding-bottom", "10px");
  });
  document.querySelectorAll("#menu-item-43730").forEach((el) => {
    el.style.setProperty("display", "block", "important");
  });
}
function showMobileLoginBtn() {
  document.querySelectorAll("#menu-item-42971").forEach((el) => {
    el.style.setProperty("display", "block", "important");
  });
  document.querySelectorAll("#menu-item-43017").forEach((el) => {
    el.style.setProperty("display", "none", "important");
  });
  document.querySelectorAll("#menu-item-43016").forEach((el) => {
    el.style.setProperty("display", "none", "important");
  });
  document.querySelectorAll("#menu-item-43730").forEach((el) => {
    el.style.setProperty("display", "none", "important");
  });
}

// function replaceMobileMenuIconWithUser(initials) {
//   function applyReplacement() {
//     const hamburger = document.querySelector(
//       ".et_mobile_nav_menu .mobile_menu_bar"
//     );
//     if (hamburger && !hamburger.dataset.replaced) {
//       const userInfo = document.createElement("div");
//       userInfo.id = "user-info";
//       userInfo.innerHTML = `<div id="user-avatar">${initials || ""}</div>`;

//       // Keep Divi's toggle
//       userInfo.addEventListener("click", function (e) {
//         e.preventDefault();
//         hamburger.click();
//       });

//       hamburger.replaceWith(userInfo);
//       userInfo.dataset.replaced = "true"; // Mark so we don't double replace
//     }
//   }

//   // Run once on load
//   applyReplacement();

//   // Watch for DOM changes (Divi can rebuild menu)
//   const observer = new MutationObserver(applyReplacement);
//   observer.observe(document.body, {
//     childList: true,
//     subtree: true,
//   });
// }

function userifyDiviMobileHamburger(initials) {
  // Target ALL mobile menu bars in case there are multiple instances
  const bars = document.querySelectorAll(
    ".et_mobile_nav_menu .mobile_menu_bar"
  );
  if (!bars.length) return;

  bars.forEach((bar) => {
    // Avoid double-application
    if (bar.dataset.userified === "1") {
      const existingAvatar = bar.parentElement?.querySelector(
        "#user-info #user-avatar-mbl"
      );
      if (existingAvatar) existingAvatar.textContent = initials || "";
      return;
    }

    // Create a wrapper *around* the existing span (do NOT remove/replace the span)
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    // Preserve layout (block vs inline) based on current computed style of the span
    wrapper.style.display =
      getComputedStyle(bar).display === "block" ? "block" : "inline-block";

    // Insert wrapper before the span, then move the span inside the wrapper
    bar.parentNode.insertBefore(wrapper, bar);
    wrapper.appendChild(bar);

    // Keep the span clickable but hide its visual hamburger lines
    bar.style.opacity = "0";
    bar.style.pointerEvents = "auto"; // ensure clicks still register on the span
    bar.style.zIndex = "1";

    // Overlay your avatar on top of the span
    const overlay = document.createElement("div");
    overlay.id = "user-info";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.pointerEvents = "none"; // clicks fall through to the span

    const avatar = document.createElement("div");
    avatar.id = "user-avatar-mbl";
    if(initials.includes("calvaryftl")){
      const img = document.createElement("img");
        img.src = initials;
        // img.alt = "Profile Image";
        img.style.borderRadius = "50%";
        img.style.height = "100%";
        img.style.width = "100%";
        avatar.appendChild(img);
    }
    else{
      avatar.textContent = initials || "";
    }

    const dropdownIcon = document.createElement("span");
    dropdownIcon.id = "dropdown-icon";
    dropdownIcon.textContent = "▼";

    overlay.appendChild(avatar);
    overlay.appendChild(dropdownIcon);
    wrapper.appendChild(overlay);

    // Mark as done
    bar.dataset.userified = "1";
  });
}


function cleanupUserifyDiviMobileHamburger() {
  // Find all userified mobile menu bars
  const bars = document.querySelectorAll(".et_mobile_nav_menu .mobile_menu_bar[data-userified='1']");
  bars.forEach(bar => {
    const wrapper = bar.parentElement;
    if (!wrapper) return;

    // If the wrapper contains the bar and overlay, remove overlay and unwrap the bar
    const overlay = wrapper.querySelector("#user-info");
    if (overlay) {
      overlay.remove();
    }

    // Reset bar styles
    bar.style.opacity = "";
    bar.style.pointerEvents = "";
    bar.style.zIndex = "";

    // Remove the data attribute to mark as not userified
    bar.removeAttribute("data-userified");

    // Unwrap the bar: move bar out of wrapper, then remove wrapper
    if (wrapper.parentNode) {
      wrapper.parentNode.insertBefore(bar, wrapper);
      wrapper.remove();
    }
  });
}

async function updateUserHeaderUI() {
  const token = localStorage.getItem("mpp-widgets_JwtToken");
  const AccessToken = localStorage.getItem("mpp-widgets_AuthToken");
  const valid = isAccessTokenValid(AccessToken, "https://mybeta.calvaryftl.org/ministryplatformapi/oauth", "https://mybeta.calvaryftl.org/ministryplatformapi/oauth/resources");
  if (valid) {
  const loginButton = document.getElementById("loginButton");
  const userInfo = document.getElementById("user-info");
  const userAvatar = document.getElementById("user-avatar");
  if (token) {
    loginButton.style.visibility = "hidden";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("Decoded JWT payload:", payload);

      const response = await fetch(
        "https://mobileserverdev.calvaryftl.org/api/My/Contact",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const text = await response.json();
      
      if(text.Web_Image_URL != null){
        userInfo.style.display = "flex";
        userAvatar.innerHTML="";
        const img = document.createElement("img");
        img.src = text.Web_Image_URL;
        // img.alt = "Profile Image";
        img.style.borderRadius = "50%";
        img.style.height = "100%";
        img.style.width = "100%";
        userAvatar.appendChild(img);
        // update image for mobile view
        userifyDiviMobileHamburger(text.Web_Image_URL);
      }
      else {
        const firstName = payload.FirstName || "";
        const lastName = payload.LastName || "";
        const email = payload.UserName || "";

        const initials =
          firstName && lastName
            ? `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
            : email.charAt(0).toUpperCase();

        if (userInfo) {
          userInfo.style.display = "flex";
          userAvatar.textContent = initials;
        }
        // 🔹 Make the mobile hamburger show the avatar but keep Divi's menu toggle
        userifyDiviMobileHamburger(initials);
      }
      // Update UI
      if (loginButton) loginButton.style.display = "none";
      // Hide mobile login
      hideMobileLoginBtn();

    } catch (error) {
      console.error("Invalid JWT token", error);
    }
    loginButton.style.visibility = "visible";
  }
  }
  else {
    // Remove token from local storage
    localStorage.removeItem("mpp-widgets_AuthToken");
    localStorage.removeItem("mpp-widgets_JwtToken");
    localStorage.removeItem("mpp-widgets_ExpiresAfter");
    const path = window.location.pathname;
    const redirectUrlPath = ["/my-account/", "/my-contributions/", "/my-giving/", "/baptism-certificate/", "/my-grouplife/", "/my-household/", "/volunteer-requirements/", "/forms-docs", "/edit-profile/"]
    if(redirectUrlPath.includes(path)){
      const token = localStorage.getItem("mpp-widgets_AuthToken"); 
      if (!token) {
        window.location.href = "/";
      }
    }
  }
  const path = window.location.pathname;
  const redirectUrlPath = ["/my-account/", "/my-contributions/", "/my-giving/", "/baptism-certificate/", "/my-grouplife/", "/my-household/", "/volunteer-requirements/", "/forms-docs", "/edit-profile/"]
  if(redirectUrlPath.includes(path)){
    const token = localStorage.getItem("mpp-widgets_AuthToken"); 
    if (!token) {
      window.location.href = "/";
    }
  }
  const flag = localStorage.getItem("showLogoutModal");
  if (flag == "true") {
    localStorage.removeItem("showLogoutModal");
    showLogoutModal();
  }

}

document.addEventListener("DOMContentLoaded", updateUserHeaderUI);

function showLogoutModal() {
  const style = document.createElement("style");
  style.id = "remove-zindex-style";
  style.innerHTML = `
        .et_pb_row:not(.custom-menu-row),
        .et_pb_column:(.custom-menu-column, .custom-header-logo-column, .desktop_button_column) {
          z-index: auto !important;
          position: static !important;
        }
        .tab-row .dsm-active{
          z-index: 999 !important;
        }
        .et_pb_column--with-menu,
        .et_pb_row.et_pb_row_3_tb_header.et_pb_equal_columns.et_pb_gutters1.et_pb_row--with-menu {
          z-index: 1 !important;
        }
      `;
  document.head.appendChild(style);
  document.getElementById("logoutModal").style.display = "flex";
}

function closeLogoutModal() {
  document.getElementById("logoutModal").style.display = "none";
  const existingStyle = document.getElementById("remove-zindex-style");
  if (existingStyle) {
    existingStyle.remove();
  }
}

function handleLogout() {
  const loginButton = document.getElementById("loginButton");
  const userInfo = document.querySelectorAll("#user-info");
  document.getElementById("otpSection").style.display = "none";
  document.getElementById("secondaryotpSection").style.display = "none";
  const bars = document.querySelectorAll(
    ".et_mobile_nav_menu .mobile_menu_bar"
  );

  // Remove token from local storage
  localStorage.removeItem("mpp-widgets_AuthToken");
  localStorage.removeItem("mpp-widgets_JwtToken");
  localStorage.removeItem("mpp-widgets_ExpiresAfter");

  // Update UI
  if (loginButton) loginButton.style.display = "inline-block";
  userInfo.forEach( el => el.style.display = "none" );
  bars.forEach( ele => ele.removeAttribute("style"));
  showMobileLoginBtn();
  cleanupUserifyDiviMobileHamburger();
  resetLoginModalState();
  jQuery(function($) {
    $('ul#mobile_menu2 li.menu-item-has-children').removeClass('dt-open');
    $('ul#mobile_menu2 li.menu-item-has-children .sub-menu').removeClass('visible');
  });
  const redirectUrlPath = ["/my-account/", "/my-contributions/", "/my-giving/", "/baptism-certificate/", "/my-grouplife/", "/my-household/", "/volunteer-requirements/", "/forms-docs", "/edit-profile/"]
  const reloadUrlPath = ["/events/", "/custom-form-2/", "/opportunity/"]
  if(redirectUrlPath.includes(window.location.pathname)){
    localStorage.setItem('showLogoutModal', "true")
    window.location.replace('/');
    return;
  }
  if(reloadUrlPath.includes(window.location.pathname)){
    localStorage.setItem('showLogoutModal', "true")
    window.location.reload();
    return;
  }

  showLogoutModal();
}

// On mobile menu open, collapse any expanded submenus
jQuery(function($) {
  $('.mobile_menu_bar').on('click', function () {
    // Delay to allow menu animation to start before collapsing
    setTimeout(function () {
      // Collapse any expanded submenus
      $('#mobile_menu2 li.menu-item-has-children').removeClass('dt-open');
      $('#mobile_menu2 li.menu-item-has-children .sub-menu').removeClass('visible');
    }, 100);
  });
});

// Example: Attach to logout button click
document.getElementById("logout-btn")?.addEventListener("click", handleLogout);

// Catch clicks on any current/future Logout menu item
document.addEventListener(
  "click",
  function (e) {
    const logoutClick = e.target.closest(
      "#menu-item-43016, #menu-item-43016 a"
    );
    if (!logoutClick) return;
    e.preventDefault(); // stop "#" navigation
    handleLogout();
  },
  true // capture phase helps if Divi stops propagation
);

function closeSuccessModal() {
  document.getElementById("successModal").style.display = "none";
  unlockScroll();
  const existingStyle = document.getElementById("remove-zindex-style");
  if (existingStyle) {
    existingStyle.remove();
  }
}

document
  .querySelector(".modal-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      closeSuccessModal();
    }
  });

document
  .querySelector("#logoutModal.modal-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      closeLogoutModal();
    }
  });

document.addEventListener("keydown", function (e) {
  const modal = document.getElementById("successModal");
  if (e.key === "Escape" && modal.style.display === "flex") {
    closeSuccessModal();
  }
  const logoutModal = document.getElementById('logoutModal');
  if (e.key === "Escape" && logoutModal.style.display === "flex") {
    closeLogoutModal();
  }
});

function userInfo() {
  const userDropdownmenu = document.getElementById("user-dropdown-menu");
  userDropdownmenu.style.display =
  window.getComputedStyle(userDropdownmenu).display === "none" ? "block" : "none";
}
document.getElementById('user-info')?.addEventListener('click', userInfo);

const megaMenuItem = document.querySelector('.mega-menu');
 
if (megaMenuItem) {
  megaMenuItem.addEventListener('mouseenter', () => {
    megaMenuItem.classList.add('active');
  });
 
  megaMenuItem.addEventListener('mouseleave', () => {
    megaMenuItem.classList.remove('active');
  });
}

// Username/Password section

const eyeSVG = `
  <g clip-path="url(#clip0_5956_15833)">
    <path d="M15.5969 11.9986C15.5969 13.9052 13.9836 15.4509 11.9935 15.4509C10.0034 15.4509 8.39012 13.9052 8.39012 11.9986C8.39012 10.092 10.0034 8.54639 11.9935 8.54639C13.9836 8.54637 15.5969 10.092 15.5969 11.9986ZM12 4.81055C9.9395 4.81969 7.80372 5.32131 5.78192 6.28169C4.28076 7.02413 2.8178 8.07161 1.54788 9.36451C0.92416 10.0245 0.12862 10.9801 0 11.9997C0.0152 12.883 0.9626 13.9731 1.54788 14.635C2.73874 15.8771 4.1636 16.8954 5.78192 17.7186C7.66734 18.6336 9.75424 19.1604 12 19.1897C14.0625 19.1804 16.1978 18.673 18.2173 17.7186C19.7185 16.9761 21.1822 15.9279 22.4521 14.635C23.0758 13.975 23.8714 13.0194 24 11.9997C23.9848 11.1165 23.0374 10.0263 22.4521 9.36447C21.2613 8.12235 19.8356 7.10489 18.2173 6.28165C16.3329 5.36733 14.2408 4.84413 12 4.81055ZM11.9985 6.59551C15.1209 6.59551 17.652 9.01539 17.652 12.0005C17.652 14.9856 15.1209 17.4055 11.9985 17.4055C8.8761 17.4055 6.34498 14.9856 6.34498 12.0005C6.34498 9.01539 8.8761 6.59551 11.9985 6.59551Z" fill="#00B5EF"/>
  </g>
  <defs><clipPath id="clip0_5956_15833"><rect width="24" height="24" fill="white"/></clipPath></defs>
`;

const eyeSlashSVG = `
  <g clip-path="url(#clip0_5622_11644)">
    <path d="M10.7599 5.55845C11.2181 5.51276 11.6835 5.48826 12.1551 5.48514C14.2154 5.51148 16.3471 6.0305 18.3608 7.00772C19.8557 7.76267 21.3092 8.82298 22.5683 10.1264C23.1865 10.7916 23.9745 11.7539 24.0946 12.7745C24.072 13.6576 23.1151 14.7398 22.5243 15.3968C21.3231 16.6289 19.8905 17.6351 18.2653 18.4448C18.2101 18.471 18.1547 18.497 18.0991 18.5225L19.5786 21.157L17.5286 22.3456L6.66092 3.05358L8.63459 1.86986L10.7599 5.55845ZM6.09236 6.82911L7.56916 9.43867C6.87231 10.3285 6.45386 11.4295 6.44386 12.6271C6.41894 15.6122 8.92909 18.0534 12.0514 18.0794C12.1864 18.0806 12.3173 18.0671 12.45 18.0593L13.4273 19.7843C12.9696 19.8295 12.5069 19.8613 12.035 19.8635C9.97271 19.8371 7.84226 19.3123 5.83072 18.341C4.33581 17.586 2.88085 16.5257 1.62175 15.2223C1.00356 14.5571 0.215588 13.5948 0.0954664 12.5741C0.11804 11.6911 1.07497 10.6089 1.66575 9.9519C2.86694 8.71977 4.30107 7.71356 5.92621 6.90386C5.98105 6.87784 6.03717 6.85449 6.09236 6.82911ZM12.1416 7.26929C12.0047 7.26815 11.8688 7.27249 11.7343 7.28053L12.8791 9.30138C14.5065 9.6455 15.7182 11.0427 15.7043 12.703C15.7008 13.1201 15.6207 13.5187 15.4761 13.8877C15.476 13.8881 15.4763 13.8887 15.4761 13.8891L16.6238 15.9159C17.3223 15.0252 17.7391 13.9205 17.7492 12.7215C17.7741 9.73652 15.2639 7.29534 12.1416 7.26929ZM8.72695 11.4816L11.3067 16.0385C9.688 15.6882 8.48515 14.2974 8.49896 12.6429C8.50238 12.2334 8.58735 11.8448 8.72695 11.4816Z" fill="#00B5EF"/>
  </g>
  <defs><clipPath id="clip0_5622_11644"><rect width="24" height="24" fill="white" transform="matrix(-0.999965 -0.00834896 -0.00834896 0.999965 24.1997 0.200375)"/></clipPath></defs>
`;

document.querySelectorAll(".toggle-visibility").forEach((button) => {
  button.addEventListener("click", function () {
    const container = button.closest(".password-container");
    const input = container.querySelector("#passwordInput")|| container.querySelector("#exPasswordInput") || container.querySelector("#setPasswordInput") || container.querySelector("#setPasswordConfirmInput") || container.querySelector("#signUpPasswordInput") || container.querySelector("#signUpPasswordConfirmInput");
    const eyeIcon = button.querySelector(".eyeIcon");
    const value = input.value.trim();
    console.log(value);

    if (value === "") {
      input.type = "password";
      eyeIcon.innerHTML = eyeSVG;
      return;
    }

    if (input.type === "password") {
      input.type = "text";
      eyeIcon.innerHTML = eyeSlashSVG;
    } else {
      input.type = "password";
      eyeIcon.innerHTML = eyeSVG;
    }
  });
});

let clickCount = 0;
const logo = document.getElementById("CalvaryLogo");
const usernameDiv = document.getElementById("usernameForm");

logo.addEventListener("click", () => {
  clickCount++;

  clearTimeout(logo.resetTimeout);
  logo.resetTimeout = setTimeout(() => (clickCount = 0), 2000); // 2 sec reset window

  if (clickCount === 3) {
    document.getElementById("loginForm").style.display = "none";
    usernameDiv.style.display = "flex";
    clickCount = 0; 
  }
});

const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const usernameSignInBtn = document.getElementById("usernameSignInButton");
const usernameErrorDiv = document.getElementById("usernameInputError");
const error1 = document.querySelector("#usernameInputError .errorText");
const error2 = document.querySelector("#exPasswordInputError .errorText");
const exPasswordInput = document.getElementById("exPasswordInput");
const exPasswordSignInBtn = document.getElementById("exPasswordSignInButton"); 
const exPasswordErrorDiv = document.getElementById("exPasswordInputError");
const exPasswordDiv = document.getElementById("exPasswordForm");



function validateUsernamePasswordInput() {  
  if (usernameInput.value.trim() !== "" && passwordInput.value.trim() !== "") {    
    usernameSignInBtn.disabled = false;
  } else {
    usernameSignInBtn.disabled = true;    
  }

  if (error1) {
    error1.innerText = "";
    usernameErrorDiv.style.visibility = "hidden";
  }

  usernameInput.style.borderColor = "";
  passwordInput.style.borderColor = "";

  if (exPasswordInput.value.trim() !== "") {    
    exPasswordSignInBtn.disabled = false;
  } else {
    exPasswordSignInBtn.disabled = true;    
  }

  if (error2) {
    error2.innerText = "";
    exPasswordErrorDiv.style.visibility = "hidden";
  }

  exPasswordInput.style.borderColor = ""; 

}

async function handleUsernameLogin() {
  let usernameValue = usernameInput.value.trim();
  let passwordValue = passwordInput.value.trim();

  // Start sending
  usernameSignInBtn.disabled = true;
  usernameSignInBtn.classList.add("button-loading");
  error1.innerText = "";
  usernameInput.style.borderColor = "";
  passwordInput.style.borderColor = "";
  usernameSignInBtn.innerText = "SIGNING IN...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/v1.2/api/LoginUsername",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserName: usernameValue, Password: passwordValue }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      usernameInput.style.borderColor = "#B91C1C";
      passwordInput.style.borderColor = "#B91C1C";
      usernameErrorDiv.style.visibility = "visible";
      error1.innerText = text ||"Invalid username or password. Try again.";
      usernameSignInBtn.disabled = true;
      usernameSignInBtn.innerText = "SIGN IN";
      usernameSignInBtn.classList.remove("button-loading");
    } 
    else {
      const text = await response.json();

      // Save JWT Token
      const token = JSON.parse(atob(text.AccessToken.split(".")[1]));

      localStorage.setItem("mpp-widgets_AuthToken", text.AccessToken);
      localStorage.setItem("mpp-widgets_JwtToken", text.JwtToken);
      localStorage.setItem("mpp-widgets_ExpiresAfter", new Date(token.exp * 1000));

      // Immediately update header UI
      if (typeof updateUserHeaderUI === "function") {
        updateUserHeaderUI();
      }
      $.magnificPopup.close();
      usernameSignInBtn.classList.remove("button-loading");

    }
  } catch (err) {
    usernameInput.style.borderColor = "#B91C1C";
    passwordInput.style.borderColor = "#B91C1C";
    usernameErrorDiv.style.visibility = "visible";
    error1.innerText = "Something went wrong. Please try again.";
    usernameSignInBtn.disabled = true;
    usernameSignInBtn.innerText = "SIGN IN";
    usernameSignInBtn.classList.remove("button-loading");
  }
}

async function handleExPasswordLogin() {
  let exPasswordValue = exPasswordInput.value.trim();

  // Start sending
  exPasswordSignInBtn.disabled = true;
  exPasswordSignInBtn.classList.add("button-loading");
  exPasswordSignInBtn.innerText = "SIGNING IN...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/v1.2/api/LoginPassword",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserName: phone_email, Password:exPasswordValue }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      exPasswordInput.style.borderColor = "#B91C1C";
      exPasswordErrorDiv.style.visibility = "visible";
      error2.innerText = text ||"Invalid password. Try again.";
      exPasswordSignInBtn.disabled = true;
      exPasswordSignInBtn.innerText = "SIGN IN";
      exPasswordSignInBtn.classList.remove("button-loading");
    } 
    else {
      const data = await response.json();

      // Save JWT Token
      const token = JSON.parse(atob(data.AccessToken.split(".")[1]));

      localStorage.setItem("mpp-widgets_AuthToken", data.AccessToken);
      localStorage.setItem("mpp-widgets_JwtToken", data.JwtToken);
      localStorage.setItem("mpp-widgets_ExpiresAfter", new Date(token.exp * 1000));

      // 🔹 Adobe Target Integration
      if (typeof adobe !== "undefined" && adobe.target) {
        adobe.target.getOffer({
          mbox: "target-global-mbox",
          params: {
            userId: data.UserId || "", // adjust if actual key is different
            email: data.Email || "",
            role: data.Roles || "",
            firstName: data.First_Name || "",
            lastName: data.Last_Name || "",
          },
          success: function (offer) {
            adobe.target.applyOffer({ offer: offer });
            console.log("🎯 Adobe Target personalization applied");
          },
          error: function (error) {
            console.error("⚠️ Adobe Target offer error:", error);
          },
        });
      }

      // Immediately update header UI
      if (typeof updateUserHeaderUI === "function") {
        updateUserHeaderUI();
      }

      // Proceed next - show phone field if SecondaryContact is null

      if (data.SecondaryContact.includes("null")) {
        // Hide Password prompt
        exPasswordDiv.style.display = "none";
        document.getElementById("secondaryContactForm").style.display = "flex";
        globalSuccessText.innerText = "You've logged in!";
        console.log("closing OTP modal");
        document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
          el.style.pointerEvents = 'auto';
        });
        const isEmail = data.SecondaryContact == "Email_null";
        const contactType = isEmail ? "email address" : "cell phone number";
        document.querySelector(".Phone_Email").textContent = contactType;

        const addButton = document.getElementById("addButton");
        addButton.innerText = isEmail ? "add email address" : "add cell phone number";

        if (isEmail)
          document.getElementById("secondaryContactInputEmail").style.display = "flex";
        else
          document.getElementById("secondaryContactInputPhone").style.display = "flex";
      } else {
        $.magnificPopup.close();
        setTimeout(() => {
          exPasswordDiv.style.display = "none";
        }, 1000);
      }
      exPasswordSignInBtn.classList.remove("button-loading");
    }
  } catch (err) {
    exPasswordInput.style.borderColor = "#B91C1C";
    exPasswordErrorDiv.style.visibility = "visible";
    error2.innerText = "Something went wrong. Please try again.";
    exPasswordSignInBtn.disabled = true;
    exPasswordSignInBtn.innerText = "SIGN IN";
    exPasswordSignInBtn.classList.remove("button-loading");
  }
}

// Set Password functionality
const setPasswordInput = document.getElementById("setPasswordInput");
const setPasswordConfirmInput = document.getElementById("setPasswordConfirmInput");
const setPasswordBtn = document.getElementById("setPasswordButton");
const setPasswordErrorDiv = document.getElementById("setPasswordInputsError");
const errorText = document.querySelector("#setPasswordInputsError .errorText");
let forgotPasswordFlow = false;

function validateSetPasswordInput(){
  const password = setPasswordInput.value.trim();
  const confirmPassword = setPasswordConfirmInput.value.trim();

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,}).+$/;

  // Reset error messages
  setPasswordErrorDiv.style.visibility = "hidden";
  errorText.innerText = "";

  if (password === "" && confirmPassword === "") {
    setPasswordInput.style.borderColor = "";
    setPasswordConfirmInput.style.borderColor = "";
    setPasswordBtn.disabled = true;
    return true;
  }

  if (password !== "" && !passwordPattern.test(password)) {
    setPasswordInput.style.borderColor = "#B91C1C";
    errorText.innerText = "Please enter a password that meets the criteria above.";
    setPasswordErrorDiv.style.visibility = "visible";
    setPasswordConfirmInput.style.borderColor = "";
    return false;
  }


  if (password !== confirmPassword && confirmPassword !== "") {
    setPasswordConfirmInput.style.borderColor = "#B91C1C";
    errorText.innerText = " Your confirmation password doesn't match.";
    setPasswordErrorDiv.style.visibility = "visible";
    setPasswordBtn.disabled = true;
    return false;
  }

  if (password !== "" && confirmPassword !== "") {    
    setPasswordBtn.disabled = false;
  } else {
    setPasswordBtn.disabled = true;
  }

  // If all checks pass
  setPasswordInput.style.borderColor = "";
  setPasswordConfirmInput.style.borderColor = "";
  return true;
}

async function handleSetPasswordLogin() {
  const password = setPasswordInput.value.trim();
  const confirmPassword = setPasswordConfirmInput.value.trim();

  // Start sending
  setPasswordBtn.disabled = true;
  setPasswordBtn.classList.add("button-loading");
  setPasswordBtn.innerText = forgotPasswordFlow ? "UPDATING PASSWORD..." : "SETTING PASSWORD...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/v1.2/api/Login/SetPassword",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: { Phone_Email: phone_email }, Password: password, Confirm_Password: confirmPassword }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      setPasswordInput.style.borderColor = "#B91C1C";
      setPasswordConfirmInput.style.borderColor = "#B91C1C";
      setPasswordErrorDiv.style.visibility = "visible";
      errorText.innerText = text ||"Failed to set password. Try again.";
      setPasswordBtn.disabled = false;
      setPasswordBtn.innerText = forgotPasswordFlow ? "UPDATE PASSWORD" : "SET PASSWORD";
      setPasswordBtn.classList.remove("button-loading");
    } 
    else {
      document.getElementById("reLoginSuccessSection").style.display = "flex";
      document.getElementById("setPasswordForm").style.display = "none";
      setPasswordBtn.classList.remove("button-loading");
      if(userNameForgotPass) phone_email="";
      document.getElementById("reLoginSuccessMessage").innerText = forgotPasswordFlow ? "Done! You’ve successfully reset your password." : "Done! You’ve successfully set your password.";
    }
  } catch (err) {
    setPasswordInput.style.borderColor = "#B91C1C";
    setPasswordConfirmInput.style.borderColor = "#B91C1C";
    setPasswordErrorDiv.style.visibility = "visible";
    errorText.innerText = "Something went wrong. Please try again.";
    setPasswordBtn.disabled = false;
    setPasswordBtn.innerText = forgotPasswordFlow ? "UPDATE PASSWORD" : "SET PASSWORD";
    setPasswordBtn.classList.remove("button-loading");
  }
}

document.getElementById("reLoginButton")?.addEventListener("click", function() {
  document.getElementById("reLoginSuccessSection").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
  resetLoginModalState();
  document.getElementById("loginInput").value = phone_email;
  if(phone_email != "")
    document.getElementById("continueButton").disabled = false;
});

// Sign Up Password functionality
const signUpPasswordInput = document.getElementById("signUpPasswordInput");
const signUpPasswordConfirmInput = document.getElementById("signUpPasswordConfirmInput");
const signUpPasswordBtn = document.getElementById("signUpPasswordButton");
const signUpPasswordErrorDiv = document.getElementById("signUpPasswordInputsError");
const signUpErrorText = document.querySelector("#signUpPasswordInputsError .errorText");

function validateSignUpPasswordInput(){
  const password = signUpPasswordInput.value.trim();
  const confirmPassword = signUpPasswordConfirmInput.value.trim();

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])(?=.{8,}).+$/;

  // Reset error messages
  signUpPasswordErrorDiv.style.visibility = "hidden";
  signUpErrorText.innerText = "";


  if (password === "" && confirmPassword === "") {
    signUpPasswordInput.style.borderColor = "";
    signUpPasswordConfirmInput.style.borderColor = "";
    signUpPasswordBtn.disabled = true;
    return true;
  }

  if (password !== "" && !passwordPattern.test(password)) {
    signUpPasswordInput.style.borderColor = "#B91C1C";
    signUpErrorText.innerText = "Please enter a password that meets the criteria above.";
    signUpPasswordErrorDiv.style.visibility = "visible";
    signUpPasswordConfirmInput.style.borderColor = "";
    return false;
  }


  if (password !== confirmPassword && confirmPassword !== "") {
    signUpPasswordConfirmInput.style.borderColor = "#B91C1C";
    signUpErrorText.innerText = " Your confirmation password doesn't match.";
    signUpPasswordErrorDiv.style.visibility = "visible";
    signUpPasswordBtn.disabled = true;
    return false;
  }

  if (password !== "" && confirmPassword !== "") {    
    signUpPasswordBtn.disabled = false;
  } else {
    signUpPasswordBtn.disabled = true;
  }

  // If all checks pass
  signUpPasswordInput.style.borderColor = "";
  signUpPasswordConfirmInput.style.borderColor = "";
  return true;
}

async function handleSignUpPasswordLogin() {
  const password = signUpPasswordInput.value.trim();
  const confirmPassword = signUpPasswordConfirmInput.value.trim();

  // Start sending
  signUpPasswordBtn.disabled = true;
  signUpPasswordBtn.classList.add("button-loading");
  signUpPasswordBtn.innerText = "SIGNING IN...";

  const payload = {
    code: {
      Phone_Email: signUpPayload.code.Phone_Email
    },
    First_Name: signUpPayload.First_Name,
    Last_Name: signUpPayload.Last_Name,
    Password: password,
    Confirm_Password: confirmPassword
  };

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/v1.2/api/Login/NewAccount",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      signUpPasswordInput.style.borderColor = "#B91C1C";
      signUpPasswordConfirmInput.style.borderColor = "#B91C1C";
      signUpPasswordErrorDiv.style.visibility = "visible";
      signUpErrorText.innerText = text ||"Failed to set password. Try again.";
      signUpPasswordBtn.disabled = false;
      signUpPasswordBtn.innerText = "SIGN IN";
      signUpPasswordBtn.classList.remove("button-loading");
    } 
    else {
      const data = await response.json();
      console.log("✅ OTP Verified:", data);

      // Save JWT Token
      const token = JSON.parse(atob(data.AccessToken.split(".")[1]));

      localStorage.setItem("mpp-widgets_AuthToken", data.AccessToken);
      localStorage.setItem("mpp-widgets_JwtToken", data.JwtToken);
      localStorage.setItem("mpp-widgets_ExpiresAfter", new Date(token.exp * 1000));

      // Immediately update header UI
      if (typeof updateUserHeaderUI === "function") {
        updateUserHeaderUI();
      }

      // Proceed next - show phone field if SecondaryContact is null
      // alert("SecondaryContact: " + data.SecondaryContact);
      if (data.SecondaryContact.includes("null")) {
        // Hide OTP form
        document.getElementById("signUpPasswordForm").style.display = "none";
        document.getElementById("secondaryContactForm").style.display = "flex";
        globalSuccessText.innerText = "You're all set!";
        const isEmail = data.SecondaryContact == "Email_null";
        const contactType = isEmail ? "email address" : "cell phone number";
        document.querySelector(".Phone_Email").textContent = contactType;
        document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
          el.style.pointerEvents = 'auto';
        });
        const addButton = document.getElementById("addButton");
        addButton.innerText = isEmail ? "add email address" : "add cell phone number";

        if (isEmail) {
          document.getElementById("secondaryContactInputEmail").style.display =
            "flex";
        } else {
          document.getElementById("secondaryContactInputPhone").style.display =
            "flex";
        }
        document.querySelectorAll(".Phone_Email").textContent = contactType;
      } else {
          // Need to handle if user created an account but for some reason he has deleted and again trying to signup
          // in this scenario he might have added an secondary contact when he previously created an account so we are mapping to the old account
          // so secondary contact will not be null
          // Close the modal
          $.magnificPopup.close();

          // Show success message or redirect
          resetLoginModalState();
          showSuccessModal(true);
          setTimeout(()=>{
            lockScroll();
          }, 700);
      }
      signUpPasswordBtn.classList.remove("button-loading");
    }
  } catch (err) {
    signUpPasswordInput.style.borderColor = "#B91C1C";
    signUpPasswordConfirmInput.style.borderColor = "#B91C1C";
    signUpPasswordErrorDiv.style.visibility = "visible";
    signUpErrorText.innerText = "Something went wrong. Please try again.";
    signUpPasswordBtn.disabled = false;
    signUpPasswordBtn.innerText = "SIGN IN";
    signUpPasswordBtn.classList.remove("button-loading");
  }

}
document.getElementById('exPasswordForgotPassword').addEventListener('click', handleResetPassword_EmailPhone);

document.getElementById('forgotPassword').addEventListener('click', function(){
  document.getElementById('forgotPassword').classList.add('link-loading');
  document.getElementById("usernameForm").style.display = "none";
  userNameForgotPass = true; forgotPasswordFlow = true;
  document.getElementById('resetPasswordForm').style.display = 'block';
  phone_email="";
  document.getElementById('forgotPassword').classList.remove('link-loading');
});

let forgotPasswordClick = false;
async function handleResetPassword_EmailPhone(){
  if(forgotPasswordClick) return;
  try {
    const forgotPass = document.getElementById('exPasswordForgotPassword');
    forgotPass.classList.add("link-loading");
    forgotPasswordFlow = true;
    forgotPasswordClick = true;
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/LoginCode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Phone_Email: phone_email }),
      }
    );

    const text = await response.text();
    if (!response.ok) {
      exPasswordErrorDiv.style.visibility = "visible";
      error2.innerText = text || "Verification Code Generation failed.";
      forgotPass.classList.remove("link-loading");
      forgotPasswordClick = false;
    }
    if (text.includes("Your authentication code was sent by")) {
      // Success – show OTP section
      document.getElementById("resetPasswordOtpSection").style.display = "flex";
      timeoutDidnotReceiveMessage = setTimeout(showRPDidnotReceiveMessage, 10000);
      document.getElementById("resetPasswordValueDisplay").innerText = phone_email;
      error2.innerText = "";
      exPasswordErrorDiv.style.visibility = "hidden";
      document.getElementById("exPasswordForm").style.display = "none";
      forgotPass.classList.remove("link-loading");
      forgotPasswordClick = false;
      // Focus OTP box
      const otpBox = document.querySelector(".resetotpInputBox");
      if (otpBox) otpBox.focus();

      // Optional: Attach OTP listeners once
      if (!window.otpListenersAttached) {
        if (typeof setupResetOtpListeners === "function") {
          setupResetOtpListeners();
          window.otpListenersAttached = true;
        }
      }
    }

  } catch (err) {
    forgotPass.classList.remove("link-loading");
    forgotPasswordClick = false;
    exPasswordErrorDiv.style.visibility = "visible";
    error2.innerText = "Something went wrong. Please try again.";
  }
}


function validateResetPasswordInput() {
  const inputElement = document.getElementById("resetPasswordInput");
  const errorDiv = document.getElementById("inputRPError");
  const errorDivText = document.querySelector('#inputRPError .errorText');
  const input = inputElement.value.trim();
  const continueBtn = document.getElementById("resetPasswordContinueButton");

  if (input === "") {
    continueBtn.disabled = true;
    errorDiv.style.visibility = 'hidden';
    errorDivText.textContent = "";
    inputElement.style.borderColor = "#D1D5DB";
    return;
  }

  if (validateEmail(input) || validatePhone(input)) {
    continueBtn.disabled = false;
    errorDiv.style.visibility = 'hidden';
    errorDivText.textContent = "";
    inputElement.style.borderColor = "#D1D5DB";
  } else {
    continueBtn.disabled = true;
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent =
      "Please enter a 10-digit cell phone number or valid email address.";
    // errorDiv.style.color = "#B91C1C";
    inputElement.style.borderColor = "#B91C1C";
  }

  if(input.length == 255){
    errorDiv.style.visibility = 'visible';
    errorDivText.textContent = "You’ve reached the 255-character limit";
    inputElement.style.borderColor = "#D1D5DB";
  }
}

function onBlurvalidateResetPasswordPhone() {
  const inputElement = document.getElementById("resetPasswordInput");
  const rawInput = inputElement.value.trim();

  const formattedPattern = /^\d{3}-\d{3}-\d{4}$/;
  if (formattedPattern.test(rawInput)) {
    return;
  }

  const digitsOnly = rawInput.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    const formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(
      3,
      6
    )}-${digitsOnly.slice(6)}`;
    inputElement.value = formatted;
  } else {
    inputElement.value = rawInput;
  }
}

async function handleResetPassword(){
  onBlurvalidateResetPasswordPhone();
  const input = document.getElementById("resetPasswordInput");
  const continueBtn = document.getElementById("resetPasswordContinueButton");
  const error = document.getElementById("inputRPError");
  const errorDivText = document.querySelector('#inputRPError .errorText');
  let value = input.value.trim();

  // Double check validation before calling API
  if (!(validateEmail(value) || validatePhone(value))) {
    error.innerText = "Please enter a valid email or cell phone number.";
    input.style.borderColor = "#B91C1C";
    return;
  }

  // Start sending
  continueBtn.disabled = true;
  continueBtn.classList.add("button-loading");
  continueBtn.innerText = "SENDING...";
  error.style.visibility = 'hidden';
  errorDivText.innerText = "";
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
      input.style.borderColor = "#B91C1C";
      error.style.visibility = 'visible';
      errorDivText.innerText = text || "Verification Code Generation failed.";
      continueBtn.disabled = false;
      continueBtn.innerText = "CONTINUE";
      continueBtn.classList.remove("button-loading");
      continueBtn.style.border = "1px solid white";
      continueBtn.style.color = "white";
    }
    if (text.includes("Your authentication code was sent by")) {
      // Success – show OTP section
      document.getElementById("resetPasswordOtpSection").style.display = "flex";
      timeoutDidnotReceiveMessage = setTimeout(showRPDidnotReceiveMessage, 10000);
      document.getElementById("resetPasswordButton").disabled = true;
      document.getElementById("resetPasswordValueDisplay").innerText = value;
      phone_email = value;
      document.getElementById("resetPasswordForm").style.display = "none";
      error.style.visibility = 'hidden';
      errorDivText.innerText = "";

      // Focus OTP box
      const otpBox = document.querySelector(".resetotpInputBox");
      if (otpBox) otpBox.focus();

      // Optional: Attach OTP listeners once
      if (!window.otpListenersAttached) {
        if (typeof setupResetOtpListeners === "function") {
          setupResetOtpListeners();
          window.otpListenersAttached = true;
        }
      }
    }

  } catch (err) {
    input.style.borderColor = "#B91C1C";
    error.style.visibility = 'visible';
    errorDivText.innerText = "Something went wrong. Please try again.";
    continueBtn.disabled = false;
    continueBtn.innerText = "CONTINUE";
  }
  continueBtn.disabled = false;
  continueBtn.classList.remove("button-loading");
  continueBtn.innerText = "CONTINUE";
}

function checkresetOtpAndToggleButton() {
  const otpInputs = document.querySelectorAll(".resetotpInputBox");
  const signUpOTPButton = document.getElementById("resetPasswordButton");

  const enteredDigits = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  if (enteredDigits.length === 6 && /^\d{6}$/.test(enteredDigits)) {
    signUpOTPButton.disabled = false;
  } else {
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    const otpError = document.getElementById("otpResetPasswordErrorMessage");
    if (otpError) otpError.remove();
    signUpOTPButton.disabled = true;
  }
}

function setupResetOtpListeners() {
  const otpInputs = document.querySelectorAll(".resetotpInputBox");

  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      const value = e.target.value;
      if (value.length === 6) {
        for (let i = 0; i < 6; i++) {
          if (otpInputs[i]) {
            otpInputs[i].value = value[i];
          }
        }
        otpInputs[5].focus();
      }
      e.target.value = value.slice(0, 1); // allow only first digit
      if (value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }

      checkresetOtpAndToggleButton(); // ✅ Add this here
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !e.target.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    input.addEventListener("keyup", () => {
      checkresetOtpAndToggleButton();
    });

    input.addEventListener("keypress", (e) => {
      // paste for safari ----------------------------------------
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
        setTimeout(async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (text && /^\d{6}$/.test(text)) {
              for (let i = 0; i < otpInputs.length; i++) {
                otpInputs[i].value = text[i] || "";
              }
              otpInputs[5].focus();
              checkOtpAndToggleButton();
            }
          } catch (err) {
            console.warn("Clipboard read failed", err);
          }
        }, 0);
      }
      // ---------------------------------------
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const btn = document.getElementById("resetPasswordButton");
        if (!btn.disabled) {
          btn.click();
        }
      }
    });
  });

  checkresetOtpAndToggleButton(); // Initial state check
}

async function verifyResetPasswordOtp() {
  const signInBtn = document.getElementById("resetPasswordButton");
  const otpInputs = document.querySelectorAll(".resetotpInputBox");
  const Phone_Email = document
    .getElementById("resetPasswordValueDisplay")
    .innerText.trim();
  const Code = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  // Reset previous error styles
  otpInputs.forEach((input) => (input.style.border = "2px solid white"));

  // Remove existing error message
  const oldErr = document.getElementById("otpResetPasswordErrorMessage");
  if (oldErr) oldErr.remove();

  // Show loading UI
  signInBtn.disabled = true;
  signInBtn.classList.add("button-loading");
  signInBtn.innerText = "VERIFYING...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/v1.2/api/LoginCode/Confirm",
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

      document.getElementById('setPasswordButton').innerText = 'UPDATE PASSWORD';
      document.getElementById("setPasswordForm").style.display = "flex";
      document.getElementById("resetPasswordOtpSection").style.display = "none";
      phone_email = Phone_Email;

    } else {
      // Error: invalid OTP
      otpInputs.forEach((input) => (input.style.border = "2px solid #B91C1C"));

      const err = document.createElement("div");
      err.id = "otpResetPasswordErrorMessage";
      err.style.color = "#B91C1C";
      err.style.fontSize = "14px";
      err.style.marginTop = "8px";
      err.style.fontFamily = "Poppins, sans-serif";
      err.style.visibility = 'visible';
      const exclamationSpan = document.createElement('span');
      exclamationSpan.classList.add('helperText');
      exclamationSpan.textContent = '!';
      const errorTextSpan = document.createElement('span');
      errorTextSpan.classList.add('errorText');
      errorTextSpan.innerText = "Invalid or expired code. Please try again.";
      document.getElementById("resetPasswordotpResendSection").appendChild(err);
      document.getElementById("otpResetPasswordErrorMessage").appendChild(exclamationSpan);
      document.getElementById("otpResetPasswordErrorMessage").appendChild(errorTextSpan);
    }
  } catch (err) {
    alert("Something went wrong. Please try again.");
    console.error("❌ OTP verification failed:", err);
  }

  // Reset button
  signInBtn.disabled = false;
  signInBtn.classList.remove("button-loading");
  signInBtn.innerText = "VERIFY";
}

let isRPResending = false;
async function resendResetPasswordOtp() {
  if (isRPResending) return;
  const input = document.getElementById("resetPasswordValueDisplay");
  const value = input.innerText.trim();
  const resetCodeLink = document.getElementById("resetPasswordCodeLink");
  const otpInputs = document.querySelectorAll(".resetotpInputBox"); // Remove existing error message
  const oldErr = document.getElementById("otpResetPasswordErrorMessage");
  const resetPButton = document.getElementById("resetPasswordButton");
  isRPResending = true;
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
      isRPResending = false;
    } else {
      resetCodeLink.classList.remove("link-loading");
      resetCodeLink.textContent = "Resend Code";
      isRPResending = false;
      // alert(value);
      otpInputs.forEach((input) => (input.value = ""));
      // Reset previous error styles
      otpInputs.forEach((input) => (input.style.border = "2px solid white"));
      if (!oldErr) {
        otpSucess = document.createElement("div");
        otpSucess.id = "otpResetPasswordErrorMessage";
        otpSucess.style.fontSize = "14px";
        otpSucess.style.marginTop = "8px";
        otpSucess.style.color = "Green";
        otpSucess.style.fontFamily = "Poppins, sans-serif";
        otpSucess.style.visibility = "visible";
        otpSucess.innerText = "Verification code sent successfully!";
        otpSucess.classList.add("blink");
        document.getElementById("resetPasswordotpResendSection").appendChild(otpSucess);

        setTimeout(() => {
          if (otpSucess) otpSucess.remove();
        }, 3000);
      }
      resetPButton.disabled = true;
      oldErr.style.visibility = "visible";
      oldErr.style.color = "Green";
      oldErr.innerText = "Verification code sent successfully!";
      oldErr.classList.add("blink");

      setTimeout(() => {
        oldErr.innerText = "";
        oldErr.classList.remove("blink");
      }, 3000);
    }
  } catch (err) {
    // input.style.borderColor = "#B91C1C";
    // error.innerText = "Something went wrong. Please try again.";
    isRPResending = false;
    resetCodeLink.classList.remove("link-loading");
    resetCodeLink.textContent = "Resend Code";
  }
}

function checkshowResetPasswordForm(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showResetPasswordForm();
  }
}

function showResetPasswordForm() {
  console.log("showResetPasswordForm");

  // Username/password forgot password flow
  if(userNameForgotPass){
    // Show login form
    const continueBtn = document.getElementById("resetPasswordContinueButton");
    continueBtn.classList.remove("button-loading");
    continueBtn.disabled = false;
    continueBtn.innerText = "CONTINUE";
    document.getElementById("resetPasswordForm").style.display = "block";

    // Hide OTP form
    document.getElementById("resetPasswordOtpSection").style.display = "none";

    // Optional: Reset OTP inputs
    const otpInputs = document.querySelectorAll(".resetotpInputBox");
    otpInputs.forEach((input) => (input.value = ""));
    // Reset previous error styles
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    document.getElementById("resetPasswordValueDisplay").textContent = "";

    // Optional: Clear any OTP errors
    const otpError = document.getElementById("otpResetPasswordErrorMessage");
    if (otpError) otpError.remove();

    document.getElementById("resetPasswordMessage").style.display = "none";
    clearTimeout(timeoutDidnotReceiveMessage);
    document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
    el.style.pointerEvents = 'auto';
  });
    return;
  }

  document.getElementById("resetPasswordOtpSection").style.display = "none";
  document.getElementById("resetPasswordMessage").style.display = "none";
  clearTimeout(timeoutDidnotReceiveMessage);
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
    el.style.pointerEvents = 'auto';
  });
  document.getElementById("loginForm").style.display = "block";
  resetLoginModalState();
  document.getElementById("loginInput").value = phone_email;
  document.getElementById('loginInput').focus();
  document.getElementById("continueButton").disabled = false;
}

function showRPDidnotReceiveMessage(){
  document.getElementById("resetPasswordMessage").style.display="block";
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
  el.style.pointerEvents = 'none';
  });
  
}

function showLDidnotReceiveMessage(){
  document.getElementById("loginCodeMessage").style.display="block";
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
  el.style.pointerEvents = 'none';
  });
}
function showSUDidnotReceiveMessage(){
  document.getElementById("signupCodeMessage").style.display="block";
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
  el.style.pointerEvents = 'none';
  });
}

function showSCDidnotReceiveMessage(){
  document.getElementById("secondaryContactCodeMessage").style.display="block";
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
  el.style.pointerEvents = 'none';
  });
}

function isAccessTokenValid(token, expectedIssuer, expectedAudience) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const { exp, iss, aud } = payload;

    return (
      exp &&
      Date.now() < exp * 1000 &&
      (!expectedIssuer || iss === expectedIssuer) &&
      (!expectedAudience || aud === expectedAudience)
    );
  } catch {
    return false;
  }
}