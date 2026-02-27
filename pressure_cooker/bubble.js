/* ══════════════════════════════════════════════
   GAME 1 – ANAGRAM SWIPE
══════════════════════════════════════════════ */
const ANAGRAM_PAIRS = [
    { words: ['SAW', 'WAS'] },
    { words: ['TEN', 'NET'] },
    { words: ['POT', 'TOP'] },
    { words: ['MUG', 'GUM'] },
    { words: ['PAN', 'NAP'] },
    { words: ['BAT', 'TAB'] },
    { words: ['STAR', 'RATS'] },
    { words: ['FLOW', 'WOLF'] },
    { words: ['LEAF', 'FLEA'] },
    { words: ['BREAD', 'BEARD'] },
    { words: ['LEMON', 'MELON'] },
    { words: ['ANGEL', 'ANGLE'] },
    { words: ['DAIRY', 'DIARY'] },
];

const BUBBLE_STATE = {
    pair: null,
    letters: [],   // shuffled letter array (same letters as the words)
    tilePositions: [],   // [{x, y}] center of each tile within the tiles area
    foundWords: [],   // words found so far (e.g. ['SAW'])
    selecting: false,
    selectedTiles: [],   // indices of tiles in current swipe path
    score: 0,
    currentPointer: null, // {x, y} client coords for live drag line
};

/* ── Init ───────────────────────────────────── */
function initBubble() {
    // Pick a new random pair (avoid repeating the last one if possible)
    let pair;
    do { pair = ANAGRAM_PAIRS[Math.floor(Math.random() * ANAGRAM_PAIRS.length)]; }
    while (ANAGRAM_PAIRS.length > 1 && pair === BUBBLE_STATE.pair);

    BUBBLE_STATE.pair = pair;
    BUBBLE_STATE.letters = [...pair.words[0]].sort(() => Math.random() - 0.5);
    BUBBLE_STATE.foundWords = [];
    BUBBLE_STATE.selecting = false;
    BUBBLE_STATE.selectedTiles = [];
    BUBBLE_STATE.score = 0;
    BUBBLE_STATE.currentPointer = null;

    document.getElementById('bubble-score').textContent = '0';
    document.getElementById('bubble-feedback').textContent = '';

    renderWordRows();
    renderTiles();
}

/* ── Word blanks ────────────────────────────── */
function renderWordRows() {
    const container = document.getElementById('bubble-words');
    container.innerHTML = '';

    BUBBLE_STATE.pair.words.forEach((word, idx) => {
        const row = document.createElement('div');
        row.className = 'word-row';
        row.id = `word-row-${idx}`;

        const label = document.createElement('div');
        label.className = 'word-row-label';
        label.textContent = 'Word ' + (idx + 1);
        row.appendChild(label);

        const slots = document.createElement('div');
        slots.className = 'word-slots';

        for (let i = 0; i < word.length; i++) {
            const slot = document.createElement('div');
            slot.className = 'word-slot';
            slots.appendChild(slot);
        }

        row.appendChild(slots);
        container.appendChild(row);
    });
}

/* ── Letter tiles ───────────────────────────── */
function renderTiles() {
    const area = document.getElementById('bubble-tiles-area');
    // Clear old tiles (keep SVG)
    area.querySelectorAll('.letter-tile').forEach(t => t.remove());
    document.getElementById('bubble-svg').innerHTML = '';

    const N = BUBBLE_STATE.letters.length;
    const AREA = 380;
    const cx = AREA / 2;
    const cy = AREA / 2;
    const radiusMap = { 3: 115, 4: 130, 5: 145 };
    const r = radiusMap[N] ?? 130;

    BUBBLE_STATE.tilePositions = [];

    BUBBLE_STATE.letters.forEach((letter, i) => {
        const angle = (2 * Math.PI * i / N) - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        BUBBLE_STATE.tilePositions.push({ x, y });

        const tile = document.createElement('div');
        tile.className = 'letter-tile';
        tile.id = `tile-${i}`;
        tile.textContent = letter;
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';

        tile.addEventListener('pointerdown', (e) => onPointerDown(e, i));
        area.appendChild(tile);
    });
}

