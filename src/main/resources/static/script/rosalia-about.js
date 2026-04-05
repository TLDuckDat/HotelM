document.addEventListener("DOMContentLoaded", function() {
    var toggle = document.getElementById("menuToggle");
    var nav = document.getElementById("mobileNav");
    toggle.addEventListener("click", function() {
        var open = nav.style.display === "flex";
        nav.style.display = open ? "none" : "flex";
        toggle.innerHTML = open ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
    });

    var form = document.getElementById("newsletter-form");
    if (form) {
        form.addEventListener("submit", function(e) {
            e.preventDefault();
            alert("Subscription Successful! Thank you for joining us.");
            form.reset();
        });
    }
});
