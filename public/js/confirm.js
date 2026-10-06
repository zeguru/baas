// confirmDialog() replaces native confirm() with a Bootstrap 5 modal.
let pendingConfirmResolve = null;

function confirmDialog({
  title = "Please confirm",
  message = "Are you sure?",
  okText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
} = {}) {
  const modalEl = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmModalTitle");
  const msgEl = document.getElementById("confirmModalMessage");
  const okBtn = document.getElementById("confirmOkBtn");
  const cancelBtn = document.getElementById("confirmCancelBtn");

  if (!modalEl || !window.bootstrap || !bootstrap.Modal) {
    return Promise.resolve(false);
  }

  if (pendingConfirmResolve) {
    pendingConfirmResolve(false);
    pendingConfirmResolve = null;
  }

  titleEl.textContent = title;
  msgEl.textContent = message;
  okBtn.textContent = okText;
  cancelBtn.textContent = cancelText;
  okBtn.className = `btn btn-${variant}`;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
    backdrop: true,
    keyboard: true,
    focus: true,
  });

  return new Promise((resolve) => {
    pendingConfirmResolve = resolve;
    let confirmed = false;

    okBtn.onclick = () => {
      confirmed = true;
      modal.hide();
    };
    modalEl.addEventListener(
      "hidden.bs.modal",
      () => {
        pendingConfirmResolve = null;
        resolve(confirmed);
      },
      { once: true },
    );
    modalEl.addEventListener(
      "shown.bs.modal",
      () => {
        (variant === "danger" ? cancelBtn : okBtn).focus();
      },
      { once: true },
    );
    modal.show();
  });
}

function confirmWarning({ title, message, okText }) {
  return confirmDialog({ title, message, okText, variant: "warning" });
}
