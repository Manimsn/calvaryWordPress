  // Profile Name Elements
let firstNameInput = document.getElementById("firstNameInputEP");
let lastNameInput = document.getElementById("lastNameInputEP");
let middleNameInput = document.getElementById("middleNameInput");
let preferredNameInput = document.getElementById("preferredNameInput");
let nicknameEl = document.getElementById("nickname");
let emailAddress = document.getElementById("emailAddress");
let phoneNumber = document.getElementById("phoneNumber");
let birthdayInput = document.getElementById("birthdayInput");
let prefixInput = document.getElementById("prefixBtn");
let suffixInput = document.getElementById("suffixBtn");
let maritalStatusInput = document.getElementById("maritalStatusBtn");
let profileMessage = document.getElementById("profileMessage");
let inputErrorFirstName = document.getElementById("inputErrorFirstName");
let inputErrorLastName = document.getElementById("inputErrorLastName");

// Profile Data Variables
let genderID = null;
let maritalStatusID = null;
let prefixID = null;
let suffixID = null; 
let nickNameVar = "";
let webImageURL = "";
let originalProfile = null;
let hasChanges = false;

let prefixObj = null;
let suffixObj = null;
let maritalStatusObj = null;

// Email and Phone Validation Elements
const emailIcon = document.getElementById('emailIcon');
const phoneIcon = document.getElementById('phoneIcon');
const label = document.getElementById('VerifyLabel');
const codeBtn = document.getElementById("codeBtn");
const phoneEmailInput = document.getElementById('inputFieldEP');
const inputErrorDiv = document.getElementById("inputErrorEP");
const inputErrorDivText = document.querySelector('#inputErrorEP .errorText');
let iconId = 'emailIcon';
let ph_email = "";
let profileImageCamera = null;
const token = localStorage.getItem("mpp-widgets_JwtToken");

// Page-level loader: create once and provide show/hide helpers
function ensurePageLoader() {
  if (document.getElementById('pageLoader')) return;
  const style = document.createElement('style');
  style.id = 'pageLoaderStyles';
  style.innerHTML = `
    #pageLoader { position: fixed; inset: 0; background: rgba(0,181,239,0.3); z-index: 99999; backdrop-filter: blur(8px); display:flex; align-items:center; justify-content:center; }
    #pageLoader .loaderBox { text-align:center; font-family: 'Poppins', sans-serif; color: white; }
    #pageLoader .spinner { width:64px; height:64px; border-radius:50%; border:5px solid #e5e7eb; border-top-color:#0369a1; animation: pl-spin 1s linear infinite; margin:0 auto 12px; }
    @keyframes pl-spin { to { transform: rotate(360deg); } }
    #pageLoader .loaderText { font-size:14px; color:white; }
  `;
  document.head.appendChild(style);

  const loader = document.createElement('div');
  loader.id = 'pageLoader';
  loader.style.display = 'none';
  loader.innerHTML = `
    <div class="loaderBox">
      <div class="spinner" aria-hidden="true"></div>
      <div class="loaderText">Loading profile...</div>
    </div>
  `;
  document.body.appendChild(loader);
}

function showPageLoader() {
  ensurePageLoader();
  const l = document.getElementById('pageLoader');
  if (l) l.style.display = 'flex';
}

function hidePageLoader() {
  const l = document.getElementById('pageLoader');
  if (l) l.style.display = 'none';
}

const style = document.createElement("style");
style.id = "removeZindexStyle";
style.innerHTML = `
  .et_pb_row:not(.custom-menu-row),
  .et_pb_column:(.custom-menu-column, .custom-header-logo-column, .desktop_button_column) {
    z-index: auto !important;
    position: static !important;
  }
  .tab-row .dsm-active{
    z-index: 999 !important;
  }
  .custom-header {
    z-index: 0 !important;
  }
  .et_pb_column--with-menu,
  .et_pb_row.et_pb_row_0_tb_header.custom-menu-row.et_pb_sticky_module.et_pb_equal_columns.et_pb_row--with-menu.et_pb_row_1-4_1-2_1-4,
  .et_pb_row.et_pb_row_3_tb_header.et_pb_equal_columns.et_pb_gutters1.et_pb_row--with-menu {
    z-index: 1 !important;
  }
`;

function updateName(name, punctuation = "!") {
  const oval = document.getElementById("nameOval");

  // Add punctuation dynamically
  nicknameEl.textContent = name + punctuation;

  const rect = nicknameEl.getBoundingClientRect();
  const baseWidth = 190;

  const scaleX = rect.width / baseWidth;
  const scaleY = 1 + ((scaleX - 1) * 0.3);

  oval.style.transform = `translate(-50%, -50%) scale(${scaleX}, ${scaleY}) rotate(-8deg)`;
}

