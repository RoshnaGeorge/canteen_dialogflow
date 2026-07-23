document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll-reveal for menu cards ---------- */
  const cards = document.querySelectorAll('.token-card');

  if ('IntersectionObserver' in window && cards.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    cards.forEach((card, i) => {
      card.style.transitionDelay = i * 60 + 'ms';
      observer.observe(card);
    });
  } else {
    cards.forEach((card) => card.classList.add('is-visible'));
  }

  /* ---------- Chat ---------- */
  initChat();
});

/* ---------- Session management ---------- */

function generateSessionId() {
  if (window.crypto && window.crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function getSessionId() {
  var key = 'canteenChatSessionId';
  var id = sessionStorage.getItem(key);
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem(key, id);
  }
  return id;
}

/* ---------- Chat initialisation ---------- */

function initChat() {
  var messagesEl = document.getElementById('chatMessages');
  var inputEl = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSendBtn');

  if (!messagesEl || !inputEl || !sendBtn) return;

  addMessage(messagesEl, "Hi! I'm your Canteen Assistant. How can I help you today?", 'bot');

  function handleSend() {
    var text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    sendBtn.disabled = true;
    sendMessage(messagesEl, text, sendBtn);
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleSend();
  });
}

/* ---------- Send message to backend ---------- */

async function sendMessage(messagesEl, text, sendBtn) {
  addMessage(messagesEl, text, 'user');

  var typingEl = showTyping(messagesEl);

  try {
    var res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId: getSessionId() })
    });

    if (!res.ok) throw new Error('Server returned ' + res.status);

    var data = await res.json();
    typingEl.remove();
    addMessage(messagesEl, data.reply, 'bot');
  } catch (err) {
    typingEl.remove();
    addMessage(messagesEl, 'Sorry, the Canteen Assistant is temporarily unavailable. Please try again.', 'bot');
  } finally {
    sendBtn.disabled = false;
    document.getElementById('chatInput').focus();
  }
}

/* ---------- Render a message ---------- */

function addMessage(container, text, sender) {
  var row = document.createElement('div');
  row.className = 'chat-message chat-message--' + sender;

  var bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble--' + sender;
  bubble.textContent = text;

  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
}

/* ---------- Typing indicator ---------- */

function showTyping(container) {
  var row = document.createElement('div');
  row.className = 'chat-message chat-message--bot';

  var bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble--bot chat-typing-bubble';

  var dots = document.createElement('span');
  dots.className = 'chat-typing-dots';
  dots.appendChild(document.createElement('span'));
  dots.appendChild(document.createElement('span'));
  dots.appendChild(document.createElement('span'));

  bubble.appendChild(dots);
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;

  return row;
}
