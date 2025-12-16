// Chat Base - Embeddable Widget Script
// Add this script to any website to embed the chatbot

(function () {
    'use strict';

    // Configuration
    const config = {
        apiUrl: window.CHATBASE_API_URL || 'http://localhost:3001',
        widgetKey: window.CHATBASE_WIDGET_KEY || '',
        position: window.CHATBASE_POSITION || 'bottom-right',
        primaryColor: window.CHATBASE_PRIMARY_COLOR || '#E6602F',
        title: window.CHATBASE_TITLE || 'Chat Base',
        subtitle: window.CHATBASE_SUBTITLE || 'Ask me anything!',
        placeholder: window.CHATBASE_PLACEHOLDER || 'Type your message...',
    };

    // Styles
    const styles = `
        .chatbase-widget {
            position: fixed;
            ${config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
            ${config.position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            z-index: 999999;
            font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .chatbase-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${config.primaryColor};
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .chatbase-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 25px rgba(0,0,0,0.3);
        }

        .chatbase-button svg {
            width: 28px;
            height: 28px;
            fill: white;
        }

        .chatbase-container {
            position: absolute;
            ${config.position.includes('bottom') ? 'bottom: 70px;' : 'top: 70px;'}
            ${config.position.includes('right') ? 'right: 0;' : 'left: 0;'}
            width: 380px;
            height: 520px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: none;
            flex-direction: column;
            overflow: hidden;
        }

        .chatbase-container.open {
            display: flex;
            animation: chatbase-slideIn 0.3s ease;
        }

        @keyframes chatbase-slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .chatbase-header {
            background: ${config.primaryColor};
            color: white;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .chatbase-header-icon {
            width: 40px;
            height: 40px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .chatbase-header-icon svg {
            width: 24px;
            height: 24px;
            fill: white;
        }

        .chatbase-header-text h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }

        .chatbase-header-text p {
            margin: 2px 0 0;
            font-size: 13px;
            opacity: 0.9;
        }

        .chatbase-close {
            margin-left: auto;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            display: flex;
            opacity: 0.8;
            transition: opacity 0.2s;
        }

        .chatbase-close:hover {
            opacity: 1;
        }

        .chatbase-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .chatbase-message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
        }

        .chatbase-message.user {
            align-self: flex-end;
            background: ${config.primaryColor};
            color: white;
            border-bottom-right-radius: 4px;
        }

        .chatbase-message.bot {
            align-self: flex-start;
            background: #f1f3f5;
            color: #333;
            border-bottom-left-radius: 4px;
        }

        .chatbase-message.typing {
            display: flex;
            gap: 4px;
            padding: 16px 20px;
        }

        .chatbase-message.typing span {
            width: 8px;
            height: 8px;
            background: #999;
            border-radius: 50%;
            animation: chatbase-bounce 1.4s infinite ease-in-out both;
        }

        .chatbase-message.typing span:nth-child(1) { animation-delay: -0.32s; }
        .chatbase-message.typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes chatbase-bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        .chatbase-input-container {
            padding: 16px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 12px;
        }

        .chatbase-input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 24px;
            padding: 12px 20px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        .chatbase-input:focus {
            border-color: ${config.primaryColor};
        }

        .chatbase-send {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: ${config.primaryColor};
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }

        .chatbase-send:hover {
            transform: scale(1.05);
        }

        .chatbase-send:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .chatbase-send svg {
            width: 20px;
            height: 20px;
            fill: white;
        }

        .chatbase-powered {
            padding: 8px;
            text-align: center;
            font-size: 11px;
            color: #999;
        }

        .chatbase-powered a {
            color: ${config.primaryColor};
            text-decoration: none;
        }
    `;

    // Icons
    const icons = {
        chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>',
        close: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
        bot: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>',
    };

    // Create widget HTML
    function createWidget() {
        // Add styles
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        // Create widget container
        const widget = document.createElement('div');
        widget.className = 'chatbase-widget';
        widget.innerHTML = `
            <div class="chatbase-container">
                <div class="chatbase-header">
                    <div class="chatbase-header-icon">${icons.bot}</div>
                    <div class="chatbase-header-text">
                        <h3>${config.title}</h3>
                        <p>${config.subtitle}</p>
                    </div>
                    <button class="chatbase-close">${icons.close}</button>
                </div>
                <div class="chatbase-messages">
                    <div class="chatbase-message bot">Hi! How can I help you today?</div>
                </div>
                <div class="chatbase-input-container">
                    <input type="text" class="chatbase-input" placeholder="${config.placeholder}">
                    <button class="chatbase-send">${icons.send}</button>
                </div>
                <div class="chatbase-powered">Powered by <a href="#">Chat Base</a></div>
            </div>
            <button class="chatbase-button">${icons.chat}</button>
        `;

        document.body.appendChild(widget);

        // Get elements
        const button = widget.querySelector('.chatbase-button');
        const container = widget.querySelector('.chatbase-container');
        const closeBtn = widget.querySelector('.chatbase-close');
        const input = widget.querySelector('.chatbase-input');
        const sendBtn = widget.querySelector('.chatbase-send');
        const messages = widget.querySelector('.chatbase-messages');

        // Toggle chat
        button.addEventListener('click', () => {
            container.classList.toggle('open');
            if (container.classList.contains('open')) {
                input.focus();
            }
        });

        closeBtn.addEventListener('click', () => {
            container.classList.remove('open');
        });

        // Send message
        async function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            // Add user message
            addMessage(text, 'user');
            input.value = '';
            sendBtn.disabled = true;

            // Show typing indicator
            const typingEl = addTyping();

            try {
                const response = await fetch(`${config.apiUrl}/api/chat/widget`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: text, widgetKey: config.widgetKey }),
                });

                const data = await response.json();
                typingEl.remove();
                addMessage(data.answer || data.message?.answer || 'Sorry, I could not process your request.', 'bot');
            } catch (error) {
                typingEl.remove();
                addMessage('Sorry, something went wrong. Please try again.', 'bot');
            }

            sendBtn.disabled = false;
        }

        function addMessage(text, type) {
            const msg = document.createElement('div');
            msg.className = `chatbase-message ${type}`;
            msg.textContent = text;
            messages.appendChild(msg);
            messages.scrollTop = messages.scrollHeight;
            return msg;
        }

        function addTyping() {
            const typing = document.createElement('div');
            typing.className = 'chatbase-message bot typing';
            typing.innerHTML = '<span></span><span></span><span></span>';
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;
            return typing;
        }

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();