function createCustomDropdown({ dropdownId, buttonId, listId, data, selectedItem, onSelect }) {
  const dropdown = document.getElementById(dropdownId);
  const dropdownBtn = document.getElementById(buttonId);
  const dropdownList = document.getElementById(listId);

   // Clear dropdown list content first (if any)
  dropdownList.innerHTML = "";

  // Set placeholder text and style in button
  // Determine initial button text
  let currentSelected = selectedItem; 

  // Set placeholder text and style in button
  if (currentSelected) {
    dropdownBtn.textContent = currentSelected.name;
    dropdownBtn.classList.remove("placeholder");
  } else {
    dropdownBtn.textContent = "-- Select --";
    dropdownBtn.classList.add("placeholder");
  }

  // Populate dropdown dynamically
  data.forEach((item) => {
    const option = document.createElement("div");
    option.classList.add("dropdownItem");
    option.textContent = item.name;
    option.tabIndex = 0;
    option.dataset.id = item.id;
    dropdownList.appendChild(option);

    // Highlight the selected one
    if (currentSelected && item.id === currentSelected.id) {
      option.classList.add("active");
    }

    // Handle click selection
    option.addEventListener("click", () => {
      // Ensure we target the current button in the DOM (in case it was cloned/replaced)
      const currentBtn = dropdown.querySelector(`#${buttonId}`) || dropdownBtn;
      currentBtn.classList.remove("placeholder");

      if (item.name.toLowerCase() === "de-select") {
        currentBtn.textContent = "-- Select --";
        currentBtn.classList.add("placeholder");
        currentSelected = null; 
      } else {
        currentBtn.textContent = item.name;
        currentBtn.classList.remove("placeholder");
        currentSelected = item;
      }

      dropdown.classList.remove("open");

      dropdownList.querySelectorAll(".dropdownItem").forEach(o => o.classList.remove("active"));
      option.classList.add("active");

      // Call the onSelect callback with selected value
      if (onSelect) {
        if (item.name.toLowerCase() === "de-select") {
          onSelect(null); // treat de-select as null
        } else {
          onSelect(item);
        }
      }
    });

    option.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const currentBtn = dropdown.querySelector(`#${buttonId}`) || dropdownBtn;
        currentBtn.classList.remove("placeholder");

        if (item.name.toLowerCase() === "de-select") {
          currentBtn.textContent = "-- Select --";
          currentBtn.classList.add("placeholder");
          currentSelected = null; 
        } else {
          currentBtn.textContent = item.name;
          currentBtn.classList.remove("placeholder");
          currentSelected = item;
        }

        dropdown.classList.remove("open");

        dropdownList.querySelectorAll(".dropdownItem").forEach(o => o.classList.remove("active"));
        option.classList.add("active");

        // Call the onSelect callback with selected value
        if (onSelect) {
          if (item.name.toLowerCase() === "de-select") {
            onSelect(null); // treat de-select as null
          } else {
            onSelect(item);
          }
        }
      }
    });
  });

  // Clean old listeners
  if (!dropdown || !dropdownBtn || !dropdownList) return;

  // Remove previously attached document click handler for this dropdown (if any)
  if (dropdown._docClickHandler) {
    document.removeEventListener('click', dropdown._docClickHandler);
    dropdown._docClickHandler = null;
  }

  // Remove previously attached mouseenter handler for this list (if any)
  if (dropdownList._mouseenterHandler) {
    dropdownList.removeEventListener('mouseenter', dropdownList._mouseenterHandler);
    dropdownList._mouseenterHandler = null;
  }

  // Replace the button node to clear any previous anonymous listeners
  // (cloning removes all attached listeners).
  const freshBtn = dropdownBtn.cloneNode(true);
  dropdownBtn.parentNode.replaceChild(freshBtn, dropdownBtn);
  // Reassign to the fresh button reference used below
  const btn = freshBtn;

  // Toggle dropdown open/close
  btn.addEventListener('click', () => {
    dropdown.classList.toggle('open');

    // Ensure initial load items are restored
    if (dropdown.classList.contains('open')) {
      // If there's a currently selected item, make sure the list scrolls to it
      if (!currentSelected) {
        const activeEl = dropdownList.querySelector('.dropdownItem.active');
        if (activeEl) {
          currentSelected = {
            id: activeEl.dataset.id,
            name: activeEl.textContent.trim()
          };
        }
      }

      if (currentSelected) {
        // apply active state to items
        dropdownList.querySelectorAll('.dropdownItem').forEach(o => {
          o.classList.toggle('active', o.dataset.id === String(currentSelected.id));
        });

        // scroll the selected item into view rather than always jumping to top
        const target = dropdownList.querySelector(`.dropdownItem[data-id="${currentSelected.id}"]`);
        if (target) {
          // prefer nearest block so it stays within view
          try {
            target.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } catch (e) {
            // fallback
            dropdownList.scrollTop = target.offsetTop;
          }
          // ensure keyboard focus follows
          target.focus();
        } else {
          dropdownList.scrollTop = 0;
        }
      } else {
        // no selection -> show top
        dropdownList.scrollTop = 0;
      }
    }
  });

  // Close dropdown if clicked outside — store handler reference so it can be removed next init
  const docHandler = (e) => {
    if (!btn.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  };
  document.addEventListener('click', docHandler);
  dropdown._docClickHandler = docHandler;

  // Remove active highlight on hover — store handler reference
  const mouseEnterHandler = () => {
    dropdownList.querySelectorAll('.dropdownItem').forEach(o => o.classList.remove('active'));
  };
  dropdownList.addEventListener('pointerenter', mouseEnterHandler);
  dropdownList.addEventListener('touchstart', mouseEnterHandler, { passive: true });
  dropdownList._mouseenterHandler = mouseEnterHandler;

}


let prefixData = [];
let suffixData = [];
let maritalStatusData = [];
let selectedPrefix = null;
let selectedSuffix = null;
let selectedMaritalStatus = null;

// Date Picker Initialization
let locale = {
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthsShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],
  today: 'Today',
  clear: 'Clear',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: 'hh:mm aa',
  firstDay: 0
}

// Initialize datepicker and ensure it opens to the input date when present
let dp = new AirDatepicker('#birthdayInput', {
  locale: locale,
  position: 'bottom left',
  dateFormat: 'M/d/yyyy',
  maxDate: new Date(),
  minDate: new Date(new Date().setFullYear(new Date().getFullYear() - 120)),
  onShow() {
    const inputValue = birthdayInput.value;
    if (inputValue) {
      const parsedDate = new Date(inputValue);
      if (!isNaN(parsedDate)) {
        dp.selectDate(parsedDate, { silent: true });
      }
    }
  },
  onSelect({ date, formattedDate, datepicker }) {
    datepicker.hide(); // close the datepicker after date selection
  },
  selectedDates: []
});

const profilePhoto = document.getElementById('profilePhoto');
const profileContainer = document.querySelector('.profile-photo-container');
let uploadedProfileFile = null;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1]; // remove "data:image/png;base64,"
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

