/* ══════════════════════════════════════════════
   GAME 2 – SENTENCE BUILDER
══════════════════════════════════════════════ */
const SENT_QUESTIONS = [
    { sentence: "The sun is very _____.", blankIdx: 4, correctWord: "bright", wrongWord: "write" },
    { sentence: "I _____ a letter to my friend.", blankIdx: 1, correctWord: "write", wrongWord: "right" },
    { sentence: "Turn _____ at the corner.", blankIdx: 1, correctWord: "right", wrongWord: "write" },
    { sentence: "The _____ is shining today.", blankIdx: 1, correctWord: "sun", wrongWord: "son" },
    { sentence: "I can _____ my dog.", blankIdx: 3, correctWord: "hear", wrongWord: "here" },
    { sentence: "Put the book _____ the table.", blankIdx: 4, correctWord: "on", wrongWord: "won" },
];

const SENT_STATE = { index: 0, score: 0, selected: null, done: false };

function initSentence() {
    SENT_STATE.index = 0;
    SENT_STATE.score = 0;
    SENT_STATE.selected = null;
    SENT_STATE.done = false;
    document.getElementById('sent-qtotal').textContent = SENT_QUESTIONS.length;
    renderSentence();
}

function renderSentence() {
    const q = SENT_QUESTIONS[SENT_STATE.index];
    document.getElementById('sent-qnum').textContent = SENT_STATE.index + 1;
    document.getElementById('sent-score').textContent = SENT_STATE.score;
    document.getElementById('sent-feedback').textContent = '';
    document.getElementById('sent-feedback').className = 'sentence-feedback';

    // Build sentence display
    const words = q.sentence.split(' ');
    const textEl = document.getElementById('sent-text');
    textEl.innerHTML = '';
    words.forEach((w, i) => {
        if (i === q.blankIdx) {
            const blank = document.createElement('span');
            blank.className = 'sentence-blank';
            blank.id = 'sent-blank';
            blank.textContent = '';
            textEl.appendChild(blank);
        } else {
            const sp = document.createElement('span');
            sp.textContent = w;
            textEl.appendChild(sp);
        }
    });

    // Shuffle word order
    const flip = Math.random() > 0.5;
    const w1 = flip ? q.correctWord : q.wrongWord;
    const w2 = flip ? q.wrongWord : q.correctWord;
    const isW1Correct = flip;

    const container = document.getElementById('word-choices');
    container.innerHTML = '';

    function makeChoice(word, isCorrect) {
        const div = document.createElement('div');
        div.className = 'brain-choice';
        div.onclick = () => { if (!SENT_STATE.selected) checkSentence(word, isCorrect); };

        const img = document.createElement('img');
        img.src = 'assets/brainy-fu.png';
        img.alt = 'Brainy character';
        div.appendChild(img);

        const bubble = document.createElement('div');
        bubble.className = 'word-bubble' + (isCorrect ? '' : ' pink');
        bubble.textContent = word;
        div.appendChild(bubble);

        container.appendChild(div);
    }
    makeChoice(w1, isW1Correct);
    makeChoice(w2, !isW1Correct);
}

function checkSentence(word, isCorrect) {
    if (SENT_STATE.selected || SENT_STATE.done) return;
    SENT_STATE.selected = word;

    const blank = document.getElementById('sent-blank');
    const fb = document.getElementById('sent-feedback');

    if (isCorrect) {
        blank.textContent = word;
        blank.className = 'sentence-blank correct';
        fb.textContent = '🎉 Correct! Great job!';
        fb.className = 'sentence-feedback correct-fb';
        SENT_STATE.score += 10;
        document.getElementById('sent-score').textContent = SENT_STATE.score;

        setTimeout(() => {
            SENT_STATE.selected = null;
            if (SENT_STATE.index < SENT_QUESTIONS.length - 1) {
                SENT_STATE.index++;
                renderSentence();
            } else {
                SENT_STATE.done = true;
                showModal('🏆', 'Excellent Work!', 'You completed all sentences!', SENT_STATE.score, () => initSentence());
            }
        }, 1400);
    } else {
        blank.textContent = word;
        blank.className = 'sentence-blank wrong';
        fb.textContent = '❌ Oops! Try again!';
        fb.className = 'sentence-feedback wrong-fb';
        setTimeout(() => {
            blank.textContent = '';
            blank.className = 'sentence-blank';
            fb.textContent = '';
            fb.className = 'sentence-feedback';
            SENT_STATE.selected = null;
        }, 1000);
    }
}

function speakSentence() {
    const q = SENT_QUESTIONS[SENT_STATE.index];
    speak(q.sentence.replace('_____', 'blank') + '. Choose: ' + q.correctWord + ' or ' + q.wrongWord + '.');
}

// Auto-start when the page loads
document.addEventListener('DOMContentLoaded', initSentence);
