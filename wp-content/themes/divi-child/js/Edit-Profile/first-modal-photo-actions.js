(function (window, document) {
  const state = {
    stream: null,
    initialized: false,
    options: {},
  };

  function isIOSDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return true;
    if (/iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return true;
    return false;
  }

  function isMobileDevice() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return isAndroid || isIOS;
  }

  function isUnsupportedImageFormat(file) {
    if (!file) return false;

    const fileName = (file.name || "").toLowerCase();
    const mimeType = (file.type || "").toLowerCase();

    const unsupportedExtensions = [".tif", ".tiff", ".heif", ".heic", ".hvif"];
    const unsupportedMimeHints = ["tif", "tiff", "heif", "heic", "hvif"];

    const hasUnsupportedExtension = unsupportedExtensions.some((ext) => fileName.endsWith(ext));
    const hasUnsupportedMime = unsupportedMimeHints.some((hint) => mimeType.includes(hint));

    return hasUnsupportedExtension || hasUnsupportedMime;
  }

  function alertUnsupportedImageFormat() {
    alert("TIFF and HVIF image formats are unsupported. Please upload JPG, PNG, or WEBP.");
  }

  function withOpenCropModal(file) {
    if (typeof state.options.openCropModal === "function") {
      state.options.openCropModal(file);
    }
  }

  function withShowMessage(type, message) {
    if (typeof state.options.showMessage === "function") {
      state.options.showMessage(type, message);
    }
  }

  async function startCamera() {
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const video = document.getElementById("video");
      if (video) {
        video.srcObject = state.stream;
      }
      const videoDiv = document.getElementById("videoDiv");
      if (videoDiv) {
        videoDiv.style.display = "flex";
      }
      const cameraErrorDiv = document.getElementById("errorCameraDiv");
      if (cameraErrorDiv) {
        cameraErrorDiv.style.display = "none";
      }
    } catch (error) {
      console.log(error);
      handleCameraError(error);
    }
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
      state.stream = null;
      const video = document.getElementById("video");
      if (video) {
        video.srcObject = null;
      }
      console.log("Camera stopped");
    }
  }

  function handleCameraError(error) {
    console.error("Camera Error:", error);

    const messageEl = document.createElement("div");
    messageEl.id = "errorCameraDiv";
    messageEl.style = `
      color: #c00;
      padding: 12px 16px;
      margin-top: 10px;
      border-radius: 6px;
      font-weight: 600;
      margin: 30px;
    `;

    switch (error.name) {
      case "NotAllowedError":
      case "SecurityError":
        messageEl.textContent = "Camera access denied. Please allow permission in your browser settings.";
        break;
      case "NotFoundError":
      case "OverconstrainedError":
        messageEl.textContent = "No camera device found. Please connect a camera and try again.";
        break;
      case "NotReadableError":
        messageEl.textContent = "Camera is already in use by another app.";
        break;
      default:
        messageEl.textContent = "Unable to access the camera. Please try again.";
    }

    const photoModal = document.getElementById("photoModal");
    if (photoModal) {
      photoModal.appendChild(messageEl);
    }

    const videoDiv = document.getElementById("videoDiv");
    if (videoDiv) {
      videoDiv.style.display = "none";
    }
  }

  function bindCameraTrigger() {
    const cameraLabel = document.querySelector(".camera-icon");
    if (!cameraLabel) return;

    cameraLabel.id = "cameraModal";

    if (isIOSDevice()) {
      cameraLabel.style.touchAction = "manipulation";
      cameraLabel.style.webkitTapHighlightColor = "transparent";

      if (!cameraLabel.dataset.iosPopupFallbackBound) {
        cameraLabel.addEventListener(
          "touchend",
          function (event) {
            if (event.cancelable) event.preventDefault();
            cameraLabel.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
          },
          { passive: false }
        );
        cameraLabel.dataset.iosPopupFallbackBound = "1";
      }
    }

    const fileInput = document.getElementById("fileInput");
    if (!fileInput || fileInput.dataset.firstModalBound) return;

    fileInput.addEventListener("change", async function (event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      if (isUnsupportedImageFormat(file)) {
        alertUnsupportedImageFormat();
        event.target.value = "";
        return;
      }

      if (!file.type.startsWith("image/")) {
        withShowMessage("error", "Please upload an image.");
        event.target.value = "";
        if (typeof $.magnificPopup !== "undefined") {
          $.magnificPopup.close();
        }
        return;
      }

      if (typeof $.magnificPopup !== "undefined") {
        $.magnificPopup.close();
      }

      setTimeout(function () {
        withOpenCropModal(file);
      }, 100);

      event.target.value = "";
    });

    fileInput.dataset.firstModalBound = "1";
  }

  function bindUploadImageHandler() {
    if (state.uploadImageBound) return;

    document.addEventListener("click", function (event) {
      const uploadButton = event.target && event.target.closest ? event.target.closest("#uploadImage") : null;
      if (!uploadButton) return;

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";

      fileInput.addEventListener("change", function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (isUnsupportedImageFormat(file)) {
          alertUnsupportedImageFormat();
          e.target.value = "";
          return;
        }

        if (!file.type.startsWith("image/")) {
          withShowMessage("error", "Please upload an image.");
          return;
        }

        if (typeof $.magnificPopup !== "undefined") {
          $.magnificPopup.close();
        }

        setTimeout(function () {
          withOpenCropModal(file);
        }, 100);
      });

      fileInput.click();
    });

    state.uploadImageBound = true;
  }

  function bindOpenCameraHandler() {
    if (state.openCameraBound) return;

    document.addEventListener("click", async function (event) {
      const openCameraButton = event.target && event.target.closest ? event.target.closest("#openCamera") : null;
      if (!openCameraButton) return;

      if (isMobileDevice()) {
        const optionsDiv = document.getElementById("selectPhotoOption");
        if (!optionsDiv) return;

        const input = document.createElement("input");
        input.type = "file";
        input.id = "androidfileInput";
        input.accept = "image/*";
        input.style.display = "none";
        input.capture = "user";
        optionsDiv.appendChild(input);

        input.addEventListener("change", function (e) {
          const file = e.target.files && e.target.files[0];
          if (!file) return;

          if (isUnsupportedImageFormat(file)) {
            alertUnsupportedImageFormat();
            e.target.value = "";
            return;
          }

          if (!file.type.startsWith("image/")) {
            withShowMessage("error", "Please upload an image.");
            e.target.value = "";
            $.magnificPopup.close();
            return;
          }

          $.magnificPopup.close();

          setTimeout(function () {
            withOpenCropModal(file);
          }, 100);

          e.target.value = "";
        });

        input.click();
      } else {
        await startCamera();
        const selectPhotoOption = document.getElementById("selectPhotoOption");
        const photoModal = document.getElementById("photoModal");
        if (selectPhotoOption) selectPhotoOption.style.display = "none";
        if (photoModal) photoModal.style.display = "block";
      }
    });

    state.openCameraBound = true;
  }

  function bindCameraActionButtons() {
    if (state.cameraActionButtonsBound) return;

    document.addEventListener("click", async function (event) {
      const takePhotoBtn = event.target && event.target.closest ? event.target.closest("#takePhoto") : null;
      if (takePhotoBtn) {
        event.preventDefault();
        const video = document.getElementById("video");
        const canvas = document.getElementById("canvas");
        const photoPreview = document.getElementById("photoPreview");
        const retakeBtn = document.getElementById("retakePhoto");
        const usePhotoBtn = document.getElementById("usePhoto");

        if (!video || !canvas || !photoPreview) return;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL("image/png");
        photoPreview.src = imageDataUrl;
        photoPreview.style.display = "block";
        video.style.display = "none";

        takePhotoBtn.style.display = "none";
        if (retakeBtn) retakeBtn.style.display = "inline-block";
        if (usePhotoBtn) usePhotoBtn.style.display = "inline-block";

        stopCamera();
        return;
      }

      const retakeBtn = event.target && event.target.closest ? event.target.closest("#retakePhoto") : null;
      if (retakeBtn) {
        event.preventDefault();

        const photoPreview = document.getElementById("photoPreview");
        const video = document.getElementById("video");
        const takePhotoBtnEl = document.getElementById("takePhoto");
        const usePhotoBtn = document.getElementById("usePhoto");

        if (photoPreview) photoPreview.style.display = "none";
        if (video) video.style.display = "block";
        if (takePhotoBtnEl) takePhotoBtnEl.style.display = "inline-block";
        retakeBtn.style.display = "none";
        if (usePhotoBtn) usePhotoBtn.style.display = "none";

        await startCamera();
        return;
      }

      const usePhotoBtn = event.target && event.target.closest ? event.target.closest("#usePhoto") : null;
      if (usePhotoBtn) {
        const photoPreview = document.getElementById("photoPreview");
        const retakeBtnEl = document.getElementById("retakePhoto");
        const video = document.getElementById("video");
        const takePhotoBtnEl = document.getElementById("takePhoto");

        if (!photoPreview || !photoPreview.src) return;

        const response = await fetch(photoPreview.src);
        const blob = await response.blob();
        const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });

        photoPreview.style.display = "none";
        if (retakeBtnEl) retakeBtnEl.style.display = "none";
        usePhotoBtn.style.display = "none";
        if (video) video.style.display = "block";
        if (takePhotoBtnEl) takePhotoBtnEl.style.display = "inline-block";

        $.magnificPopup.close();

        setTimeout(function () {
          withOpenCropModal(file);
        }, 100);
      }
    });

    state.cameraActionButtonsBound = true;
  }

  function init(options) {
    state.options = options || {};
    bindCameraTrigger();
    bindUploadImageHandler();
    bindOpenCameraHandler();
    bindCameraActionButtons();
    state.initialized = true;
  }

  window.ProfileFirstModal = {
    init,
    stopCamera,
    isUnsupportedImageFormat,
    alertUnsupportedImageFormat,
  };
})(window, document);
