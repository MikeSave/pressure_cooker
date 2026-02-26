/* ══════════════════════════════════════════════
   GAME 2 – SENTENCE BUILDER
══════════════════════════════════════════════ */
const SENT_QUESTIONS = [
    { sentence: "The sun is very _____.", blankIdx: 4, correctWord: "bright", wrongWord: "write" },
    { sentence: "I _____ a letter to my friend.", blankIdx: 1, correctWord: "write", wrongWord: "right" },
    { sentence: "Turn _____ at the corner.", blankIdx: 1, correctWord: "right", wrongWord: "write" },
    { sentence: "The _____ is shining today.", blankIdx: 1, correctWord: "sun", wrongWord: "son" },
    { sentence: "I can  my dog.", blankIdx: 3, correctWord: "hear", wrongWord: "here" },
    { sentence: "Put the book  the table.", blankIdx: 4, correctWord: "on", wrongWord: "won" },
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
    const fbEl = document.getElementById('sent-feedback');
    fbEl.textContent = '';
    fbEl.className = 'sentence-feedback';
    fbEl.style.display = 'none';

    // Build sentence display
    const words = q.sentence.split(' ');
    const textEl = document.getElementById('sent-text');
    textEl.innerHTML = '';
    words.forEach((w, i) => {
        if (i === q.blankIdx) {
            const blank = document.createElement('span');
            blank.className = 'sentence-blank';
            blank.id = 'sent-blank';
            // show dotted placeholder so players know where the word will go
            blank.textContent = '.......';
            textEl.appendChild(blank);
        } else {
            const sp = document.createElement('span');
            sp.textContent = w;
            textEl.appendChild(sp);
        }
    });
    // Create decorative brain images and interactive choice buttons above them
    const overlay = document.getElementById('brain-overlay');
    if (overlay) {
        overlay.innerHTML = '';

        // decorative brains
        const leftImg = document.createElement('img');
        leftImg.src = 'assets/brain-left.png';
        leftImg.alt = 'Left brain';
        leftImg.className = 'brain-mask left';

        const rightImg = document.createElement('img');
        rightImg.src = 'assets/brain-right.png';
        rightImg.alt = 'Right brain';
        rightImg.className = 'brain-mask right';

        overlay.appendChild(leftImg);
        overlay.appendChild(rightImg);

        // build two choice buttons placed above each brain
        const choiceRow = document.createElement('div');
        choiceRow.className = 'choice-row';

        // determine order randomly (like before)
        const flip = Math.random() > 0.5;
        const leftWord = flip ? q.correctWord : q.wrongWord;
        const rightWord = flip ? q.wrongWord : q.correctWord;
        const leftIsCorrect = flip;
        const rightIsCorrect = !flip;

        function makeChoiceBtn(word, isCorrect) {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = word;
            btn.onclick = () => { if (!SENT_STATE.selected) checkSentence(word, isCorrect); };
            return btn;
        }

        const leftBtn = makeChoiceBtn(leftWord, leftIsCorrect);
        const rightBtn = makeChoiceBtn(rightWord, rightIsCorrect);

        choiceRow.appendChild(leftBtn);
        choiceRow.appendChild(rightBtn);
        overlay.appendChild(choiceRow);
    }
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
        fb.style.display = 'block';
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
        fb.style.display = 'block';
        setTimeout(() => {
            // restore dotted placeholder after wrong attempt
            blank.textContent = '.......';
            blank.className = 'sentence-blank';
            fb.textContent = '';
            fb.className = 'sentence-feedback';
            fb.style.display = 'none';
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
