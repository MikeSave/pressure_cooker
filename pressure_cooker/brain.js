/* ══════════════════════════════════════════════
   GAME 3 – CONNECT THE BRAIN
══════════════════════════════════════════════ */
const BRAIN_LEVELS = [
    {
        pairs: [{ id: '1', left: 's', right: 'aw', word: 'saw' },
        { id: '2', left: 'c', right: 'ar', word: 'car' }]
    },
    {
        pairs: [{ id: '1', left: 'tr', right: 'ee', word: 'tree' },
        { id: '2', left: 'b', right: 'ook', word: 'book' },
        { id: '3', left: 'st', right: 'ar', word: 'star' }]
    },
    {
        pairs: [{ id: '1', left: 'r', right: 'un', word: 'run' },
        { id: '2', left: 'j', right: 'ump', word: 'jump' },
        { id: '3', left: 'fl', right: 'ag', word: 'flag' }]
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

function showCompletedWord(word) {
    const container = document.getElementById('completed-words');
    const wrapper = document.createElement('div');
    wrapper.className = 'completed-word';

    const img = document.createElement('img');
    img.src = 'assets/brainy-fu.png';
    img.alt = 'Brainy';
    wrapper.appendChild(img);

    const textBox = document.createElement('div');
    textBox.className = 'completed-word-text';
    textBox.textContent = word;
    wrapper.appendChild(textBox);

    container.appendChild(wrapper);
    // auto-remove after 2 seconds
    setTimeout(() => wrapper.remove(), 2000);
}

function renderBrainLevel() {
    const level = BRAIN_LEVELS[BRAIN_STATE.level];
    document.getElementById('brain-level').textContent = BRAIN_STATE.level + 1;
    document.getElementById('brain-score').textContent = BRAIN_STATE.score;

    BRAIN_STATE.selectedLeft = null;
    BRAIN_STATE.connections = [];
    BRAIN_STATE.levelDone = false;

    // Clear completed words for new level
    document.getElementById('completed-words').innerHTML = '';

    // Clear SVG lines
    const svg = document.getElementById('brain-svg');
    svg.innerHTML = '';

    // Left column
    const leftCol = document.getElementById('left-column');
    const rightCol = document.getElementById('right-column');
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    // Shuffle right side
    const pairs = level.pairs;
    const rightShuffled = [...pairs].sort(() => Math.random() - 0.5);

    pairs.forEach((pair) => {
        const lel = makeBrainHalf('left', pair.id, pair.left);
        leftCol.appendChild(lel);
    });
    rightShuffled.forEach((pair) => {
        const rel = makeBrainHalf('right', pair.id, pair.right);
        rightCol.appendChild(rel);
    });
}

function makeBrainHalf(side, pairId, text) {
    const div = document.createElement('div');
    div.className = `brain-half ${side}-half`;
    div.id = `${side}-${pairId}`;
    div.dataset.pairId = pairId;
    div.dataset.side = side;

    const img = document.createElement('img');
    img.src = side === 'left' ? 'assets/Brainy-L.png' : 'assets/Brainy-R.png';
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
        // Deselect any previous
        document.querySelectorAll('.brain-half.selected').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
        BRAIN_STATE.selectedLeft = el.id;
        // Redraw drag line
        redrawLines();
    } else if (side === 'right' && BRAIN_STATE.selectedLeft) {
        const leftEl = document.getElementById(BRAIN_STATE.selectedLeft);
        if (!leftEl) return;
        const leftPairId = leftEl.dataset.pairId;
        const correct = (leftPairId === pairId);

        if (correct) {
            // permanent connection
            BRAIN_STATE.connections.push({ leftId: BRAIN_STATE.selectedLeft, rightId: el.id, correct: true });
            BRAIN_STATE.score += 20;
            document.getElementById('brain-score').textContent = BRAIN_STATE.score;

            leftEl.classList.remove('selected');
            leftEl.classList.add('connected');
            el.classList.add('connected');
            BRAIN_STATE.selectedLeft = null;

            // Find and display the completed word in the tower
            const level = BRAIN_LEVELS[BRAIN_STATE.level];
            const pair = level.pairs.find(p => p.id === leftPairId);
            if (pair) {
                showCompletedWord(pair.word);
            }

            redrawLines();
            checkBrainLevelComplete();
        } else {
            // wrong: give feedback and allow retry (do not mark connected)
            const instr = document.getElementById('brain-instructions');
            const span = instr ? instr.querySelector('span') : null;
            const prevText = span ? span.textContent : null;
            if (span) span.textContent = '❌ Try again — connect to the correct right brain!';

            // briefly highlight the wrong target and draw a temporary red line
            el.classList.add('wrong');
            const svg = document.getElementById('brain-svg');
            drawLine(svg, leftEl, el, '#ef4444');

            setTimeout(() => {
                el.classList.remove('wrong');
                if (span) span.textContent = prevText;
                // redraw permanent lines (clears temporary)
                redrawLines();
            }, 900);
            // keep leftEl selected so user can pick another right
        }
    }
}

function redrawLines() {
    const svg = document.getElementById('brain-svg');
    svg.innerHTML = '';

    BRAIN_STATE.connections.forEach(conn => {
        // Only draw lines for incorrect connections; correct ones disappear with the brains
        if (!conn.correct) {
            const lEl = document.getElementById(conn.leftId);
            const rEl = document.getElementById(conn.rightId);
            if (!lEl || !rEl) return;
            drawLine(svg, lEl, rEl, '#ef4444');
        }
    });
}

function drawLine(svg, fromEl, toEl, color) {
    const svgRect = svg.getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    // Prefer the visible label centers (if present) so lines connect to the
    // visible syllable boxes. Fall back to element centers otherwise.
    const fromLabel = fromEl.querySelector('.syllable-label');
    const toLabel = toEl.querySelector('.syllable-label');
    const fromBox = fromLabel ? fromLabel.getBoundingClientRect() : fromRect;
    const toBox = toLabel ? toLabel.getBoundingClientRect() : toRect;

    // convert screen-space box corners into SVG coordinates so sizes and
    // positions are consistent with the SVG's coordinate system
    const pt = svg.createSVGPoint();
    const screenToSvg = svg.getScreenCTM().inverse();

    function toSvgBox(box) {
        const corners = [
            { x: box.left, y: box.top },
            { x: box.right, y: box.top },
            { x: box.right, y: box.bottom },
            { x: box.left, y: box.bottom }
        ].map(c => {
            pt.x = c.x;
            pt.y = c.y;
            const p = pt.matrixTransform(screenToSvg);
            return { x: p.x, y: p.y };
        });
        const xs = corners.map(c => c.x);
        const ys = corners.map(c => c.y);
        const left = Math.min(...xs), right = Math.max(...xs);
        const top = Math.min(...ys), bottom = Math.max(...ys);
        return { left, right, top, bottom, width: right - left, height: bottom - top, cx: (left + right) / 2, cy: (top + bottom) / 2 };
    }

    const sFrom = toSvgBox(fromBox);
    const sTo = toSvgBox(toBox);

    // center points in SVG coords
    const cx1 = sFrom.cx, cy1 = sFrom.cy;
    const cx2 = sTo.cx, cy2 = sTo.cy;

    // unit direction vector from start to end
    const dx = cx2 - cx1, dy = cy2 - cy1;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist, uy = dy / dist;

    // compute intersection of ray from center with rectangle edges
    function rectEdgeIntersection(box, cx, cy, ux, uy) {
        const candidates = [];
        // left edge
        if (ux !== 0) {
            const t = (box.left - cx) / ux;
            const y = cy + uy * t;
            if (t > 0 && y >= box.top - 0.0001 && y <= box.bottom + 0.0001) candidates.push({ t, x: box.left, y });
        }
        // right edge
        if (ux !== 0) {
            const t = (box.right - cx) / ux;
            const y = cy + uy * t;
            if (t > 0 && y >= box.top - 0.0001 && y <= box.bottom + 0.0001) candidates.push({ t, x: box.right, y });
        }
        // top edge
        if (uy !== 0) {
            const t = (box.top - cy) / uy;
            const x = cx + ux * t;
            if (t > 0 && x >= box.left - 0.0001 && x <= box.right + 0.0001) candidates.push({ t, x, y: box.top });
        }
        // bottom edge
        if (uy !== 0) {
            const t = (box.bottom - cy) / uy;
            const x = cx + ux * t;
            if (t > 0 && x >= box.left - 0.0001 && x <= box.right + 0.0001) candidates.push({ t, x, y: box.bottom });
        }
        if (!candidates.length) return { x: cx, y: cy };
        candidates.sort((a, b) => a.t - b.t);
        return { x: candidates[0].x, y: candidates[0].y };
    }

    const pStart = rectEdgeIntersection(sFrom, cx1, cy1, ux, uy);
    const pEnd = rectEdgeIntersection(sTo, cx2, cy2, -ux, -uy);

    const x1 = pStart.x, y1 = pStart.y;
    const x2 = pEnd.x, y2 = pEnd.y;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${x1},${y1} L ${x2},${y2}`);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '6');
    path.setAttribute('fill', 'none');
    // use butt caps and no dash animation so the line displays instantly
    path.setAttribute('stroke-linecap', 'butt');
    svg.appendChild(path);
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
            showModal('🏆', 'Brain Champion!', 'You connected all the brains!', BRAIN_STATE.score, () => navigate('brain'));
        }, 600);
    }
}

// Auto-start when the page loads
document.addEventListener('DOMContentLoaded', initBrain);
