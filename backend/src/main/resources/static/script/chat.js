// ===== CHAT UI SCRIPT =====
// Messages are stored in localStorage so the admin Live Chat page can receive them.
// Key format:  sot_conv_{sessionId}  →  { id, guestName, messages, unread, lastTime, online }

(function () {
    /* ── SESSION / IDENTITY ── */
    let sessionId = localStorage.getItem('sot_chat_session');
    if (!sessionId) {
        sessionId = 'guest_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
        localStorage.setItem('sot_chat_session', sessionId);
    }

    const CONV_KEY = 'sot_conv_' + sessionId;
    const GUEST_NAME_KEY = 'sot_chat_name';

    function getConv() {
        try { return JSON.parse(localStorage.getItem(CONV_KEY)); } catch (e) { return null; }
    }

    function saveConv(conv) {
        localStorage.setItem(CONV_KEY, JSON.stringify(conv));
    }

    function ensureConv(guestName) {
        let conv = getConv();
        if (!conv) {
            conv = {
                id: sessionId,
                guestName: guestName || localStorage.getItem(GUEST_NAME_KEY) || 'Guest',
                online: true,
                unread: 0,
                lastTime: Date.now(),
                messages: []
            };
        }
        conv.online = true;
        return conv;
    }

    /* ── UI HELPERS ── */
    function escHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function formatTime(ts) {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function appendMessage(body, text, from, ts) {
        const row = document.createElement('div');
        row.className = 'chat-message ' + (from === 'admin' ? 'bot' : 'user');
        row.innerHTML = `
            <span class="chat-msg-text">${escHtml(text)}</span>
            <span class="chat-msg-time">${formatTime(ts)}</span>
        `;
        body.appendChild(row);
        body.scrollTop = body.scrollHeight;
    }

    /* ── DOM READY ── */
    document.addEventListener('DOMContentLoaded', () => {
        const toggle   = document.getElementById('chat-toggle');
        const box      = document.getElementById('chat-box');
        const closeBtn = document.getElementById('chat-close');
        const body     = box ? box.querySelector('.chat-body') : null;
        const input    = box ? box.querySelector('.chat-footer input') : null;
        const sendBtn  = box ? box.querySelector('.chat-footer button') : null;

        if (!toggle || !box) return;

        /* Open / close */
        toggle.addEventListener('click', () => {
            box.style.display = 'flex';
            toggle.style.display = 'none';
            markOnline(true);
            loadHistory();
            if (input) input.focus();
        });

        closeBtn.addEventListener('click', () => {
            box.style.display = 'none';
            toggle.style.display = 'flex';
            markOnline(false);
        });

        /* Ask guest name if not known */
        function askName(cb) {
            const stored = localStorage.getItem(GUEST_NAME_KEY);
            if (stored) return cb(stored);

            // Inject a tiny name-prompt inside the chat body
            if (!body.querySelector('.chat-name-prompt')) {
                const prompt = document.createElement('div');
                prompt.className = 'chat-name-prompt';
                prompt.style.cssText = 'background:rgba(201,160,80,0.08);border:1px solid rgba(201,160,80,0.25);border-radius:10px;padding:12px 14px;margin:8px 0;font-size:0.82rem;color:#3D2817;';
                prompt.innerHTML = `
                    <p style="margin-bottom:8px;font-weight:600;">Vui lòng nhập tên của bạn để bắt đầu:</p>
                    <div style="display:flex;gap:6px;">
                        <input id="chat-name-field" placeholder="Tên của bạn…" style="flex:1;padding:6px 10px;border:1px solid rgba(201,160,80,0.4);border-radius:6px;font-size:0.82rem;outline:none;" />
                        <button id="chat-name-submit" style="padding:6px 12px;background:#C9A050;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem;color:#3D2817;font-weight:700;">OK</button>
                    </div>
                `;
                body.appendChild(prompt);
                body.scrollTop = body.scrollHeight;

                const nameInput = prompt.querySelector('#chat-name-field');
                const nameBtn = prompt.querySelector('#chat-name-submit');

                function submitName() {
                    const name = nameInput.value.trim();
                    if (!name) return nameInput.focus();
                    localStorage.setItem(GUEST_NAME_KEY, name);
                    prompt.remove();
                    cb(name);
                }

                nameBtn.addEventListener('click', submitName);
                nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitName(); });
                nameInput.focus();
            }
        }

        /* Send a guest message */
        function sendMessage() {
            const text = input ? input.value.trim() : '';
            if (!text) return;

            askName(guestName => {
                const conv = ensureConv(guestName);
                const msg = { from: 'guest', text, ts: Date.now() };
                conv.messages.push(msg);
                conv.unread = (conv.unread || 0) + 1;
                conv.lastTime = msg.ts;
                conv.guestName = guestName;
                saveConv(conv);

                if (input) input.value = '';
                appendMessage(body, text, 'guest', msg.ts);
            });
        }

        if (sendBtn) sendBtn.addEventListener('click', sendMessage);
        if (input) {
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') sendMessage();
            });
        }

        /* Load chat history on open */
        function loadHistory() {
            if (!body) return;
            // Remove old rendered messages (keep the welcome bot bubble)
            const existing = body.querySelectorAll('.user, .chat-message.bot:not(:first-child)');
            existing.forEach(el => el.remove());

            const conv = getConv();
            if (!conv || !conv.messages) return;
            conv.messages.forEach(msg => appendMessage(body, msg.text, msg.from, msg.ts));
        }

        /* Mark online/offline */
        function markOnline(online) {
            const conv = getConv();
            if (!conv) return;
            conv.online = online;
            saveConv(conv);
        }

        /* Poll for admin replies every 3 seconds */
        function pollAdminReplies() {
            if (box.style.display === 'none') return;
            const conv = getConv();
            if (!conv || !conv.messages) return;

            const rendered = body.querySelectorAll('.chat-message').length;
            // +1 for the initial welcome bubble that is hardcoded in HTML
            const storedCount = conv.messages.length + 1;

            if (storedCount > rendered) {
                loadHistory();
            }
        }

        setInterval(pollAdminReplies, 3000);
    });
})();