document.addEventListener("DOMContentLoaded", () => {
  let isUnlocked = false;
  try {
    isUnlocked = localStorage.getItem("unlocked") === "paid";
  } catch (e) {
    console.error("localStorage error:", e);
  }

  const status = document.getElementById("status");

  // FIXED:
  const certs = document.querySelectorAll(".cert");
  certs.forEach(el => {
    if (isUnlocked) {
      el.classList.remove("locked");
    } else {
      el.classList.add("locked");
    }
    el.style.display = "block"; // FIXED
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
