document.addEventListener("DOMContentLoaded", () => {
        const loginBtn = document.getElementById("openLoginModal");
        const modal = document.getElementById("customLoginModal");
        const backdrop = document.getElementById("customBackdrop");
        const closeBtn = modal.querySelector(".close-button");

        const input = document.getElementById("loginInput");
        const error = document.getElementById("inputError");
        const continueBtn = document.getElementById("continueButton");

        // Show modal
        loginBtn.addEventListener("click", () => {
            modal.classList.remove("hidden");
            backdrop.classList.remove("hidden");
        });

        // Hide modal
        closeBtn.addEventListener("click", () => {
            modal.classList.add("hidden");
            backdrop.classList.add("hidden");
            input.value = "";
            error.innerText = "";
            input.style.borderColor = "#ccc";
            continueBtn.disabled = true;
            continueBtn.style.cursor = "not-allowed";
        });

        // Validation on input
        input.addEventListener("input", () => {
            const value = input.value.trim();

            const isValid = validateEmail(value) || validatePhone(value);

            if (isValid) {
                input.style.borderColor = "#ccc";
                error.innerText = "";
                continueBtn.disabled = false;
            } else {
                input.style.borderColor = "red";
                error.innerText = "Enter a valid email or 10-digit US/India phone number.";
                continueBtn.disabled = true;
            }
        });


        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            return re.test(email);
        }


        function validatePhone(phone) {
            // Reject if it contains anything other than digits, space, +, or dash
            const allowedChars = /^[\d\s\+\-]+$/;
            if (!allowedChars.test(phone)) return false;

            const cleaned = phone.replace(/\D/g, ""); // Remove everything except digits
            const isIndian = /^[6-9]\d{9}$/.test(cleaned);
            const isUS = /^\d{10}$/.test(cleaned);
            return isIndian || isUS;
        }

        function checkOtpAndToggleButton() {
            const otpInputs = document.querySelectorAll(".otpBox");
            const signInButton = document.getElementById("signInButton");

            const enteredDigits = Array.from(otpInputs).map(input => input.value.trim()).join("");
            console.log("Digits Entered:", enteredDigits);

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
                // Handle digit input
                input.addEventListener("input", (e) => {
                    let val = e.target.value.replace(/\D/g, ""); // Only digits
                    if (val.length > 1) val = val.charAt(0); // Only take the first digit
                    e.target.value = val;

                    // Move to next input if value entered
                    if (val && index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }

                    checkOtpAndToggleButton(); // Check if all 6 digits entered
                });

                // Extra check when user types and then moves focus
                input.addEventListener("keyup", () => {
                    checkOtpAndToggleButton();
                });

                // Handle backspace to go to previous box
                input.addEventListener("keydown", (e) => {
                    if (e.key === "Backspace" && !e.target.value && index > 0) {
                        otpInputs[index - 1].focus();
                    }
                });
            });

            // Check once in case browser auto-fills
            checkOtpAndToggleButton();
        }


        continueBtn.addEventListener("click", async () => {
            const value = input.value.trim();
            continueBtn.disabled = true;
            continueBtn.innerText = "Sending...";

            try {
                const response = await fetch("https://mobileserverdev.calvaryftl.org/api/LoginCode", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Phone_Email: value })
                });

                const text = await response.text();

                if (!response.ok) {
                    input.style.borderColor = "red";
                    error.innerText = text;
                    continueBtn.disabled = false;
                    continueBtn.innerText = "Continue";
                } else {
                    // ✅ Show OTP Section
                    document.getElementById("otpSection").style.display = "flex";
                    document.getElementById("userValueDisplay").innerText = value;

                    // Hide previous content
                    document.querySelector("img").style.display = "none"; // Logo
                    document.querySelector("h2").style.display = "none";
                    document.querySelector("p").style.display = "none";
                    input.style.display = "none";
                    continueBtn.style.display = "none";
                    error.innerText = "";

                    // Set up OTP input auto-focus
                    document.querySelector(".otpBox").focus();
                    if (!window.otpListenersAttached) {
                        setupOtpListeners();
                        window.otpListenersAttached = true;
                    }


                }
            } catch (err) {
                input.style.borderColor = "red";
                error.innerText = "Something went wrong. Please try again.";
                continueBtn.disabled = false;
                continueBtn.innerText = "Continue";
            }
        });


        // === SIGN IN BUTTON CLICK ===
        document.getElementById("signInButton").addEventListener("click", async () => {
            const signInBtn = document.getElementById("signInButton");
            const otpInputs = document.querySelectorAll(".otpBox");
            const Phone_Email = document.getElementById("userValueDisplay").innerText.trim();
            const Code = Array.from(otpInputs).map(input => input.value.trim()).join("");

            // Clean up previous styles
            otpInputs.forEach(input => input.style.borderColor = "white");

            // Remove old error message if any
            const oldErr = document.getElementById("otpErrorMessage");
            if (oldErr) oldErr.remove();

            signInBtn.disabled = true;
            signInBtn.classList.add("button-loading");
            signInBtn.innerText = "Verifying...";

            try {
                const response = await fetch("https://mobileserverdev.calvaryftl.org/v1.0/api/LoginCode/Confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        Phone_Email,
                        Code,
                        DeviceID: "dummy-device-id",
                        API_Key: "dummy-api-key"
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("API Response:", data);
                    // ✅ Save JwtToken to Local Storage
                    localStorage.setItem("mpp-widgets_AuthToken", data.JwtToken);
                    
                    alert("SecondaryContact: " + data.SecondaryContact);
                    // In next step we'll conditionally show phone number input if null
                } else {
                    // API returned 401 or error
                    otpInputs.forEach(input => input.style.borderColor = "red");

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
                console.error(err);
            }

            signInBtn.disabled = false;
            signInBtn.classList.remove("button-loading");
            signInBtn.innerText = "SIGN IN";
        });


    });
    window.otpListenersAttached = false;