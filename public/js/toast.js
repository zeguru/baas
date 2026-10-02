// Non-blocking notifications (Bootstrap 5 toasts) used in place of alert()
// type: "success" | "danger" | "warning" | "info"
function showToast(message, type = "info", delay = 3000) {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${type} border-0`;
  toastEl.setAttribute("role", type === "danger" ? "alert" : "status");
  toastEl.setAttribute("aria-live", type === "danger" ? "assertive" : "polite");
  toastEl.setAttribute("aria-atomic", "true");

  const wrapper = document.createElement("div");
  wrapper.className = "d-flex";

  const body = document.createElement("div");
  body.className = "toast-body";
  body.style.whiteSpace = "pre-line";
  body.textContent = message;   // textContent: rule messages are user input

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = `btn-close ${type === "warning" ? "" : "btn-close-white"} me-2 m-auto`;
  closeBtn.setAttribute("data-bs-dismiss", "toast");
  closeBtn.setAttribute("aria-label", "Close");

  wrapper.append(body, closeBtn);
  toastEl.appendChild(wrapper);
  container.appendChild(toastEl);

  toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
  bootstrap.Toast.getOrCreateInstance(toastEl, { delay }).show();
}
