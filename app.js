document.addEventListener("DOMContentLoaded", () => {

  let isUnlocked = false;

  try {
    isUnlocked = localStorage.getItem("unlocked") === "paid";
  } catch (e) {
    console.error("localStorage error:", e);
  }

  const status = document.getElementById("status");

  // Always ensure certs exist and are visible
  const certs = document.querySelectorAll(".cert");

  certs.forEach(el => {
    if (isUnlocked) {
      el.classList.remove("locked");
    } else {
      el.classList.add("locked");
    }

    // safety: never fully hide UI due to CSS issues
    el.style.display = "block";
  });

  // Safe status update (prevents null crash)
  if (status) {
    if (isUnlocked) {
      status.textContent = "Access: UNLOCKED";
      status.style.color = "#0F0";
    } else {
      status.textContent = "Access: LOCKED";
      status.style.color = "#F00";
    }
  }

  // Debug helper (remove later if you want)
  console.log("Unlock state:", isUnlocked);

});
