(function (global) {
    "use strict";

    var pollTimer = null;
    var activeThreadId = null;
    var renderedMessageSignature = "";
    var sending = false;

    function escHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function formatTime(ts) {
        return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function sortMessages(messages) {
        return (messages || []).slice().sort(function (a, b) {
            return new Date(a.sentAt || 0) - new Date(b.sentAt || 0);
        });
    }

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

    function getElements() {
        var box = document.getElementById("chat-box");
        return {
            toggle: document.getElementById("chat-toggle"),
            box: box,
            closeBtn: document.getElementById("chat-close"),
            body: box ? box.querySelector(".chat-body") : null,
            input: box ? box.querySelector(".chat-footer input") : null,
            sendBtn: box ? box.querySelector(".chat-footer button") : null
        };
    }

    function setFooterDisabled(disabled) {
        var elements = getElements();
        if (elements.input) elements.input.disabled = disabled;
        if (elements.sendBtn) elements.sendBtn.disabled = disabled;
    }

    function setInputPlaceholder(text) {
        var elements = getElements();
        if (elements.input && text) {
            elements.input.placeholder = text;
        }
    }

    function setSystemMessage(text) {
        var elements = getElements();
        if (!elements.body) return;
        elements.body.innerHTML = ''
            + '<div class="chat-message bot chat-message-system">'
            + '  <span class="chat-msg-sender">He thong</span>'
            + '  <span class="chat-msg-text">' + escHtml(text) + "</span>"
            + "</div>";
    }

    function appendMessage(body, message, currentUserId) {
        var isCurrentUser = message.senderUserId === currentUserId;
        var row = document.createElement("div");
        row.className = "chat-message " + (isCurrentUser ? "user" : "bot");
        row.innerHTML = ""
            + '<span class="chat-msg-sender">' + (isCurrentUser ? "Bạn" : "Admin") + "</span>"
            + '<span class="chat-msg-text">' + escHtml(message.content) + "</span>"
            + '<span class="chat-msg-time">' + formatTime(message.sentAt) + "</span>";
        body.appendChild(row);
    }

    function renderMessages(thread) {
        var elements = getElements();
        var user = getCurrentUser();
        var currentUserId = getUserId(user);
        var messages = sortMessages(thread && thread.messages ? thread.messages : []);
        var signature = messages.map(function (message) {
            return [message.id, message.senderUserId, message.sentAt].join("|");
        }).join(",");

        if (!elements.body || signature === renderedMessageSignature) {
            return;
        }

        elements.body.innerHTML = "";
        if (!messages.length) {
            setSystemMessage("Start the conversation with admin.");
            renderedMessageSignature = signature;
            return;
        }

        messages.forEach(function (message) {
            appendMessage(elements.body, message, currentUserId);
        });
        elements.body.scrollTop = elements.body.scrollHeight;
        renderedMessageSignature = signature;
    }

    function fetchThread() {
        if (!activeThreadId) return Promise.resolve();
        return global.ChatApi.getThread(activeThreadId).then(function (thread) {
            renderMessages(thread);
        });
    }

    function ensureThread() {
        var user = getCurrentUser();
        var guestUserId = getUserId(user);
        if (!user || !guestUserId) {
            activeThreadId = null;
            setFooterDisabled(false);
            setInputPlaceholder("Vui long dang nhap de chat voi admin");
            setSystemMessage("Please sign in to chat with admin.");
            return Promise.resolve(null);
        }

        setAuthToken();
        return global.ChatApi.getAvailableStaff()
            .then(function (staffList) {
                var staff = (staffList || [])[0];
                if (!staff) {
                    activeThreadId = null;
                    setFooterDisabled(false);
                    setInputPlaceholder("Tam thoi chua co admin online");
                    setSystemMessage("No admin is available right now. Please try again later.");
                    return null;
                }

                return global.ChatApi.createThread({
                    guestUserId: guestUserId,
                    staffUserId: staff.userId
                });
            })
            .then(function (thread) {
                if (!thread) return null;
                activeThreadId = thread.id;
                setFooterDisabled(false);
                setInputPlaceholder("Nhap tin nhan...");
                return fetchThread().then(function () { return thread; });
            })
            .catch(function (err) {
                activeThreadId = null;
                setFooterDisabled(false);
                setInputPlaceholder("Khong ket noi duoc, bam gui de thu lai");
                setSystemMessage(
                    (err && err.payload && (err.payload.message || err.payload.error))
                    || "Cannot connect to chat right now."
                );
                return null;
            });
    }

    function startPolling() {
        if (pollTimer) return;
        pollTimer = window.setInterval(function () {
            if (document.hidden) return;
            if (!activeThreadId) return;
            fetchThread();
        }, 1500);
    }

    function stopPolling() {
        if (pollTimer) {
            window.clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    function sendMessage() {
        var elements = getElements();
        var user = getCurrentUser();
        var senderUserId = getUserId(user);
        var text = elements.input ? elements.input.value.trim() : "";

        if (!text || sending) return;
        if (!user || !senderUserId) {
            setSystemMessage("Please sign in to chat with admin.");
            if (typeof global.openLoginModal === "function") {
                global.openLoginModal();
            }
            return;
        }
        if (!activeThreadId) {
            ensureThread().then(function () {
                if (activeThreadId) {
                    sendMessage();
                }
            });
            return;
        }

        sending = true;
        elements.sendBtn.disabled = true;

        global.ChatApi.sendMessage({
            threadId: activeThreadId,
            senderUserId: senderUserId,
            senderRole: user.role || "USER",
            content: text
        }).then(function () {
            if (elements.input) elements.input.value = "";
            renderedMessageSignature = "";
            return fetchThread();
        }).catch(function () {
            setSystemMessage("Cannot send message. Please try again.");
        }).finally(function () {
            sending = false;
            elements.sendBtn.disabled = false;
            if (elements.input) elements.input.focus();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        var elements = getElements();
        if (!elements.toggle || !elements.box) return;

        elements.toggle.addEventListener("click", function () {
            elements.box.style.display = "flex";
            elements.toggle.style.display = "none";
            renderedMessageSignature = "";
            setFooterDisabled(false);
            ensureThread().then(startPolling);
            if (elements.input) elements.input.focus();
        });

        if (elements.closeBtn) {
            elements.closeBtn.addEventListener("click", function () {
                elements.box.style.display = "none";
                elements.toggle.style.display = "flex";
                stopPolling();
            });
        }

        if (elements.sendBtn) {
            elements.sendBtn.addEventListener("click", sendMessage);
        }

        if (elements.input) {
            elements.input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                }
            });
        }
    });
})(window);