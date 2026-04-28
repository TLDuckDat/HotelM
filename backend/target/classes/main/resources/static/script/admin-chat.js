(function (global) {
    "use strict";

    var activeConvId = null;
    var threadsCache = [];
    var activeThreadSignature = "";
    var pollTimer = null;
    var sending = false;

    function getCurrentUser() {
        return global.AuthStore ? global.AuthStore.getCurrentUser() : null;
    }

    function getUserId(user) {
        return user ? (user.userID || user.userId || user.id || null) : null;
    }

    function setAuthToken() {
        var user = getCurrentUser();
        if (user && global.HotelMApiBase) {
            global.HotelMApiBase.setAuthToken(user.accessToken || user.token || null);
        }
    }

    function initials(name) {
        if (!name) return "?";
        return name.split(" ").map(function (word) { return word[0]; }).join("").toUpperCase().slice(0, 2);
    }

    function formatTime(ts) {
        var date = new Date(ts);
        var now = new Date();
        return date.toDateString() === now.toDateString()
            ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : date.toLocaleDateString([], { day: "2-digit", month: "short" });
    }

    function formatDateLabel(ts) {
        var date = new Date(ts);
        var now = new Date();
        if (date.toDateString() === now.toDateString()) return "Today";
        var yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString([], { weekday: "long", day: "2-digit", month: "short" });
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function sortMessages(messages) {
        return (messages || []).slice().sort(function (a, b) {
            return new Date(a.sentAt || 0) - new Date(b.sentAt || 0);
        });
    }

    function getGuestName(thread) {
        return thread.guestName || thread.guestUserName || thread.guestUserId || "Guest";
    }

    function getGuestAccount(thread) {
        return thread.guestEmail || thread.guestUserId || "";
    }

    function getThreadSignature(thread) {
        var messages = thread && thread.messages ? thread.messages : [];
        return messages.map(function (message) {
            return [message.id, message.senderUserId, message.sentAt].join("|");
        }).join(",");
    }

    function sortThreads(threads) {
        return (threads || []).slice().sort(function (a, b) {
            return new Date(b.lastMessageAt || b.createdAt || 0) - new Date(a.lastMessageAt || a.createdAt || 0);
        });
    }

    function updateSidebarBadge() {
        var badge = document.getElementById("sidebar-unread-badge");
        if (!badge) return;
        badge.style.display = threadsCache.length ? "flex" : "none";
        badge.textContent = threadsCache.length || "";
    }

    function renderConvList(filter) {
        var list = document.getElementById("conv-list");
        var empty = document.getElementById("conv-empty");
        var query = (filter || "").trim().toLowerCase();
        var threads = sortThreads(threadsCache).filter(function (thread) {
            return !query || getGuestName(thread).toLowerCase().indexOf(query) !== -1;
        });

        list.querySelectorAll(".conv-item").forEach(function (item) { item.remove(); });

        if (!threads.length) {
            empty.style.display = "flex";
            updateSidebarBadge();
            return;
        }

        empty.style.display = "none";
        threads.forEach(function (thread) {
            var lastMessage = thread.messages && thread.messages.length
                ? thread.messages[thread.messages.length - 1]
                : null;
            var preview = lastMessage ? lastMessage.content : "No messages yet";
            var subtitle = getGuestAccount(thread) || (preview.slice(0, 50) + (preview.length > 50 ? "..." : ""));
            var item = document.createElement("div");
            item.className = "conv-item" + (activeConvId === thread.id ? " active" : "");
            item.dataset.id = thread.id;
            item.innerHTML = ""
                + '<div class="conv-avatar">'
                + initials(getGuestName(thread))
                + '<span class="online-dot"></span>'
                + "</div>"
                + '<div class="conv-meta">'
                + '  <div class="conv-name">' + escHtml(getGuestName(thread)) + "</div>"
                + '  <div class="conv-preview">' + escHtml(subtitle) + "</div>"
                + "</div>"
                + '<div class="conv-time">' + (lastMessage ? formatTime(lastMessage.sentAt) : "") + "</div>";
            item.addEventListener("click", function () {
                openConversation(thread.id);
            });
            list.appendChild(item);
        });

        updateSidebarBadge();
    }

    function renderMessages(thread) {
        var container = document.getElementById("chat-messages");
        var currentUser = getCurrentUser();
        var currentUserId = getUserId(currentUser);
        var messages = sortMessages(thread && thread.messages ? thread.messages : []);
        var signature = getThreadSignature(thread);

        if (signature === activeThreadSignature) return;

        container.innerHTML = "";
        if (!messages.length) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:0.85rem;padding:40px 0;">No messages yet</div>';
            activeThreadSignature = signature;
            return;
        }

        var lastDateLabel = "";
        messages.forEach(function (msg) {
            var dateLabel = formatDateLabel(msg.sentAt);
            if (dateLabel !== lastDateLabel) {
                lastDateLabel = dateLabel;
                var divider = document.createElement("div");
                divider.className = "date-divider";
                divider.textContent = dateLabel;
                container.appendChild(divider);
            }

            var isAdmin = msg.senderUserId === currentUserId;
            var row = document.createElement("div");
            row.className = "msg-row" + (isAdmin ? " from-admin" : "");
            row.innerHTML = ""
                + '<div class="msg-avatar-sm">' + (isAdmin ? "AD" : initials(getGuestName(thread))) + "</div>"
                + '<div class="msg-group">'
                + '  <div class="msg-sender">' + escHtml(isAdmin ? "Ban" : getGuestName(thread)) + "</div>"
                + '  <div class="msg-bubble">' + escHtml(msg.content) + "</div>"
                + '  <div class="msg-time">' + formatTime(msg.sentAt) + "</div>"
                + "</div>";
            container.appendChild(row);
        });

        container.scrollTop = container.scrollHeight;
        activeThreadSignature = signature;
    }

    function renderActiveThread(thread) {
        if (!thread) return;
        document.getElementById("chat-header-avatar").textContent = initials(getGuestName(thread));
        document.getElementById("chat-header-name").textContent = getGuestName(thread);
        document.getElementById("chat-header-status").textContent = getGuestAccount(thread) || "Online";
        document.getElementById("chat-empty-state").style.display = "none";
        document.getElementById("chat-active").style.display = "flex";
        renderMessages(thread);
    }

    function loadThreads() {
        var user = getCurrentUser();
        var userId = getUserId(user);
        if (!userId) return Promise.resolve();

        setAuthToken();
        return global.ChatApi.getThreadsByUser(userId).then(function (threads) {
            threadsCache = sortThreads(threads || []);
            renderConvList(document.getElementById("conv-search-input").value);
            if (activeConvId) {
                return loadThread(activeConvId);
            }
        });
    }

    function loadThread(threadId) {
        if (!threadId) return Promise.resolve();
        return global.ChatApi.getThread(threadId).then(function (thread) {
            var idx = threadsCache.findIndex(function (item) { return item.id === thread.id; });
            if (idx >= 0) threadsCache[idx] = thread;
            activeConvId = thread.id;
            renderActiveThread(thread);
            renderConvList(document.getElementById("conv-search-input").value);
        });
    }

    function openConversation(id) {
        activeThreadSignature = "";
        loadThread(id);
        if (window.innerWidth <= 768) {
            document.getElementById("conv-pane").classList.add("hidden");
            document.getElementById("chat-pane").classList.remove("hidden");
        }
        document.getElementById("admin-reply-input").focus();
    }

    function sendAdminReply() {
        if (!activeConvId || sending) return;

        var user = getCurrentUser();
        var userId = getUserId(user);
        var input = document.getElementById("admin-reply-input");
        var text = input.value.trim();
        if (!userId || !text) return;

        sending = true;
        document.getElementById("send-btn").disabled = true;

        global.ChatApi.sendMessage({
            threadId: activeConvId,
            senderUserId: userId,
            senderRole: user.role || "ADMIN",
            content: text
        }).then(function () {
            input.value = "";
            input.style.height = "auto";
            activeThreadSignature = "";
            return loadThread(activeConvId).then(loadThreads);
        }).finally(function () {
            sending = false;
            document.getElementById("send-btn").disabled = false;
        });
    }

    function handleReplyKey(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendAdminReply();
        }
        var textarea = document.getElementById("admin-reply-input");
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }

    function resolveConversation() {
        alert("Chat is now backed by database data. If you want, I can add a real resolved status next.");
    }

    function deleteConversation() {
        alert("Delete conversation is not connected to backend yet.");
    }

    function showConvPane() {
        document.getElementById("conv-pane").classList.remove("hidden");
        document.getElementById("chat-pane").classList.add("hidden");
    }

    function toggleSidebar() {
        document.getElementById("sidebar").classList.toggle("open");
        document.getElementById("sidebar-overlay").classList.toggle("active");
    }

    function closeSidebar() {
        document.getElementById("sidebar").classList.remove("open");
        document.getElementById("sidebar-overlay").classList.remove("active");
    }

    function toggleNotification(event) {
        if (event) event.stopPropagation();
        var menu = document.getElementById("notificationMenu");
        if (menu) menu.classList.toggle("active");
    }

    function handleLogout() {
        if (global.AuthStore) {
            global.AuthStore.clearCurrentUser();
        }
        window.location.href = "index.html";
    }

    function startPolling() {
        if (pollTimer) return;
        pollTimer = window.setInterval(function () {
            if (!document.hidden) {
                loadThreads();
            }
        }, 1500);
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (!global.Guard.requireAdmin()) return;

        var user = getCurrentUser();
        if (user) {
            var sideNameEl = document.getElementById("sidebar-username");
            var sideRoleEl = document.getElementById("sidebar-role");
            var topbarNameEl = document.getElementById("topbar-username");
            if (sideNameEl) sideNameEl.textContent = user.fullName || "Admin";
            if (sideRoleEl) sideRoleEl.textContent = user.role || "ADMIN";
            if (topbarNameEl) topbarNameEl.textContent = user.fullName || "Admin";
        }

        document.getElementById("conv-search-input").addEventListener("input", function (event) {
            renderConvList(event.target.value);
        });

        document.addEventListener("click", function () {
            var menu = document.getElementById("notificationMenu");
            if (menu) menu.classList.remove("active");
        });

        loadThreads();
        startPolling();
    });

    global.openConversation = openConversation;
    global.sendAdminReply = sendAdminReply;
    global.handleReplyKey = handleReplyKey;
    global.resolveConversation = resolveConversation;
    global.deleteConversation = deleteConversation;
    global.showConvPane = showConvPane;
    global.toggleSidebar = toggleSidebar;
    global.closeSidebar = closeSidebar;
    global.toggleNotification = toggleNotification;
    global.AdminDashboard = {
        handleLogout: handleLogout
    };
})(window);