function updateProfilePhoto(data,payload) {
  const img = document.getElementById("profilePhoto");
  const container = img.parentElement;

  // Remove old initials if any
  const oldInitialsDiv = container.querySelector(".initials-avatar");
  if (oldInitialsDiv) oldInitialsDiv.remove();

  if (data.Web_Image_URL) {
    // Show image
    img.src = data.Web_Image_URL;
    img.style.display = "block";
  } else {
    // No image — show initials
    const firstName = payload.FirstName || "";
    const lastName = payload.LastName || "";
    const email = payload.UserName || "";

    const initials =
      firstName && lastName
        ? `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
        : email.charAt(0).toUpperCase();

    img.style.display = "none";

    const initialsDiv = document.createElement("div");
    initialsDiv.className = "initials-avatar";
    initialsDiv.textContent = initials;

    container.appendChild(initialsDiv);
  }
}

function checkshowEPForm(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    showEPForm();
  }
}

function showEPForm() {
  // Show EP form
  codeBtn.classList.remove("button-loading");
  codeBtn.disabled = false;
  codeBtn.innerText = "SEND VERIFICATION CODE";
  document.getElementById("verificationForm").style.display = "block";

  // Hide OTP form
  document.getElementById("otpSectionEP").style.display = "none";

  // Optional: Reset OTP inputs
  const otpInputs = document.querySelectorAll(".otpInputBoxEP");
  otpInputs.forEach((input) => (input.value = ""));
  // Reset previous error styles
  otpInputs.forEach((input) => (input.style.border = "2px solid white"));
  document.getElementById("userValueDisplayEP").textContent = "";

  // Optional: Clear any OTP errors
  const otpError = document.getElementById("otpErrorMessageEP");
  if (otpError) otpError.remove();

  document.getElementById("codeMessage").style.display="none";
  clearTimeout(timeoutDidnotReceiveMessage);
}

function showDidnotReceiveMessage(){
  document.getElementById("codeMessage").style.display="block";
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
  el.style.pointerEvents = 'none';
  });
}

phoneIcon.addEventListener('click', function() {
  changePlaceholder(this.id);
  iconId = 'phoneIcon';
  resetModalState()
});

emailIcon.addEventListener('click', function() {
  changePlaceholder(this.id);
  iconId = 'emailIcon';
  resetModalState()
});


function changePlaceholder(IconId) {
  if (IconId === 'phoneIcon') {
    phoneEmailInput.placeholder = '999-999-9999';
    phoneEmailInput.maxLength = 12;
    label.textContent = "Enter the new cell phone number"
  } else if (IconId === 'emailIcon') {
    phoneEmailInput.placeholder = 'sampleuser@yourdomain.com';
    label.textContent = "Enter the new email address"
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email);
}

function validateInput() {
  let input = phoneEmailInput.value.trim();
  let isValid = false;

  if (input === "") {
    codeBtn.disabled = true;
    inputErrorDivText.textContent = "";
    inputErrorDiv.style.visibility = 'hidden';
    phoneEmailInput.style.borderColor = "#D1D5DB";
    return;
  }

  if (iconId === 'phoneIcon') {

    let cleaned = input.replace(/\D/g, '');

    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

    if (cleaned.length > 6) {
      input = cleaned.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1-$2-$3');
    } else if (cleaned.length > 3) {
      input = cleaned.replace(/(\d{3})(\d{0,3})/, '$1-$2');
    } else {
      input = cleaned;
    }
    // Update input field with formatted value
    phoneEmailInput.value = input;
    // Now validate phone based on cleaned digits
    const isIndian = /^[6-9]\d{9}$/.test(cleaned);
    const isUS = /^\d{10}$/.test(cleaned);
    isValid = isIndian || isUS;

  } else if (iconId === 'emailIcon') {
    isValid = validateEmail(input);
  }

  if (isValid) {
    codeBtn.disabled = false;
    inputErrorDivText.textContent = "";
    inputErrorDiv.style.visibility = 'hidden';
    phoneEmailInput.style.borderColor = "#D1D5DB"; // Reset to normal border
  } else if (iconId === 'emailIcon' && !isValid) {
    codeBtn.disabled = true;
    inputErrorDiv.style.visibility = 'visible';
    inputErrorDivText.textContent = "Please enter a valid email address.";
    phoneEmailInput.style.borderColor = "#B91C1C"; // Add red border
  }

}

function resetModalState() {     
  phoneEmailInput.value = "";
  phoneEmailInput.style.borderColor = "";
  inputErrorDiv.style.visibility = "hidden";
  codeBtn.disabled = true;
  codeBtn.innerText = "SEND VERIFICATION CODE";
  codeBtn.classList.remove("button-loading");

  const otpInputs = document.querySelectorAll(".otpInputBoxEP");
  const oldErr = document.getElementById("otpErrorMessageEP");
  document.getElementById("codeMessage").style.display="none";

  if (oldErr) oldErr.remove();

  if (otpInputs) {
    otpInputs.forEach((input) => {
      input.value = "";
      input.style.border = "2px solid white";
    });
  }

  clearTimeout(timeoutDidnotReceiveMessage);
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
    el.style.pointerEvents = 'auto';
  });
  stopCamera();

  setTimeout(() => {
    // Reset form sections
    document.getElementById("verificationForm").style.display = "block";
    document.getElementById("otpSectionEP").style.display = "none";
    document.getElementById('selectPhotoOption').style.display = 'flex';
    document.getElementById('photoModal').style.display = 'none';
    document.getElementById('video').style.display = 'block';
    document.getElementById('takePhoto').style.display = 'block';
    document.getElementById('retakePhoto').style.display = 'none';
    document.getElementById('usePhoto').style.display = 'none';
    document.getElementById('photoPreview').style.display = 'none';
  }, 900); 
}

// Close button click listener
document.addEventListener("click", function (e) {
  const isCloseButton = e.target.closest(".mfp-close");

  if (isCloseButton) {
    console.log("✅ DIVI modal close button clicked");
    resetModalState();
  }
});

// ESC key listener
document.addEventListener("keydown", function (e) {
  if ( e.key === "Escape" ) {
    console.log("✅ ESC key pressed");
    resetModalState();
  }
});

// DIVI modal closed via overlay or close button
jQuery(document).ready(function ($) {
  $(document).on("mfpClose", function () {
    console.log("✅ Modal closed (by close button or outside click)");
    // Enable scrolling
      resetModalState();
  });
});

function validateName(fieldId, inputErrorDivId, maxLength = 25) {
  const inputElement = document.getElementById(fieldId);
  const inputErrorDiv = document.getElementById(inputErrorDivId);
  const errorText = document.querySelector(`#${inputErrorDivId} .errorText`);

  // Allow only letters, ., ', -, spaces; limit length
  let input = inputElement.value.replace(/[^a-zA-Z.,'’‘\- ]/g, "").slice(0, maxLength);
  inputElement.value = input;

  if (input === "") {
    inputErrorDiv.style.removeProperty('display');
    inputErrorDiv.style.visibility = 'hidden';
    errorText.textContent = "";
    inputElement.style.borderColor = "";
    document.getElementById("save").disabled = false;
  } else if (input.length === maxLength) {
    inputErrorDiv.style.setProperty('display', 'flex', 'important');
    inputErrorDiv.style.visibility = 'visible';
    errorText.textContent = `You’ve reached the ${maxLength}-character limit`;
  } else {
    inputErrorDiv.style.removeProperty('display');
    inputErrorDiv.style.visibility = 'hidden';
    errorText.textContent = "";
    inputElement.style.borderColor = "";
    document.getElementById("save").disabled = false;
  }
}

function validateNameFields() {
  validateName("middleNameInput", "inputErrorMiddleName");
  validateName("preferredNameInput", "inputErrorPreferredName");
}

function checkInputs() {
  const firstName = document.getElementById("firstNameInput");
  const lastName = document.getElementById("lastNameInput");
  
  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();

  const firstNameValid = firstNameValue.length > 0;
  const lastNameValid = lastNameValue.length > 0;

  return firstNameValid && lastNameValid;
}

function formatDate(isDate) {
  if (!isDate) return "";
  const d = new Date(isDate);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

function setGenderRadio(genderId) {
  let genderValue = "";
  if (genderId === 1) genderValue = "Male";
  else if (genderId === 2) genderValue = "Female";
  else return;

  const radio = document.querySelector(`input[name="gender"][value="${genderValue}"]`);
  if (radio) radio.checked = true;
}

function getSelectedGenderId() {
  const selected = document.querySelector('input[name="gender"]:checked');
  if (!selected) return null;

  switch (selected.value) {
    case "Male":
      return 1;
    case "Female":
      return 2;
    default:
      return null;
  }
}

function formatDateForPayload(date) {
  const d = new Date(date);
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function showLDidnotReceiveMessage(){
  document.getElementById("loginCodeMessage").style.display="block";
  document.querySelectorAll('.submitButtonDiv h5').forEach(el => {
  el.style.pointerEvents = 'none';
  });
}

function checkOtpAndToggleButton() {
  const otpInputs = document.querySelectorAll(".otpInputBoxEP");
  const verifyBtn = document.getElementById("verifyButton");

  const enteredDigits = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  if (enteredDigits.length === 6 && /^\d{6}$/.test(enteredDigits)) {
    verifyBtn.disabled = false;
  } else {
    otpInputs.forEach((input) => (input.style.border = "2px solid white"));
    const otpError = document.getElementById("otpErrorMessageEP");
    if (otpError) otpError.remove();
    verifyBtn.disabled = true;
  }
}

function setupOtpListeners() {
  const otpInputs = document.querySelectorAll(".otpInputBoxEP");

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
        const btn = document.getElementById("verifyButton");
        if (!btn.disabled) {
          btn.click();
        }
      }
    });
  });

  checkOtpAndToggleButton(); // Initial state check
}

