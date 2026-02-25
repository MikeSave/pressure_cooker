/* ══════════════════════════════════════════════
   GAME 1 – POP THE BUBBLE
══════════════════════════════════════════════ */
const ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BUBBLE_WORDS = ['CAT', 'DOG', 'SUN', 'BEE', 'MAP', 'HOP', 'FUN', 'RAT', 'CUP', 'JAR'];

const BUBBLE_STATE = {
    targetWord: 'CAT',
    targetIdx: 0,
    collected: [],
    score: 0,
    bubbles: [],     // { id, letter, x, y, target }
    nextId: 0,
    spawnTimer: null,
    won: false,
};

function initBubble() {
    BUBBLE_STATE.targetWord = BUBBLE_WORDS[Math.floor(Math.random() * BUBBLE_WORDS.length)];
    BUBBLE_STATE.targetIdx = 0;
    BUBBLE_STATE.collected = [];
    BUBBLE_STATE.score = 0;
    BUBBLE_STATE.bubbles = [];
    BUBBLE_STATE.nextId = 0;
    BUBBLE_STATE.won = false;

    document.getElementById('bubble-score').textContent = '0';
    renderSlots();

    const area = document.getElementById('bubble-area');
    area.querySelectorAll('.bubble').forEach(b => b.remove());

    generateBubbles();

    clearInterval(BUBBLE_STATE.spawnTimer);
    BUBBLE_STATE.spawnTimer = setInterval(() => {
        if (!BUBBLE_STATE.won) addRandomBubble();
    }, 3000);
}

function renderSlots() {
    const cont = document.getElementById('bubble-slots');
    cont.innerHTML = '';
    for (let i = 0; i < BUBBLE_STATE.targetWord.length; i++) {
        const s = document.createElement('div');
        s.className = 'letter-slot' + (BUBBLE_STATE.collected[i] ? ' filled' : '');
        s.textContent = BUBBLE_STATE.collected[i] || '?';
        s.id = 'slot-' + i;
        cont.appendChild(s);
    }
}

function generateBubbles() {
    // Place target letters
    BUBBLE_STATE.targetWord.split('').forEach((letter, i) => {
        const id = ++BUBBLE_STATE.nextId;
        const bubble = {
            id, letter,
            x: 15 + i * Math.floor(65 / BUBBLE_STATE.targetWord.length),
            y: 15 + Math.random() * 35,
            target: true,
        };
        BUBBLE_STATE.bubbles.push(bubble);
        spawnBubbleEl(bubble);
    });
    // Random filler letters
    for (let i = 0; i < 7; i++) {
        let letter;
        do { letter = ALL_LETTERS[Math.floor(Math.random() * 26)]; }
        while (BUBBLE_STATE.targetWord.includes(letter));
        const id = ++BUBBLE_STATE.nextId;
        const bubble = { id, letter, x: 8 + Math.random() * 78, y: 10 + Math.random() * 60, target: false };
        BUBBLE_STATE.bubbles.push(bubble);
        spawnBubbleEl(bubble);
    }
}

function spawnBubbleEl(bubble) {
    const area = document.getElementById('bubble-area');
    const el = document.createElement('div');
    el.className = 'bubble' + (bubble.target ? ' target-letter' : '');
    el.id = 'bubble-' + bubble.id;
    el.textContent = bubble.letter;
    el.style.left = bubble.x + '%';
    el.style.top = bubble.y + '%';
    el.style.setProperty('--bob-delay', (Math.random() * 3) + 's');
    el.addEventListener('click', () => popBubble(bubble.id));
    area.appendChild(el);
}

function addRandomBubble() {
    const area = document.getElementById('bubble-area');
    if (area.querySelectorAll('.bubble').length >= 16) return;
    let letter;
    do { letter = ALL_LETTERS[Math.floor(Math.random() * 26)]; }
    while (BUBBLE_STATE.targetWord.includes(letter));
    const id = ++BUBBLE_STATE.nextId;
    const bubble = { id, letter, x: Math.random() * 80 + 5, y: 5 + Math.random() * 50, target: false };
    BUBBLE_STATE.bubbles.push(bubble);
    spawnBubbleEl(bubble);
}

function popBubble(id) {
    if (BUBBLE_STATE.won) return;
    const idx = BUBBLE_STATE.bubbles.findIndex(b => b.id === id);
    if (idx === -1) return;
    const bubble = BUBBLE_STATE.bubbles[idx];

    // Remove from DOM
    const el = document.getElementById('bubble-' + id);
    if (el) {
        el.style.transition = 'transform .2s, opacity .2s';
        el.style.transform = 'scale(0) rotate(180deg)';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 220);
    }
    BUBBLE_STATE.bubbles.splice(idx, 1);

    if (bubble.target) {
        const nextLetter = BUBBLE_STATE.targetWord[BUBBLE_STATE.collected.length];
        if (bubble.letter === nextLetter) {
            BUBBLE_STATE.collected.push(bubble.letter);
            BUBBLE_STATE.score += 10;
            document.getElementById('bubble-score').textContent = BUBBLE_STATE.score;
            renderSlots();

            if (BUBBLE_STATE.collected.join('') === BUBBLE_STATE.targetWord) {
                BUBBLE_STATE.won = true;
                clearInterval(BUBBLE_STATE.spawnTimer);
                setTimeout(() => {
                    showModal(
                        '🎉', 'Amazing Job!',
                        'You spelled ' + BUBBLE_STATE.targetWord + '!',
                        BUBBLE_STATE.score,
                        () => initBubble()
                    );
                }, 500);
            }
        }
    }
}

function speakBubble() {
    speak('Find and pop the letters to spell the word ' + BUBBLE_STATE.targetWord + '. Collect letters in order.');
}

// Auto-start when the page loads
document.addEventListener('DOMContentLoaded', initBubble);
