/* ══════════════════════════════════════════════
   SHARED – CONFETTI
══════════════════════════════════════════════ */
const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#C084FC', '#FB923C'];

function spawnConfetti(count = 40) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.cssText = `
            left: ${20 + Math.random() * 60}%;
            top: -12px;
            background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
            animation-duration: ${1.4 + Math.random() * 1.6}s;
            animation-delay: ${Math.random() * 0.8}s;
            width: ${8 + Math.random() * 8}px;
            height: ${8 + Math.random() * 8}px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
        `;
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
}

/* ══════════════════════════════════════════════
   SHARED – MODAL
══════════════════════════════════════════════ */
let _modalPlayAgainCb = null;

function showModal(emoji, title, sub, score, playAgainCb) {
    document.getElementById('modal-emoji').textContent = emoji;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-sub').textContent = sub;
    document.getElementById('modal-score').textContent = score ? 'Score: ' + score : '';
    _modalPlayAgainCb = playAgainCb;
    document.getElementById('modal').classList.add('open');
    spawnConfetti(50);
}

function closeModal() {
    document.getElementById('modal').classList.remove('open');
}

function modalPlayAgain() {
    closeModal();
    if (_modalPlayAgainCb) _modalPlayAgainCb();
}

/* ══════════════════════════════════════════════
   SHARED – AUDIO / SPEECH
══════════════════════════════════════════════ */
function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
}