/* ── Pointer events ─────────────────────────── */
function onPointerDown(e, idx) {
    e.preventDefault();
    BUBBLE_STATE.selecting = true;
    BUBBLE_STATE.selectedTiles = [idx];
    BUBBLE_STATE.currentPointer = { x: e.clientX, y: e.clientY };

    // Capture so pointermove/up fire here even while moving over other tiles
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.addEventListener('pointermove', onPointerMove);
    e.currentTarget.addEventListener('pointerup', onPointerUp);
    e.currentTarget.addEventListener('pointercancel', onPointerUp);

    updateTileVisuals();
    updateDragSVG();
}

function onPointerMove(e) {
    if (!BUBBLE_STATE.selecting) return;
    e.preventDefault();

    BUBBLE_STATE.currentPointer = { x: e.clientX, y: e.clientY };

    const hoveredIdx = getTileAtPoint(e.clientX, e.clientY);
    if (hoveredIdx !== null && !BUBBLE_STATE.selectedTiles.includes(hoveredIdx)) {
        BUBBLE_STATE.selectedTiles.push(hoveredIdx);
        updateTileVisuals();
    }
    updateDragSVG();
}

function onPointerUp(e) {
    if (!BUBBLE_STATE.selecting) return;
    BUBBLE_STATE.selecting = false;
    BUBBLE_STATE.currentPointer = null;

    e.currentTarget.removeEventListener('pointermove', onPointerMove);
    e.currentTarget.removeEventListener('pointerup', onPointerUp);
    e.currentTarget.removeEventListener('pointercancel', onPointerUp);

    const word = BUBBLE_STATE.selectedTiles.map(i => BUBBLE_STATE.letters[i]).join('');
    checkWord(word);

    BUBBLE_STATE.selectedTiles = [];
    updateTileVisuals();
    updateDragSVG();
}

/* ── Hit test ───────────────────────────────── */
function getTileAtPoint(clientX, clientY) {
    const area = document.getElementById('bubble-tiles-area');
    const rect = area.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    const TILE_HIT_RADIUS = 50;

    for (let i = 0; i < BUBBLE_STATE.tilePositions.length; i++) {
        const { x, y } = BUBBLE_STATE.tilePositions[i];
        const dist = Math.sqrt((px - x) ** 2 + (py - y) ** 2);
        if (dist <= TILE_HIT_RADIUS) return i;
    }
    return null;
}

/* ── Tile visuals ───────────────────────────── */
function updateTileVisuals() {
    BUBBLE_STATE.letters.forEach((_, i) => {
        const el = document.getElementById(`tile-${i}`);
        if (!el) return;
        el.classList.toggle('selected', BUBBLE_STATE.selectedTiles.includes(i));
    });
}

/* ── SVG drag line ──────────────────────────── */
function updateDragSVG() {
    const svg = document.getElementById('bubble-svg');
    svg.innerHTML = '';

    const sel = BUBBLE_STATE.selectedTiles;

    // Lines between consecutive selected tiles
    for (let i = 0; i < sel.length - 1; i++) {
        const from = BUBBLE_STATE.tilePositions[sel[i]];
        const to = BUBBLE_STATE.tilePositions[sel[i + 1]];
        addSVGLine(svg, from.x, from.y, to.x, to.y, 'rgba(167,139,250,0.9)', 6, false);
    }

    // Dashed line from last tile to current pointer position
    if (sel.length > 0 && BUBBLE_STATE.currentPointer) {
        const area = document.getElementById('bubble-tiles-area');
        const rect = area.getBoundingClientRect();
        const last = BUBBLE_STATE.tilePositions[sel[sel.length - 1]];
        const px = BUBBLE_STATE.currentPointer.x - rect.left;
        const py = BUBBLE_STATE.currentPointer.y - rect.top;
        addSVGLine(svg, last.x, last.y, px, py, 'rgba(167,139,250,0.45)', 4, true);
    }
}

