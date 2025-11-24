const board = document.getElementById('board');
const btnAddSquare = document.getElementById('addSquare');
const btnAddCircle = document.getElementById('addCircle');
const btnRecolorSquares = document.getElementById('recolorSquares');
const btnRecolorCircles = document.getElementById('recolorCircles');
const squares = document.getElementById('squares');
const circles = document.getElementById('circles');

function createShapeElement(item) {
    const el = document.createElement('div');
    el.className = `shape ${item.type}`;
    el.style.backgroundColor = item.color || '#ddd';
    el.dataset.id = item.id;
    el.dataset.type = item.type;
    el.title = `${item.type} — kliknij aby usunąć`;
    return el;
}

export function init(store) {
    btnAddSquare.addEventListener('click', () => store.addShape('square'));
    btnAddCircle.addEventListener('click', () => store.addShape('circle'));
    btnRecolorSquares.addEventListener('click', () => store.recolor('square'));
    btnRecolorCircles.addEventListener('click', () => store.recolor('circle'));

    board.addEventListener('click', (ev) => {
        const shapeEl = ev.target.closest('.shape');
        if (!shapeEl || !board.contains(shapeEl)) return;
        const id = shapeEl.dataset.id;
        store.removeShape(id);
    });

    store.subscribe((payload) => {
        const change = payload.type;
        const state = payload.state;

        squares.textContent = state.counts.squares;
        circles.textContent = state.counts.circles;

        if (change === 'init') {
            board.innerHTML = '';
            state.shapes.forEach((s) =>
                board.appendChild(createShapeElement(s))
            );
            return;
        }

        if (change === 'add' && payload.item) {
            board.appendChild(createShapeElement(payload.item));
            return;
        }

        if (change === 'remove' && payload.id) {
            const el = board.querySelector(`.shape[data-id="${payload.id}"]`);
            if (el) el.remove();
            return;
        }

        if (change === 'recolor' && payload.shapeType) {
            board
                .querySelectorAll(`.shape[data-type="${payload.shapeType}"]`)
                .forEach((el) => {
                    const id = el.dataset.id;
                    const s = state.shapes.find((x) => x.id === id);
                    if (s) el.style.backgroundColor = s.color;
                });
            return;
        }

        board.innerHTML = '';
        state.shapes.forEach((s) => board.appendChild(createShapeElement(s)));
    });
}
