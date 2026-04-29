document.addEventListener("DOMContentLoaded", () => {
  let isUnlocked = false;
  try {
    isUnlocked = localStorage.getItem("unlocked") === "paid";
  } catch (e) {
    console.error("localStorage error:", e);
  }

  const status = document.getElementById("status");

  // FIXED: separate querySelectorAll from forEach so certs is usable
  const certs = document.querySelectorAll(".cert-icon");
  certs.forEach(el => {
    if (isUnlocked) {
      el.classList.remove("locked");
    } else {
      el.classList.add("locked");
    }
    el.style.display = "block"; // FIXED: removed broken markdown link syntax
  });

  if (status) {
    if (isUnlocked) {
      status.textContent = "Access: UNLOCKED";
      status.style.color = "#0F0"; // FIXED
    } else {
      status.textContent = "Access: LOCKED";
      status.style.color = "#F00"; // FIXED
    }
  }

  console.log("Unlock state:", isUnlocked);
});