function showMessage(type, message) {
  const container = document.getElementById("profileMessage");
  const icon = container.querySelector(".icon");
  const text = container.querySelector(".messageText");

  container.className = "";
  text.className = "messageText";
  icon.className = "icon";

  container.style.visibility = "visible";
  container.scrollIntoView({ behavior: "smooth", block: "center" });

  // Apply relevant classes
  if (type === "error") {
    container.classList.add("error");
    icon.classList.add("warningIcon");
    text.classList.add("errorText");
    icon.textContent = "!";
  } else if (type === "success") {
    container.classList.add("success");
    icon.classList.add("tickIcon");
    text.classList.add("successText");
    // Insert SVG checkmark instead of a plain text character
    icon.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
        <g clip-path="url(#clip0_3430_15687)">
          <path d="M14.3767 26.6667L5.33337 19.0748L7.25208 16.4347L13.6706 21.8221L24.0887 5.33337L26.6667 7.21459L14.3767 26.6667Z" fill="#15803D"/>
        </g>
        <defs>
          <clipPath id="clip0_3430_15687">
            <rect width="32" height="32" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    `;
  }

  text.textContent = message;

  // Auto-hide after 20 seconds
  setTimeout(() => {
    container.style.visibility = "hidden";
  }, 20000);
}

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

function closeNoChangesModal() {
  document.getElementById("noChangesDiv").style.display = "none";
  unlockScroll();
  const existingStyle = document.getElementById("removeZindexStyle");
  if (existingStyle) {
    existingStyle.remove();
  }
}

document
  .querySelector("#noChangesDiv.modal-overlay")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      closeNoChangesModal();
    }
  });

document.addEventListener("keydown", function (e) {
  const modal = document.getElementById("noChangesDiv");
  if (e.key === "Escape" && modal.style.display === "flex") {
    closeNoChangesModal();
  }
});

$(document).on("mfpOpen", function () {
    // Disable scrolling
    const width = window.screen.width;
    if(width < 768 || width > 1024){
      lockScroll();
    }
    else{
      document.body.style.position = "fixed";
    }
});

// API Integration
async function loadProfile() {
  
  if (token) {
    // Show loader for the whole profile load (lookups + contact fetch)
    showPageLoader();
    await fetchData();
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
      const data = await response.json();
      console.log("My profile",data);
      originalProfile = JSON.parse(JSON.stringify(data));
      console.log(originalProfile);
      if (response.ok) {
        // Populate profile fields
        prefixID = data.Prefix_ID;
        suffixID = data.Suffix_ID;
        maritalStatusID = data.Marital_Status_ID;

        prefixObj = prefixData.find(p => p.id === prefixID);
        suffixObj = suffixData.find(s => s.id === suffixID);
        maritalStatusObj = maritalStatusData.find(m => m.id === maritalStatusID);

        selectedPrefix = prefixObj ? prefixObj : null;
        selectedSuffix = suffixObj ? suffixObj : null;
        selectedMaritalStatus = maritalStatusObj ? maritalStatusObj : null;

        const prefixEl = document.querySelector(
          `#prefixList .dropdownItem[data-id="${selectedPrefix?.id}"]`
        );
        
        if (prefixEl)prefixEl.classList.add("active");
         
        const suffixEl = document.querySelector(
          `#suffixList .dropdownItem[data-id="${selectedSuffix?.id}"]`
        );

        if (suffixEl) suffixEl.classList.add("active");

        const maritalStatusEl = document.querySelector(
          `#maritalStatusList .dropdownItem[data-id="${selectedMaritalStatus?.id}"]`
        );

        if (maritalStatusEl) maritalStatusEl.classList.add("active");

        nickNameVar = data.Nickname;
        updateName(nickNameVar);
        updateProfilePhoto(data,payload);
        formatDate(data.Date_of_Birth) ? birthdayInput.value = formatDate(data.Date_of_Birth) : birthdayInput.value = "";
        setGenderRadio(data.Gender_ID);

        if (birthdayInput.value) {
          const parsedDate = new Date(birthdayInput.value);
          if (!isNaN(parsedDate)) dp.selectDate(parsedDate, { silent: true });
        }
        firstNameInput.value = data.First_Name || "";
        lastNameInput.value = data.Last_Name || "";
        middleNameInput.value = data.Middle_Name || "";
        preferredNameInput.value = data.Nickname || "";
        emailAddress.value = data.Email_Address || "";
        phoneNumber.value = data.Mobile_Phone || "";
        webImageURL = data.Web_Image_URL || "";

        // Re-query button elements to avoid stale references (createCustomDropdown may replace nodes)
        const prefixBtnEl = document.getElementById('prefixBtn');
        const suffixBtnEl = document.getElementById('suffixBtn');
        const maritalBtnEl = document.getElementById('maritalStatusBtn');

        if (prefixBtnEl) {
          prefixBtnEl.textContent = prefixObj ? prefixObj.name : "-- Select --";
          if (prefixObj) prefixBtnEl.classList.remove('placeholder');
          else prefixBtnEl.classList.add('placeholder');
        }

        if (suffixBtnEl) {
          suffixBtnEl.textContent = suffixObj ? suffixObj.name : "-- Select --";
          if (suffixObj) suffixBtnEl.classList.remove('placeholder');
          else suffixBtnEl.classList.add('placeholder');
        }

        if (maritalBtnEl) {
          maritalBtnEl.textContent = maritalStatusObj ? maritalStatusObj.name : "-- Select --";
          if (maritalStatusObj) maritalBtnEl.classList.remove('placeholder');
          else maritalBtnEl.classList.add('placeholder');
        }

      } else {
        console.error("Error fetching profile:", data);
      }
    } catch (error) {
      console.error("Invalid JWT token", error);
    } finally {
      // hide once lookups + contact fetch processing complete
      hidePageLoader();
    }
  }
}

