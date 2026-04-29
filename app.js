document.addEventListener("DOMContentLoaded", () => {

  const isUnlocked = localStorage.getItem("unlocked") === "paid";

  const status = document.getElementById("status");

  if (isUnlocked) {
    status.textContent = "Access: UNLOCKED";
    status.style.color = "#0F0";

    document.querySelectorAll(".cert").forEach(el => {
      el.classList.remove("locked");
    });

  } else {
    status.textContent = "Access: LOCKED";
    status.style.color = "#F00";

    document.querySelectorAll(".cert").forEach(el => {
      el.classList.add("locked");
    });
  }

});
