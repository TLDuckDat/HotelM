function validate() {
        let valid = true;

        const fields = [
            { id: "fullName",    errId: "err-fullName",    check: v => v.trim().length > 0 },
            { id: "email",       errId: "err-email",       check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
            { id: "phoneNumber", errId: "err-phoneNumber", check: v => v.trim().length >= 9 },
            { id: "password",    errId: "err-password",    check: v => v.length >= 6 },
        ];

        fields.forEach(({ id, errId, check }) => {
            const input = document.getElementById(id);
            const err   = document.getElementById(errId);
            const ok    = check(input.value);
            input.classList.toggle("error-field", !ok);
            err.classList.toggle("show", !ok);
            if (!ok) valid = false;
        });

        return valid;
    }

function showToast(msg, type) {
        const el = document.getElementById("toast");
        el.textContent = msg;
        el.className = "toast " + type;
    }

async function submitForm() {
        // 1. Validate trước
        if (!validate()) return;

        // 2. Gom dữ liệu từ form thành object JSON
        const payload = {
            fullName:    document.getElementById("fullName").value.trim(),
            email:       document.getElementById("email").value.trim(),
            phoneNumber: document.getElementById("phoneNumber").value.trim(),
            password:    document.getElementById("password").value,
            role:        document.getElementById("role").value,
        };

        // 3. Gọi API skeleton đã chuẩn hóa
        const btn = document.getElementById("submitBtn");
        btn.classList.add("loading");
        btn.disabled = true;

        try {
            if (!window.UserApi || typeof window.UserApi.createUser !== "function") {
                throw new Error("UserApi is not loaded");
            }

            const data = await window.UserApi.createUser(payload);
            showToast("✅ Đăng ký thành công! Xin chào " + data.fullName, "success");
            document.querySelectorAll("input").forEach(i => i.value = "");

        } catch (err) {
            // Ưu tiên hiển thị message từ backend nếu có.
            const backendMessage = err && err.payload
                ? (typeof err.payload === "string" ? err.payload : (err.payload.message || err.payload.error))
                : null;
            showToast("❌ " + (backendMessage || "Không kết nối được server. Kiểm tra backend!"), "error");
        } finally {
            btn.classList.remove("loading");
            btn.disabled = false;
        }
    }

// Cho phép gọi từ HTML onclick.
window.submitForm = submitForm;

// Cho phép nhấn Enter để submit.
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        submitForm();
    }
});