async function fetchData() {
  try {
    // Fetch all APIs in parallel
    const [genderRes, prefixRes, suffixRes, maritalStatusRes] = await Promise.all([
      fetch("https://mobileserverdev.calvaryftl.org/api/Gender"),
      fetch("https://mobileserverdev.calvaryftl.org/api/Prefix"),
      fetch("https://mobileserverdev.calvaryftl.org/api/Suffix"),
      fetch("https://mobileserverdev.calvaryftl.org/api/MaritalStatus"),
    ]);

    const [GenderData, PrefixData, SuffixData, MaritalStatusData] = await Promise.all([
      genderRes.json(),
      prefixRes.json(),
      suffixRes.json(),
      maritalStatusRes.json(),
    ]);

    console.log("Gender:", GenderData);
    console.log("Prefix:", PrefixData);
    console.log("Suffix:", SuffixData);
    console.log("Marital Status:", MaritalStatusData);

    prefixData = PrefixData.map(p => ({
      id: p.Prefix_ID,
      name: p.Prefix
    }));

    suffixData = SuffixData.map(s => ({
      id: s.Suffix_ID,
      name: s.Suffix
    }));

    maritalStatusData = MaritalStatusData.map(m => ({
      id: m.Marital_Status_ID,
      name: m.Marital_Status
    }));

    createCustomDropdown({
        dropdownId: "Prefix",
        buttonId: "prefixBtn",
        listId: "prefixList",
        data: prefixData,
        selectedItem: selectedPrefix,
        onSelect: (value) => {
            selectedPrefix = value;
            // mark as changed if different from original profile
            const newId = value?.id ?? null;
            if (originalProfile && (newId != originalProfile.Prefix_ID)) hasChanges = true;
            else hasChanges = false;
        }
    });

    createCustomDropdown({
        dropdownId: "Suffix",
        buttonId: "suffixBtn",
        listId: "suffixList",
        data: suffixData,
        selectedItem: selectedSuffix,
        onSelect: (value) => {
            selectedSuffix = value;
            const newId = value?.id ?? null;
            if (originalProfile && (newId != originalProfile.Suffix_ID)) hasChanges = true;
            else hasChanges = false;
        }
    });

    createCustomDropdown({
        dropdownId: "maritalStatus",
        buttonId: "maritalStatusBtn",
        listId: "maritalStatusList",
        data: maritalStatusData,
        selectedItem: selectedMaritalStatus,
        onSelect: (value) => {
            selectedMaritalStatus = value;
            const newId = value?.id ?? null;
            if (originalProfile && (newId != originalProfile.Marital_Status_ID)) hasChanges = true;
            else hasChanges = false;
        }
    });

  } catch (err) {
    console.error("Error fetching data:", err);
  }
}

