/* ================================================================
   ADMIN LIVE CHAT — admin-chat.js
   Companion to admin-chat.html + admin-chat.css

   All chat data lives in localStorage under keys:
     sot_conv_{sessionId}  →  { id, guestName, messages[], unread, lastTime, online }
   ================================================================ */

const CONV_KEY_PREFIX = 'sot_conv_';
let activeConvId = null;

/* ────────────────────────────────────────────
   STORAGE HELPERS
   ──────────────────────────────────────────── */

function getAllConversations() {
    const convs = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CONV_KEY_PREFIX)) {
            try { convs.push(JSON.parse(localStorage.getItem(k))); } catch (e) { }
        }
    }
    convs.sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));
    return convs;
}

function getConversation(id) {
    try { return JSON.parse(localStorage.getItem(CONV_KEY_PREFIX + id)); } catch (e) { return null; }
}

function saveConversation(conv) {
    localStorage.setItem(CONV_KEY_PREFIX + conv.id, JSON.stringify(conv));
}

function deleteConvFromStorage(id) {
    localStorage.removeItem(CONV_KEY_PREFIX + id);
}


/* ────────────────────────────────────────────
   FORMAT HELPERS
   ──────────────────────────────────────────── */

function initials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
        ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function formatDateLabel(ts) {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'short' });
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ────────────────────────────────────────────
   CONVERSATION LIST
   ──────────────────────────────────────────── */

function renderConvList(filter = '') {
    const list = document.getElementById('conv-list');
    const empty = document.getElementById('conv-empty');
    let convs = getAllConversations();

    if (filter) {
        const q = filter.toLowerCase();
        convs = convs.filter(c => (c.guestName || '').toLowerCase().includes(q));
    }

    list.querySelectorAll('.conv-item').forEach(el => el.remove());

    if (convs.length === 0) {
        empty.style.display = 'flex';
        updateSidebarBadge();
        return;
    }

    empty.style.display = 'none';

    convs.forEach(conv => {
        const lastMsg = conv.messages && conv.messages.length ? conv.messages[conv.messages.length - 1] : null;
        const preview = lastMsg ? lastMsg.text.slice(0, 50) + (lastMsg.text.length > 50 ? '…' : '') : 'No messages yet';
        const timeStr = lastMsg ? formatTime(lastMsg.ts) : '';

        const item = document.createElement('div');
        item.className = 'conv-item'
            + (conv.unread ? ' unread' : '')
            + (activeConvId === conv.id ? ' active' : '');
        item.dataset.id = conv.id;
        item.innerHTML = `
            <div class="conv-avatar">
                ${initials(conv.guestName)}
                ${conv.online ? '<span class="online-dot"></span>' : ''}
            </div>
            <div class="conv-meta">
                <div class="conv-name">${escHtml(conv.guestName || 'Guest')}</div>
                <div class="conv-preview">${escHtml(preview)}</div>
            </div>
            <div class="conv-time">${timeStr}</div>
            ${conv.unread ? `<span class="conv-badge">${conv.unread}</span>` : ''}
        `;
        item.addEventListener('click', () => openConversation(conv.id));
        list.appendChild(item);
    });

    updateSidebarBadge();
}

function updateSidebarBadge() {
    const total = getAllConversations().reduce((sum, c) => sum + (c.unread || 0), 0);
    const badge = document.getElementById('sidebar-unread-badge');
    if (!badge) return;
    if (total > 0) {
        badge.textContent = total;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

/* ────────────────────────────────────────────
   OPEN / RENDER A CONVERSATION
   ──────────────────────────────────────────── */

function openConversation(id) {
    const conv = getConversation(id);
    if (!conv) return;

    activeConvId = id;

    conv.unread = 0;
    saveConversation(conv);

    document.getElementById('chat-header-avatar').textContent = initials(conv.guestName);
    document.getElementById('chat-header-name').textContent = conv.guestName || 'Guest';
    document.getElementById('chat-header-status').textContent = conv.online ? 'Online' : 'Offline';

    document.getElementById('chat-empty-state').style.display = 'none';
    const activeEl = document.getElementById('chat-active');
    activeEl.style.display = 'flex';

    renderMessages(conv);
    renderConvList(document.getElementById('conv-search-input').value);

    if (window.innerWidth <= 768) {
        document.getElementById('conv-pane').classList.add('hidden');
        document.getElementById('chat-pane').classList.remove('hidden');
    }

    document.getElementById('admin-reply-input').focus();
}

function renderMessages(conv) {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';

    if (!conv.messages || conv.messages.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:0.85rem;padding:40px 0;">No messages yet</div>';
        return;
    }

    let lastDateLabel = '';

    conv.messages.forEach(msg => {
        const dateLabel = formatDateLabel(msg.ts);
        if (dateLabel !== lastDateLabel) {
            lastDateLabel = dateLabel;
            const divider = document.createElement('div');
            divider.className = 'date-divider';
            divider.textContent = dateLabel;
            container.appendChild(divider);
        }

        const isAdmin = msg.from === 'admin';
        const avatarInitials = isAdmin ? 'AD' : initials(conv.guestName);

        const row = document.createElement('div');
        row.className = 'msg-row' + (isAdmin ? ' from-admin' : '');
        row.innerHTML = `
            <div class="msg-avatar-sm">${avatarInitials}</div>
            <div class="msg-group">
                <div class="msg-bubble">${escHtml(msg.text)}</div>
                <div class="msg-time">${formatTime(msg.ts)}</div>
            </div>
        `;
        container.appendChild(row);
    });

    container.scrollTop = container.scrollHeight;
}

/* ────────────────────────────────────────────
   SEND ADMIN REPLY
   ──────────────────────────────────────────── */

function sendAdminReply() {
    if (!activeConvId) return;
    const input = document.getElementById('admin-reply-input');
    const text = input.value.trim();
    if (!text) return;

    const conv = getConversation(activeConvId);
    if (!conv) return;

    const msg = { from: 'admin', text, ts: Date.now() };
    conv.messages = conv.messages || [];
    conv.messages.push(msg);
    conv.lastTime = msg.ts;
    saveConversation(conv);

    input.value = '';
    input.style.height = 'auto';

    renderMessages(conv);
    renderConvList(document.getElementById('conv-search-input').value);
}

function handleReplyKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAdminReply();
    }
    const ta = document.getElementById('admin-reply-input');
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
}

