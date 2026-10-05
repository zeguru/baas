// Promise-based replacement for native confirm() using Bootstrap 5 modal.
// Usage: const ok = await confirmDialog({ title, message, okText, cancelText, variant });
//
// - message uses textContent (rule messages are user input, avoid XSS)
// - Esc / backdrop / Cancel resolves false, Confirm resolves true
// - variant: bootstrap color for OK button: "danger" | "warning" | "primary" | "secondary"
let _confirmResolve = null;

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

  // If modal/Bootstrap missing (e.g. CDN blocked), fail safe: cancel without blocking.
  // We deliberately avoid window.confirm() here so no native dialog remains.
  if (!modalEl || !window.bootstrap || !bootstrap.Modal) {
    console.warn("confirmDialog: Bootstrap modal unavailable, cancelling");
    return Promise.resolve(false);
  }

  // If a previous dialog is still pending, resolve it as cancelled.
  if (_confirmResolve) {
    const prev = _confirmResolve;
    _confirmResolve = null;
    prev(false);
  }

  titleEl.textContent = title;
  msgEl.textContent = message;
  okBtn.textContent = okText;
  cancelBtn.textContent = cancelText;
  okBtn.className = `btn btn-${variant}`;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value) => {
      if (settled) return;
      settled = true;
      _confirmResolve = null;
      modalEl.removeEventListener("hidden.bs.modal", onHidden);
      resolve(value);
    };
    const onHidden = () => settle(false);

    _confirmResolve = settle;

    okBtn.onclick = () => {
      modal.hide();
      settle(true);
    };
    // cancelBtn dismisses via data-bs-dismiss; hidden handler resolves false.
    modalEl.addEventListener("hidden.bs.modal", onHidden, { once: true });
    modal.show();
    // Move focus to Cancel first for destructive actions (safer), OK otherwise.
    (variant === "danger" ? cancelBtn : okBtn).focus();
  });
}