async function updateProfile() {
  const token = localStorage.getItem("mpp-widgets_JwtToken");
  if (!token) return;

  let image = null;
  const payload = { Contact: originalProfile };

  if (profilePhoto.src.startsWith('blob:')) {
    const base64String = await fileToBase64(uploadedProfileFile);

    const FileName = uploadedProfileFile.name;
    const extension = FileName.split(".").pop().toLowerCase();

    let mimeType = "application/octet-stream";
    if (extension === "jpg" || extension === "jpeg") mimeType = "image/jpeg";
    else if (extension === "png") mimeType = "image/png";

    image = {
      FileName,
      MultipartData: base64String,
      ContentType: mimeType,
      DefaultImage: true,
    };
    console.log("file changes");
    
    hasChanges = true;
    payload.File = image;
  }
  if (profilePhoto.src.startsWith('data:')) {
    const FileName = `photo_${Date.now()}.png`;
    const [meta, base64String] = profileImageCamera.split(',');
    const mimeType = meta.match(/data:(.*);base64/)[1];
    const image = {
      FileName,
      MultipartData: base64String,
      ContentType: mimeType,
      DefaultImage: true,
    };
    console.log("file changes");
    
    hasChanges = true;
    payload.File = image;
  }

  const fields = [
    { input: firstNameInput, key: 'First_Name' },
    { input: lastNameInput, key: 'Last_Name' },
    { input: middleNameInput, key: 'Middle_Name' },
    { input: preferredNameInput, key: 'Nickname' },
    { input: emailAddress, key: 'Email_Address' },
    { input: phoneNumber, key: 'Mobile_Phone' },
  ];
  
  const additionalFields = [
    { input: selectedPrefix, key: "Prefix_ID" },
    { input: selectedSuffix, key: "Suffix_ID" },
    { input: selectedMaritalStatus, key: "Marital_Status_ID" }
  ];

  additionalFields.forEach(({ input, key }) => {
    // if (!input) return;
    const newValue = input?.id;
    const oldValue = originalProfile?.[key];

    console.log(newValue, typeof(newValue));
    console.log(oldValue, typeof(oldValue));

    if (newValue != oldValue ) {
      payload.Contact[key] = newValue;
      hasChanges = true;
      console.log("input changed", input);
      
    }
  });

  fields.forEach(({ input, key }) => {
    const newValue = (input?.value || '').trim();
    const oldValue = (originalProfile?.[key] || '').trim();

    if (newValue !== oldValue) {
      payload.Contact[key] = newValue;
      hasChanges = true;
      console.log("select changed", input);
      
    }
  });

  const formattedBirthday = formatDateForPayload(birthdayInput.value);
  if (formattedBirthday !== originalProfile.Date_of_Birth) {
    payload.Contact.Date_of_Birth = formattedBirthday;
    hasChanges = true;    
  }

  const selectedGenderId = getSelectedGenderId();
  if (selectedGenderId && selectedGenderId !== originalProfile.Gender_ID) {
    payload.Contact.Gender_ID = selectedGenderId;
    hasChanges = true;    
  }

  console.log("PUT Payload:", payload, payload.Contact == originalProfile);

  if(!firstNameInput.value.trim() && window.getComputedStyle(inputErrorFirstName).display === 'none'){
    inputErrorFirstName.style.setProperty('display', 'flex', 'important');
    inputErrorFirstName.style.visibility = 'visible';
    document.querySelector('#inputErrorFirstName .errorText').textContent = 'First name is required.';
  }
  if(!lastNameInput.value.trim() && window.getComputedStyle(inputErrorLastName).display === 'none'){
    inputErrorLastName.style.setProperty('display', 'flex', 'important');
    inputErrorLastName.style.visibility = 'visible';
    document.querySelector('#inputErrorLastName .errorText').textContent = 'Last name is required.';
  }
  if(!lastNameInput.value.trim() || !firstNameInput.value.trim()) return;

  console.log("reached");
  if(!hasChanges){
    document.head.appendChild(style); // Add z-index style on popup trigger
    lockScroll();
    document.getElementById("noChangesDiv").style.display = "flex";
    return;
  }

  const saveBtn = document.getElementById("save");
  const saveLoader = document.querySelector("#save .fa-spinner");
  const btnContent = document.querySelector("#save .btn-text");
  saveBtn.disabled = true;
  saveLoader.style.display = "inline-block";
  btnContent.innerText = "";

  try{
    const response = await fetch("https://mobileserverdev.calvaryftl.org/api/My/Profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Update result:", result);

    if (response.ok){
      showMessage("success", "Your profile has been updated successfully!");
      saveBtn.disabled = false;
      saveLoader.style.display = "none";
      btnContent.innerText = "SAVE";
      hasChanges = false;
      loadProfile();
      console.log(document.querySelectorAll('#user-avatar-mbl img'));
      
      document.querySelectorAll('#user-avatar-mbl img').forEach((item)=>{
        console.log('reached', result.Web_Image_URL);
        item.src = result.Web_Image_URL;
      })
      document.querySelectorAll('#user-avatar img').forEach((item)=>{
        console.log('reached', result.Web_Image_URL);
        item.src = result.Web_Image_URL;
      })
    }
    else
      showMessage("error", "Something went wrong. Please try again later.");
      saveBtn.disabled = false;
      saveLoader.style.display = "none";
      btnContent.innerText = "SAVE";
  }catch(err){
    console.error("Error preparing payload:", err);
    showMessage("error", "Something went wrong. Please try again later.");
    saveBtn.disabled = false;
    saveLoader.style.display = "none";
    btnContent.innerText = "SAVE";
  }
}

async function handleVerification() {
  let value = phoneEmailInput.value.trim();

  // Start sending
  codeBtn.disabled = true;
  codeBtn.classList.add("button-loading");
  codeBtn.innerText = "SENDING...";
  inputErrorDiv.style.visibility = 'hidden';
  inputErrorDivText.innerText = "";
  phoneEmailInput.style.borderColor = "#D1D5DB";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/ProfileCode?isWeb=true",
      {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ Phone_Email: value }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.log(response);
      phoneEmailInput.style.borderColor = "#B91C1C";
      inputErrorDiv.style.visibility = 'visible';
      inputErrorDivText.innerText = text || "Login failed.";
      codeBtn.disabled = true;
      codeBtn.innerText = "SEND VERIFICATION CODE";
      codeBtn.classList.remove("button-loading");
      codeBtn.style.border = "1px solid white";
      codeBtn.style.color = "white";
    } else {
      // Success – show OTP section
      document.getElementById("otpSectionEP").style.display = "flex";
      timeoutDidnotReceiveMessage = setTimeout(showDidnotReceiveMessage, 10000);
      document.getElementById("verifyButton").disabled = true;
      document.getElementById("userValueDisplayEP").innerText = value;
      ph_email = value;
      document.getElementById("verificationForm").style.display = "none";
      // input.style.display = "none";
      // codeBtn.style.display = "none";
      inputErrorDiv.style.visibility = 'hidden';
      inputErrorDivText.innerText = "";

      // Focus OTP box
      const otpBox = document.querySelector(".otpInputBoxEP");
      if (otpBox) otpBox.focus();

      // Optional: Attach OTP listeners once
      // if (!window.otpListenersAttached) {
        if (typeof setupOtpListeners === "function") {
          setupOtpListeners();
        //   window.otpListenersAttached = true;
        // }
        }
      }
  } catch (err) {
    phoneEmailInput.style.borderColor = "#B91C1C";
    inputErrorDiv.style.visibility = 'visible';
    inputErrorDivText.innerText = "Something went wrong. Please try again.";
    codeBtn.disabled = true;
    codeBtn.innerText = "SEND VERIFICATION CODE";
    codeBtn.classList.remove("button-loading");
  }
}

async function resendOtp() {
  console.log("CALLING RESEND OTP", isResending);
  if (isResending) return; // Prevent multiple clicks
  const value = phoneEmailInput.value.trim();
  const resetCodeLink = document.getElementById("resetCodeLinkEP");
  const otpInputs = document.querySelectorAll(".otpInputBoxEP"); // Remove existing error message
  const oldErr = document.getElementById("otpErrorMessageEP");
  const verifyButton = document.getElementById("verifyButton");

  resetCodeLink.classList.add("link-loading");
  resetCodeLink.textContent = "Resending...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/ProfileCode",
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
         },
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
        otpSucess.id = "otpErrorMessageEP";
        otpSucess.style.fontSize = "14px";
        otpSucess.style.marginTop = "8px";
        otpSucess.style.color = "Green";
        otpSucess.style.fontFamily = "Poppins, sans-serif";
        otpSucess.style.visibility = "visible";
        otpSucess.innerText = "Verification code sent successfully!";
        otpSucess.classList.add("blink");
        document.getElementById("otpResendSectionEP").appendChild(otpSucess);

        setTimeout(() => {
          if (otpSucess) otpSucess.remove();
        }, 3000);
      }
      verifyButton.disabled = true;
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

