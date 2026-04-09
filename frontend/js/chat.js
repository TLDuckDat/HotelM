// ===== CHAT UI SCRIPT =====
document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("chat-toggle");
    const box = document.getElementById("chat-box");
    const closeBtn = document.getElementById("chat-close");

    toggle.addEventListener("click", () => {
        box.style.display = "flex";
        toggle.style.display = "none";
    });

    closeBtn.addEventListener("click", () => {
        box.style.display = "none";
        toggle.style.display = "flex";
    });
});