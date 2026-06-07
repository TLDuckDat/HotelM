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

    function currentLang() {
        return (window.getLang ? window.getLang() : window.localStorage.getItem("sot_lang")) || "en";
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
        const fields = ['profile-name', 'profile-phone'];

        fields.forEach(id => {
            const el = document.getElementById(id);
            el.setAttribute('contenteditable', 'true');
            el.style.borderBottom = '1px dashed var(--primary-color)';
            el.style.padding = '2px 4px';
        });

        // Focus vào ô đầu tiên
        document.getElementById('profile-name').focus();

        // Đổi nút Edit thành nút Confirm
        const editBtn = document.getElementById('btn-edit-profile');
        editBtn.innerHTML = '<i class="fas fa-check"></i> ' + (currentLang() === 'vi' ? 'Lưu Thay Đổi' : 'Save Changes');
        editBtn.style.background = '#27ae60'; // Màu xanh lá
        editBtn.onclick = saveProfileChanges;
    };

    // 2. Lưu thay đổi
    window.saveProfileChanges = function () {
        const fields = ['profile-name', 'profile-phone'];

        const nameVal = document.getElementById('profile-name').textContent.trim();
        const phoneVal = document.getElementById('profile-phone').textContent.trim();

        if (!nameVal) {
            alert(currentLang() === 'vi' ? "Tên không được để trống." : "Name cannot be empty.");
            return;
        }

        if (nameVal.length < 2) {
            alert(currentLang() === 'vi' ? "Tên phải chứa ít nhất 2 ký tự." : "Name must contain at least 2 characters.");
            return;
        }

        if (!phoneVal || phoneVal.length < 8) {
            alert(currentLang() === 'vi' ? "Số điện thoại không hợp lệ." : "Invalid phone number.");
            return;
        }

        // Tắt chế độ chỉnh sửa
        fields.forEach(id => {
            const el = document.getElementById(id);
            el.setAttribute('contenteditable', 'false');
            el.style.borderBottom = 'none';
            el.style.padding = '0';
        });

        // Khôi phục nút bấm về trạng thái ban đầu
        const editBtn = document.getElementById('btn-edit-profile');
        editBtn.innerHTML = '<i class="fas fa-user-edit"></i> ' + (currentLang() === 'vi' ? 'Chỉnh Sửa Hồ Sơ' : 'Edit Profile Information');
        editBtn.style.background = '';
        editBtn.onclick = enableEditMode;

        // Cập nhật
        const user = global.AuthStore.getCurrentUser();
        if (user) {
            user.fullName = nameVal;
            user.phoneNumber = phoneVal;
            global.AuthStore.setCurrentUser(user);
            
            if (window.UserApi && window.UserApi.updateUser) {
                window.UserApi.updateUser(user.userId || user.userID || user.id, {
                    fullName: nameVal,
                    phoneNumber: phoneVal
                }).catch(err => console.error("Update profile error:", err));
            }
        }
        
        loadProfile();
        alert(currentLang() === 'vi' ? "Thành công! Hồ sơ của bạn đã được cập nhật." : "Success! Your profile information has been updated.");
    };
})(window);