async function verifyOtp() {
  const otpInputs = document.querySelectorAll(".otpInputBoxEP");
  const Phone_Email = document
    .getElementById("userValueDisplayEP")
    .innerText.trim();
  const Code = Array.from(otpInputs)
    .map((input) => input.value.trim())
    .join("");

  const verifyBtn = document.getElementById("verifyButton");

  // Reset previous error styles
  otpInputs.forEach((input) => (input.style.border = "2px solid white"));

  // Remove existing error message
  const oldErr = document.getElementById("otpErrorMessageEP");
  if (oldErr) oldErr.remove();

  // Show loading UI
  verifyBtn.disabled = true;
  verifyBtn.classList.add("button-loading");
  verifyBtn.innerText = "VERIFYING...";

  try {
    const response = await fetch(
      "https://mobileserverdev.calvaryftl.org/api/ProfileCode/Confirm",
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

    console.log("response", response);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;

    if (response.ok) {
      const data = await response.text();
      console.log("✅ OTP Verified:", data);

      $.magnificPopup.close();
      resetModalState();
      if (emailRegex.test(ph_email)) {
        emailAddress.value = ph_email;
        hasChanges = true;
      } else if (phoneRegex.test(ph_email)) {
        phoneNumber.value = ph_email;
        hasChanges = true;
      }
      else {
        hasChanges = false;
      }
    } else {
      // Error: invalid OTP
      otpInputs.forEach((input) => (input.style.border = "2px solid #B91C1C"));
      const exclamationSpan = document.createElement('span');
      exclamationSpan.classList.add('helperText');
      exclamationSpan.textContent = '!';
      const err = document.createElement("div");
      err.id = "otpErrorMessageEP";
      err.style.color = "#B91C1C";
      err.style.fontSize = "14px";
      err.style.marginTop = "8px";
      err.style.fontFamily = "Poppins, sans-serif";
      err.style.visibility = 'visible';
      const errorTextSpan = document.createElement('span');
      errorTextSpan.classList.add('errorText');
      errorTextSpan.innerText = "Invalid or expired code. Please try again.";
      document.getElementById("otpResendSectionEP").appendChild(err);
      document.getElementById("otpErrorMessageEP").appendChild(exclamationSpan);
      document.getElementById("otpErrorMessageEP").appendChild(errorTextSpan);
    }
  } catch (err) {
    alert("Something went wrong. Please try again.");
    console.error("❌ OTP verification failed:", err);
  }
  // Reset button
  verifyBtn.disabled = false;
  verifyBtn.classList.remove("button-loading");
  verifyBtn.innerText = "VERIFY";
}

let cancelCheck = false;
function handleBeforeUnload(event) {  
  if(cancelCheck) return;
  if(hasChanges){
    console.log("correct flow");
    // document.getElementById("unsavedChangesDiv").style.display = "flex";
    event.preventDefault();
    // event.returnValue = '';
  }
}

document.getElementById("save").addEventListener("click", updateProfile);
document.getElementById("cancel").addEventListener("click", ()=> {
  cancelCheck = true;
  history.back()
});

document.addEventListener("DOMContentLoaded", function () {
    loadProfile();  
    firstNameInput.addEventListener('input', () => {
      // Show required error when empty (validateName hides on empty)
      if (!firstNameInput.value.trim()) {
        const errorText = document.querySelector('#inputErrorFirstName .errorText');
        inputErrorFirstName.style.setProperty('display', 'flex', 'important');
        errorText.textContent = 'First name is required.';
        inputErrorFirstName.style.visibility = 'visible';
        firstNameInput.style.borderColor = "#B91C1C";
        document.getElementById("save").disabled = true;
      } else if(firstNameInput.value.length === 25){
        const errorText = document.querySelector('#inputErrorFirstName .errorText');
        inputErrorFirstName.style.setProperty('display', 'flex', 'important');
        errorText.textContent = 'You’ve reached the 25-character limit';
        inputErrorFirstName.style.visibility = 'visible';
      } else{
        const errorText = document.querySelector('#inputErrorFirstName .errorText');
        inputErrorFirstName.style.removeProperty('display');
        errorText.textContent = '';
        inputErrorFirstName.style.visibility = 'hidden';
        firstNameInput.style.borderColor = "";
        document.getElementById("save").disabled = false;
      }

      if (originalProfile && (originalProfile.First_Name || '') !== firstNameInput.value.trim()) {
        hasChanges = true;
      } else {
        hasChanges = false;
      }
    });
    
    lastNameInput.addEventListener('input', () => {
      // Show required error when empty
      if (!lastNameInput.value.trim()) {
        const errorText = document.querySelector('#inputErrorLastName .errorText');
        inputErrorLastName.style.setProperty('display', 'flex', 'important');
        errorText.textContent = 'Last name is required.';
        inputErrorLastName.style.visibility= 'visible';
        lastNameInput.style.borderColor = "#B91C1C";
        document.getElementById("save").disabled = true;
      } else if(lastNameInput.value.length === 25){
        const errorText = document.querySelector('#inputErrorLastName .errorText');
        inputErrorLastName.style.setProperty('display', 'flex', 'important');
        errorText.textContent = 'You’ve reached the 25-character limit';
        inputErrorLastName.style.visibility = 'visible';
      } else{
        const errorText = document.querySelector('#inputErrorLastName .errorText');
        inputErrorLastName.style.removeProperty('display');
        errorText.textContent = '';
        inputErrorLastName.style.visibility = 'hidden';
        lastNameInput.style.borderColor = "";
        document.getElementById("save").disabled = false;
      }
      if (originalProfile && (originalProfile.Last_Name || '') !== lastNameInput.value.trim()) {
        hasChanges = true;
      } else {
        hasChanges = false;
      }
    });
    
    if (middleNameInput) {
      middleNameInput.addEventListener('input', () => {
        // enforce allowed characters and 25-char limit
        validateName('middleNameInput', 'inputErrorMiddleName', 25);
        if (originalProfile && (originalProfile.Middle_Name || '') !== middleNameInput.value.trim()) {
          hasChanges = true;
        } else {
          hasChanges = false;
        }
      });
    }

    if (preferredNameInput) {
      preferredNameInput.addEventListener('input', () => {
        validateName('preferredNameInput', 'inputErrorPreferredName', 25);
        if (originalProfile && (originalProfile.Nickname || '') !== preferredNameInput.value.trim()) {
          hasChanges = true;
        } else {
          hasChanges = false;
        }
      });
    }
    // Birthday change/input should mark unsaved changes when different from original
    if (birthdayInput) {
      const _birthdayChanged = () => {
        const val = (birthdayInput.value || '').trim();
        let formatted = '';
        if (val)
        formatted = formatDateForPayload(val); 
          if (originalProfile && ((originalProfile.Date_of_Birth || '') != formatted)){
            hasChanges = true;
          }
          else {
            hasChanges = false;
          }
      };
      birthdayInput.addEventListener('change', _birthdayChanged);
      birthdayInput.addEventListener('input', _birthdayChanged);
    }

    const genderRadios = document.querySelectorAll('input[name="gender"]');
    if (genderRadios && genderRadios.length) {
      genderRadios.forEach(r => r.addEventListener('change', () => {
        const selected = getSelectedGenderId();
            if (originalProfile && (selected !== originalProfile.Gender_ID)) hasChanges = true;
            else hasChanges = false;
      }));
    }
});

window.addEventListener('resize', () => updateName(nickNameVar));

window.addEventListener('beforeunload', handleBeforeUnload);

const isMobile = (() => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (/android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return true;
  if (/iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return true;
  return false;
})();

const cameraLabel = document.querySelector('.camera-icon');
if (isMobile) {
  const input = document.createElement('input');
  input.type = "file";
  input.id = "fileInput";
  input.accept = "image/*";
  input.style.display = 'none';
  cameraLabel.appendChild(input);
} else {
  cameraLabel.id = "cameraModal";
}
const fileInput = document.getElementById('fileInput');
// Watch for file uploads
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  let finalFile = file;
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > 1) {
    console.log(`⚠️ Image too large (${sizeMB.toFixed(2)} MB) — compressing...`);
    finalFile = await compressImage(file, 1024, 0.7);
    const compressedSize = (finalFile.size / 1024 / 1024).toFixed(2);
    console.log(`✅ Compressed to ${compressedSize} MB`);
  } else {
    console.log(`✅ Image OK (${sizeMB.toFixed(2)} MB)`);
  }

  uploadedProfileFile = finalFile;
  hasChanges = true;
  // Remove initials if any
  const initialsDiv = profileContainer.querySelector('.initials-avatar');
  if (initialsDiv) initialsDiv.remove();

  const imageURL = URL.createObjectURL(finalFile);
  profilePhoto.src = imageURL;
  profilePhoto.style.display = "block";

  profilePhoto.onload = () => URL.revokeObjectURL(imageURL);
  $.magnificPopup.close();
});

