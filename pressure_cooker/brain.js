/* ══════════════════════════════════════════════
   GAME 3 – CONNECT THE BRAIN
══════════════════════════════════════════════ */
const BRAIN_LEVELS = [
    {
        pairs: [
            { id: '1', left: 's', right: 'aw', word: 'saw' },
            { id: '2', left: 'c', right: 'ar', word: 'car' },
        ]
    },
    {
        pairs: [
            { id: '1', left: 'tr', right: 'ee', word: 'tree' },
            { id: '2', left: 'b', right: 'ook', word: 'book' },
            { id: '3', left: 'st', right: 'ar', word: 'star' },
        ]
    },
    {
        pairs: [
            { id: '1', left: 'r', right: 'un', word: 'run' },
            { id: '2', left: 'j', right: 'ump', word: 'jump' },
            { id: '3', left: 'fl', right: 'ag', word: 'flag' },
        ]
    },
];

const BRAIN_STATE = {
    level: 0,
    score: 0,
    selectedLeft: null,   // brain half element id
    connections: [],      // { leftId, rightId, correct }
    levelDone: false,
};

function initBrain() {
    BRAIN_STATE.level = 0;
    BRAIN_STATE.score = 0;
    BRAIN_STATE.selectedLeft = null;
    BRAIN_STATE.connections = [];
    BRAIN_STATE.levelDone = false;
    renderBrainLevel();
}

function renderBrainLevel() {
    const level = BRAIN_LEVELS[BRAIN_STATE.level];
    document.getElementById('brain-level').textContent = BRAIN_STATE.level + 1;
    document.getElementById('brain-score').textContent = BRAIN_STATE.score;

    BRAIN_STATE.selectedLeft = null;
    BRAIN_STATE.connections = [];
    BRAIN_STATE.levelDone = false;

    // Clear SVG lines
    const svg = document.getElementById('brain-svg');
    svg.innerHTML = '';

    // Left & right columns
    const leftCol = document.getElementById('left-column');
    const rightCol = document.getElementById('right-column');
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    // Shuffle right side
    const pairs = level.pairs;
    const rightShuffled = [...pairs].sort(() => Math.random() - 0.5);

    pairs.forEach(pair => {
        leftCol.appendChild(makeBrainHalf('left', pair.id, pair.left));
    });
    rightShuffled.forEach(pair => {
        rightCol.appendChild(makeBrainHalf('right', pair.id, pair.right));
    });
}

function makeBrainHalf(side, pairId, text) {
    const div = document.createElement('div');
    div.className = `brain-half ${side}-half`;
    div.id = `${side}-${pairId}`;
    div.dataset.pairId = pairId;
    div.dataset.side = side;

    const img = document.createElement('img');
    img.src = side === 'left' ? 'assets/brain-left.png' : 'assets/brain-right.png';
    img.alt = side + ' brain half';
    div.appendChild(img);

    const label = document.createElement('div');
    label.className = 'syllable-label';
    label.textContent = text;
    div.appendChild(label);

    const cap = document.createElement('div');
    cap.className = 'cap-icon';
    cap.textContent = '🎓';
    div.appendChild(cap);

    div.addEventListener('click', () => brainClick(div));
    return div;
}

function brainClick(el) {
    const side = el.dataset.side;
    const pairId = el.dataset.pairId;

    if (el.classList.contains('connected')) return;

    if (side === 'left') {
        // Deselect any previous selection
        document.querySelectorAll('.brain-half.selected').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        BRAIN_STATE.selectedLeft = el.id;
        redrawLines();
    } else if (side === 'right' && BRAIN_STATE.selectedLeft) {
        const leftEl = document.getElementById(BRAIN_STATE.selectedLeft);
        if (!leftEl) return;
        const leftPairId = leftEl.dataset.pairId;
        const correct = (leftPairId === pairId);

        BRAIN_STATE.connections.push({ leftId: BRAIN_STATE.selectedLeft, rightId: el.id, correct });
        if (correct) {
            BRAIN_STATE.score += 20;
            document.getElementById('brain-score').textContent = BRAIN_STATE.score;
        }

        leftEl.classList.remove('selected');
        leftEl.classList.add('connected');
        el.classList.add('connected');
        BRAIN_STATE.selectedLeft = null;

        redrawLines();
        checkBrainLevelComplete();
    }
}

function redrawLines() {
    const svg = document.getElementById('brain-svg');
    svg.innerHTML = '';

    BRAIN_STATE.connections.forEach(conn => {
        const lEl = document.getElementById(conn.leftId);
        const rEl = document.getElementById(conn.rightId);
        if (!lEl || !rEl) return;
        drawLine(svg, lEl, rEl, conn.correct ? '#10b981' : '#ef4444');
    });
}

function drawLine(svg, fromEl, toEl, color) {
    const svgRect = svg.getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const x1 = fromRect.right - svgRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - svgRect.top;
    const x2 = toRect.left - svgRect.left;
    const y2 = toRect.top + toRect.height / 2 - svgRect.top;
    const mx = (x1 + x2) / 2;
    const my = Math.min(y1, y2) - 40;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${x1},${y1} Q${mx},${my} ${x2},${y2}`);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '6');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.style.strokeDasharray = '300';
    path.style.strokeDashoffset = '300';
    path.style.transition = 'stroke-dashoffset .5s ease';
    svg.appendChild(path);
    requestAnimationFrame(() => { path.style.strokeDashoffset = '0'; });
}

function checkBrainLevelComplete() {
    const level = BRAIN_LEVELS[BRAIN_STATE.level];
    const correct = BRAIN_STATE.connections.filter(c => c.correct);
    if (correct.length < level.pairs.length) return;

    BRAIN_STATE.levelDone = true;

    if (BRAIN_STATE.level < BRAIN_LEVELS.length - 1) {
        // Show toast, advance level
        const toast = document.getElementById('level-toast');
        toast.style.display = 'block';
        setTimeout(() => {
            toast.style.display = 'none';
            BRAIN_STATE.level++;
            renderBrainLevel();
        }, 2000);
    } else {
        setTimeout(() => {
            showModal('🏆', 'Brain Champion!', 'You connected all the brains!', BRAIN_STATE.score, () => initBrain());
        }, 600);
    }
}

function speakBrainInstruction() {
    speak('Click a left brain half, then click a matching right brain half to complete the word!');
}

// Auto-start when the page loads
document.addEventListener('DOMContentLoaded', initBrain);
