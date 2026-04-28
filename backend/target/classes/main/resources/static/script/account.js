// (function (global) {
//     "use strict";

//     function renderProfile() {
//         if (!global.Guard.requireLogin()) {
//             return;
//         }

//         global.AppShell.renderTopbar("Account");

//         var user = global.AuthStore.getCurrentUser();
//         document.getElementById("profile-name").textContent = user.fullName || "";
//         document.getElementById("profile-email").textContent = user.email || "";
//         document.getElementById("profile-phone").textContent = user.phoneNumber || "";
//         document.getElementById("profile-role").textContent = user.role || "";
//     }

//     document.addEventListener("DOMContentLoaded", renderProfile);
// })(window);

// (function (global) {
//     "use strict";

//     function renderProfile() {
//         if (!global.Guard.requireLogin()) {
//             return;
//         }

//         global.AppShell.renderTopbar("Account");

//         var user = global.AuthStore.getCurrentUser();
//         document.getElementById("profile-name").textContent = user.fullName || "";
//         document.getElementById("profile-email").textContent = user.email || "";
//         document.getElementById("profile-phone").textContent = user.phoneNumber || "";
//         document.getElementById("profile-role").textContent = user.role || "";
//     }

//     document.addEventListener("DOMContentLoaded", renderProfile);
// })(window);

(function (global) {
    "use strict";

    function loadProfile() {
        if (!global.Guard.requireLogin()) return;

        const user = global.AuthStore.getCurrentUser();
        if (!user) return;

        document.getElementById('topbar-username').textContent = user.fullName || 'Guest';
        document.getElementById('sidebar-username').textContent = user.fullName || 'Guest';
        document.getElementById('sidebar-role').textContent = user.role || 'USER';

        document.getElementById('profile-name').textContent = user.fullName || '';
        document.getElementById('profile-email').textContent = user.email || '';
        document.getElementById('profile-phone').textContent = user.phoneNumber || '';
        document.getElementById('profile-role').textContent = user.role || '';
    }

    // --- CHỨC NĂNG LOGOUT THÊM VÀO ---
    function handleLogout() {
        // Xóa dữ liệu user trong AuthStore
        if (global.AuthStore) {
            global.AuthStore.clearCurrentUser();
        }
        // Chuyển hướng về trang chủ index.html theo yêu cầu
        window.location.href = 'index.html';
    }

    // Sidebar mobile logic (giữ nguyên của bạn)
    window.toggleSidebar = function () {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay').classList.toggle('active');
    };

    window.closeSidebar = function () {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('active');
    };

    // Đưa hàm handleLogout ra toàn cục để HTML gọi được trực tiếp
    window.handleLogout = handleLogout;

    document.addEventListener('DOMContentLoaded', () => {
        loadProfile();
    });

    // Thêm hàm này vào file JS của bạn
    window.toggleNotification = function (e) {
        e.stopPropagation();
        const menu = document.getElementById("notificationMenu");
        // Đóng user menu nếu đang mở (để tránh chồng chéo)
        const userMenu = document.getElementById("userMenu");
        if (userMenu) userMenu.classList.remove("active");

        menu.classList.toggle("active");
    };

    // Click ra ngoài để đóng
    document.addEventListener("click", function (e) {
        const notiDropdown = document.querySelector(".notification-dropdown");
        if (notiDropdown && !notiDropdown.contains(e.target)) {
            const menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        }
    });

    // 1. Bật chế độ chỉnh sửa
    window.enableEditMode = function () {
        const fields = ['profile-name', 'profile-email', 'profile-phone'];

        fields.forEach(id => {
            const el = document.getElementById(id);
            el.setAttribute('contenteditable', 'true');
        });

        // Focus vào ô đầu tiên
        document.getElementById('profile-name').focus();

        // Đổi nút Edit thành nút Confirm (Tạm thời thay đổi giao diện Quick Action)
        const editBtn = document.getElementById('btn-edit-profile');
        editBtn.innerHTML = '<i class="fas fa-check"></i> Save Changes';
        editBtn.style.background = '#27ae60'; // Màu xanh lá
        editBtn.onclick = saveProfileChanges;

        // Thông báo nhẹ cho người dùng
        console.log("Edit mode enabled");
    };

    // 2. Lưu thay đổi (Giả lập)
    window.saveProfileChanges = function () {
        const fields = ['profile-name', 'profile-email', 'profile-phone'];

        // Tắt chế độ chỉnh sửa
        fields.forEach(id => {
            const el = document.getElementById(id);
            el.setAttribute('contenteditable', 'false');
        });

        // Khôi phục nút bấm về trạng thái ban đầu
        const editBtn = document.getElementById('btn-edit-profile');
        editBtn.innerHTML = '<i class="fas fa-user-edit"></i> Edit Profile Information';
        editBtn.style.background = ''; // Trình duyệt tự lấy lại màu từ class btn-primary
        editBtn.onclick = enableEditMode;

        // Hiển thị thông báo thành công (alert đơn giản hoặc bạn có thể dùng toast)
        alert("Success! Your profile information has been updated.");

        // Note: Vì là tĩnh nên nếu F5 trang web sẽ quay về dữ liệu cũ từ AuthStore
    };
})(window);