const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const retakeBtn = document.getElementById('retakePhoto');
const usePhotoBtn = document.getElementById('usePhoto');
const canvas = document.getElementById('canvas');
const photoPreview = document.getElementById('photoPreview');
const ctx = canvas.getContext('2d');
let stream = null;

async function startCamera (){
  try {
    stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
    document.getElementById('video').srcObject = stream;
    document.getElementById('videoDiv').style.display = 'flex';
    const cameraErrorDiv = document.getElementById('errorCameraDiv');
    if(cameraErrorDiv) cameraErrorDiv.style.display = 'none';
  } catch (error) {
    console.log(error);
    handleCameraError(error);
    return;
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
    video.srcObject = null;
    console.log('Camera stopped');
  }
}

function handleCameraError(error){
  console.error("Camera Error:", error);

  const messageEl = document.createElement('div');
  messageEl.id = 'errorCameraDiv'
  messageEl.style = `
    color: #c00;
    padding: 12px 16px;
    margin-top: 10px;
    border-radius: 6px;
    font-weight: 600;
    margin: 30px;
  `;

  switch (error.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      messageEl.textContent = '🚫 Camera access denied. Please allow permission in your browser settings.';
      break;
    case 'NotFoundError':
    case 'OverconstrainedError':
      messageEl.textContent = '❌ No camera device found. Please connect a camera and try again.';
      break;
    case 'NotReadableError':
      messageEl.textContent = '⚠️ Camera is already in use by another app.';
      break;
    default:
      messageEl.textContent = '⚠️ Unable to access the camera. Please try again.';
  }

  document.getElementById('photoModal').appendChild(messageEl);
  document.getElementById('videoDiv').style.display = 'none';
}

document.getElementById('openCamera').addEventListener('click', async function(){
  await startCamera();
  document.getElementById('selectPhotoOption').style.display = 'none';
  document.getElementById('photoModal').style.display = 'block';
})

takePhotoBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 1.0));
  const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });

  console.log('Original size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

  let finalFile = file;
  if (file.size > 1 * 1024 * 1024) {
    console.log('⚠️ Compressing photo...');
    finalFile = await compressImage(file, 1024, 0.7);
  }
  photoPreview.src = URL.createObjectURL(finalFile);
  // const imageDataUrl = canvas.toDataURL('image/png');
  // photoPreview.src = imageDataUrl;
  photoPreview.style.display = 'block';
  video.style.display = 'none';

  takePhotoBtn.style.display = 'none';
  retakeBtn.style.display = 'inline-block';
  usePhotoBtn.style.display = 'inline-block';

  stopCamera();
});


retakeBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  photoPreview.style.display = 'none';
  video.style.display = 'block';
  takePhotoBtn.style.display = 'inline-block';
  retakeBtn.style.display = 'none';
  usePhotoBtn.style.display = 'none';

  await startCamera();
});

usePhotoBtn.addEventListener('click', () => {
  const finalImage = photoPreview.src;
  profilePhoto.src = finalImage;

  hasChanges = true;

  console.log('✅ Photo confirmed!');
  console.log('Image data URL:', finalImage);
  profileImageCamera = finalImage;

  photoPreview.style.display = 'block';
  retakeBtn.style.display = 'none';
  usePhotoBtn.style.display = 'none';
  $.magnificPopup.close();
});

function compressImage(file, maxWidth = 1024, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject('Compression failed.');
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = (err) => reject(err);
  });
}