function addSVGLine(svg, x1, y1, x2, y2, stroke, width, dashed) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1); line.setAttribute('y1', y1);
    line.setAttribute('x2', x2); line.setAttribute('y2', y2);
    line.setAttribute('stroke', stroke);
    line.setAttribute('stroke-width', width);
    line.setAttribute('stroke-linecap', 'round');
    if (dashed) line.setAttribute('stroke-dasharray', '8 5');
    svg.appendChild(line);
}

/* ── Word check ─────────────────────────────── */
function checkWord(word) {
    if (!word || word.length < 2) return;

    const pair = BUBBLE_STATE.pair;

    if (BUBBLE_STATE.foundWords.includes(word)) {
        showBubbleFeedback('✅ Already found!', '#fbbf24');
        return;
    }

    if (pair.words.includes(word)) {
        BUBBLE_STATE.foundWords.push(word);
        BUBBLE_STATE.score += 50;
        document.getElementById('bubble-score').textContent = BUBBLE_STATE.score;

        // Pop the selected tiles with staggered delay
        const tilesToPop = [...BUBBLE_STATE.selectedTiles];
        tilesToPop.forEach((tileIdx, i) => {
            setTimeout(() => popTile(tileIdx), i * 80);
        });

        // Fill the corresponding blank row
        const rowIdx = pair.words.indexOf(word);
        fillWordRow(rowIdx, word);
        showBubbleFeedback('🎉 ' + word + '!', '#4ade80');

        if (BUBBLE_STATE.foundWords.length === 2) {
            setTimeout(() => {
                showModal('🎉', 'Amazing!', 'You found both words!', BUBBLE_STATE.score, () => initBubble());
            }, 900);
        } else {
            // Respawn tiles after pop animation finishes
            setTimeout(() => renderTiles(), tilesToPop.length * 80 + 400);
        }
    } else {
        showBubbleFeedback('❌ Try again!', '#f87171');
    }
}

/* ── Pop a single tile ──────────────────────── */
function popTile(tileIdx) {
    const tile = document.getElementById(`tile-${tileIdx}`);
    if (!tile) return;

    const area = document.getElementById('bubble-tiles-area');
    const pos = BUBBLE_STATE.tilePositions[tileIdx];

    // Add popping class to the tile
    tile.classList.add('popping');

    // Create burst ring
    const burst = document.createElement('div');
    burst.className = 'pop-burst';
    burst.style.left = pos.x + 'px';
    burst.style.top = pos.y + 'px';
    area.appendChild(burst);

    // Clean up after animation
    setTimeout(() => {
        tile.remove();
        burst.remove();
    }, 500);
}

function fillWordRow(rowIdx, word) {
    const row = document.getElementById(`word-row-${rowIdx}`);
    const slots = row.querySelectorAll('.word-slot');
    slots.forEach((slot, i) => {
        setTimeout(() => {
            slot.textContent = word[i];
            slot.classList.add('filled');
        }, i * 80);
    });
    row.classList.add('found');
}

function showBubbleFeedback(msg, color) {
    const el = document.getElementById('bubble-feedback');
    el.textContent = msg;
    el.style.color = color;
    clearTimeout(el._clearTimer);
    el._clearTimer = setTimeout(() => {
        if (el.textContent === msg) el.textContent = '';
    }, 1600);
}

/* ── Audio ──────────────────────────────────── */
function speakBubble() {
    const pair = BUBBLE_STATE.pair;
    speak('Swipe through the letters to spell two words. The letters are: ' + BUBBLE_STATE.letters.join(', ') + '. Hint: the words are anagrams of each other.');
}

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', initBubble);
