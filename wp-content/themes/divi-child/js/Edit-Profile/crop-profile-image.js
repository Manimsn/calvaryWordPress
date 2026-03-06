(function (window) {
  const state = {
    cropperInstance: null,
    currentImageURL: null,
    currentCropFile: null,
    initialized: false,
    options: {},
  };

  function bindEventOnce(element, eventName, handler, key) {
    if (!element) return;
    const attr = `bound${key}`;
    if (element.dataset[attr] === "true") return;
    element.addEventListener(eventName, handler);
    element.dataset[attr] = "true";
  }

  function getModalElements() {
    return {
      cropModal: document.getElementById("cropModal"),
      imageToCrop: document.getElementById("imageToCrop"),
      rotateBtn: document.getElementById("rotateBtn"),
      zoomSlider: document.getElementById("zoomSlider"),
      cropApply: document.getElementById("cropApply"),
      cropCancel: document.getElementById("cropCancel"),
      cropCloseBtn: document.getElementById("cropCloseBtn"),
    };
  }

  function ensureModalEvents() {
    const {
      cropModal,
      rotateBtn,
      zoomSlider,
      cropApply,
      cropCancel,
      cropCloseBtn,
    } = getModalElements();

    bindEventOnce(rotateBtn, "click", function () {
      if (state.cropperInstance) {
        state.cropperInstance.rotate(90);
      }
    }, "Rotate");

    bindEventOnce(zoomSlider, "input", function (e) {
      if (!state.cropperInstance) return;
      const value = parseFloat(e.target.value);
      state.cropperInstance.zoomTo(value);
    }, "Zoom");

    bindEventOnce(cropApply, "click", apply, "Apply");
    bindEventOnce(cropCancel, "click", close, "Cancel");
    bindEventOnce(cropCloseBtn, "click", close, "Close");

    bindEventOnce(cropModal, "click", function (e) {
      if (e.target && e.target.id === "cropModal") {
        close();
      }
    }, "Overlay");
  }

  function init(options) {
    state.options = options || {};
    ensureModalEvents();
    state.initialized = true;
  }

  function open(imageFile) {
    if (!imageFile) return;

    const { cropModal, imageToCrop } = getModalElements();

    if (!cropModal) {
      console.error("Crop modal element not found in DOM!");
      if (typeof state.options.onError === "function") {
        state.options.onError("Crop modal not found. Please ensure the modal HTML is added to your page.");
      }
      return;
    }

    if (!imageToCrop) {
      console.error("Image to crop element not found!");
      return;
    }

    state.currentCropFile = imageFile;
    state.currentImageURL = URL.createObjectURL(imageFile);
    imageToCrop.src = state.currentImageURL;
    cropModal.style.display = "flex";

    ensureModalEvents();

    imageToCrop.onload = function () {
      if (state.cropperInstance) {
        state.cropperInstance.destroy();
      }

      state.cropperInstance = new Cropper(imageToCrop, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: "move",
        autoCropArea: 0.65,
        restore: false,
        guides: false,
        center: true,
        highlight: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        toggleDragModeOnDblclick: false,
        minContainerWidth: 300,
        minContainerHeight: 300,
        background: false,
        zoomOnWheel: false,
        ready: function () {
          const imageData = this.cropper.getImageData();
          const containerData = this.cropper.getContainerData();
          const minZoom = Math.max(
            containerData.width / imageData.naturalWidth,
            containerData.height / imageData.naturalHeight
          );
          const zoomSlider = document.getElementById("zoomSlider");
          if (zoomSlider) {
            zoomSlider.min = minZoom;
            zoomSlider.max = minZoom * 3;
            zoomSlider.value = minZoom;
            zoomSlider.step = 0.01;
          }
        },
      });
    };
  }

  function close() {
    const { cropModal, imageToCrop } = getModalElements();

    if (state.cropperInstance) {
      state.cropperInstance.destroy();
      state.cropperInstance = null;
    }

    if (state.currentImageURL) {
      URL.revokeObjectURL(state.currentImageURL);
      state.currentImageURL = null;
    }

    if (imageToCrop) {
      imageToCrop.src = "";
    }

    if (cropModal) {
      cropModal.style.display = "none";
    }

    state.currentCropFile = null;
  }

  async function apply() {
    if (!state.cropperInstance) return;

    const croppedCanvas = state.cropperInstance.getCroppedCanvas({
      width: 800,
      height: 800,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    if (!croppedCanvas) {
      console.error("Failed to get cropped canvas");
      return;
    }

    croppedCanvas.toBlob(async function (blob) {
      if (!blob) {
        console.error("Failed to create blob from canvas");
        return;
      }

      const croppedFile = new File([blob], "profile-photo.jpg", {
        type: "image/jpeg",
      });

      let finalFile = croppedFile;
      if (croppedFile.size > 1 * 1024 * 1024 && typeof state.options.compressImage === "function") {
        finalFile = await state.options.compressImage(croppedFile, 1024, 0.7);
      }

      if (typeof state.options.onApply === "function") {
        state.options.onApply(finalFile);
      }

      close();

      if (typeof state.options.afterClose === "function") {
        state.options.afterClose();
      }
    }, "image/jpeg", 0.9);
  }

  window.ProfileCrop = {
    init,
    open,
    close,
    apply,
  };
})(window);