/* ────────────────────────────────────────────
   CONVERSATION ACTIONS
   ──────────────────────────────────────────── */

function resolveConversation() {
    if (!activeConvId) return;
    if (!confirm('Mark this conversation as resolved and archive it?')) return;
    deleteConvFromStorage(activeConvId);
    activeConvId = null;
    document.getElementById('chat-empty-state').style.display = 'flex';
    document.getElementById('chat-active').style.display = 'none';
    renderConvList();
}

function deleteConversation() {
    if (!activeConvId) return;
    if (!confirm('Delete this conversation permanently?')) return;
    deleteConvFromStorage(activeConvId);
    activeConvId = null;
    document.getElementById('chat-empty-state').style.display = 'flex';
    document.getElementById('chat-active').style.display = 'none';
    renderConvList();
}

/* ────────────────────────────────────────────
   MOBILE — back button
   ──────────────────────────────────────────── */

function showConvPane() {
    document.getElementById('conv-pane').classList.remove('hidden');
    document.getElementById('chat-pane').classList.add('hidden');
}

/* ────────────────────────────────────────────
   SIDEBAR TOGGLE
   ──────────────────────────────────────────── */

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('active');
}

/* ────────────────────────────────────────────
   POLL FOR NEW MESSAGES (every 3 s)
   ──────────────────────────────────────────── */

function pollMessages() {
    renderConvList(document.getElementById('conv-search-input').value);

    if (activeConvId) {
        const conv = getConversation(activeConvId);
        if (conv) {
            const container = document.getElementById('chat-messages');
            const msgCount = conv.messages ? conv.messages.length : 0;
            const renderedCount = container.querySelectorAll('.msg-row').length;
            if (msgCount !== renderedCount) renderMessages(conv);
        }
    }
}

/* ────────────────────────────────────────────
   INIT
   ──────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    /* ---  Cập nhật thông tin User ở Sidebar --- */
    if (window.AuthStore) {
        const user = window.AuthStore.getCurrentUser();
        if (user) {
            const sideNameEl = document.getElementById("sidebar-username");
            const sideRoleEl = document.getElementById("sidebar-role");
            const sideAvatarEl = document.getElementById("sidebar-avatar");

            if (sideNameEl) sideNameEl.textContent = user.fullName || "Admin";
            if (sideRoleEl) sideRoleEl.textContent = user.role || "ADMIN";
            
            // Nếu bạn có lưu link ảnh trong user.avatarUrl
            if (sideAvatarEl && user.avatarUrl) {
                sideAvatarEl.src = user.avatarUrl;
            }
        }
    }
    

    /* Search */
    document.getElementById('conv-search-input').addEventListener('input', e => {
        renderConvList(e.target.value);
    });

    renderConvList();
    setInterval(pollMessages, 3000);

    /* Seed a demo conversation when localStorage is empty */
    if (getAllConversations().length === 0) {
        const demoId = 'demo_' + Date.now();
        const demoConv = {
            id: demoId,
            guestName: 'Nguyen Van A',
            online: true,
            unread: 2,
            lastTime: Date.now() - 60000,
            messages: [
                { from: 'guest', text: 'Xin chào! Tôi muốn hỏi về giá phòng Deluxe Suite.', ts: Date.now() - 300000 },
                { from: 'admin', text: 'Xin chào! Phòng Deluxe Suite hiện có giá 2,500,000 VND/đêm. Bạn cần thêm thông tin gì không?', ts: Date.now() - 250000 },
                { from: 'guest', text: 'Phòng có bao gồm bữa sáng không ạ?', ts: Date.now() - 120000 },
                { from: 'guest', text: 'Và có được đổi ngày đặt phòng không?', ts: Date.now() - 60000 },
            ]
        };
        saveConversation(demoConv);
        renderConvList();
    }
});