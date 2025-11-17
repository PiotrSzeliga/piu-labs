const todo = document.getElementById('todo');
const progress = document.getElementById('progress');
const done = document.getElementById('done');

const todoCounter = document.getElementById('todoCounter');
const progressCounter = document.getElementById('progressCounter');
const doneCounter = document.getElementById('doneCounter');

let todoCount = 0;
let progressCount = 0;
let doneCount = 0;
let idCount = 0;

function randomHsl() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 75%)`;
}

function createCard(data = {}) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = data.id !== undefined ? String(data.id) : `${idCount++}`;
    card.style.backgroundColor = data.color || randomHsl();

    const header = document.createElement('div');
    header.className = 'card-header';

    const cardTitle = document.createElement('h4');
    cardTitle.className = 'card-title';
    cardTitle.contentEditable = 'true';
    cardTitle.textContent = data.title || 'Title';

    const cardX = document.createElement('span');
    cardX.className = 'card-x';
    cardX.textContent = '✖';

    header.appendChild(cardTitle);
    header.appendChild(cardX);
    card.appendChild(header);

    const cardText = document.createElement('h5');
    cardText.className = 'card-text';
    cardText.contentEditable = 'true';
    cardText.textContent = data.text || 'Details';
    card.appendChild(cardText);

    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const rightButton = document.createElement('button');
    rightButton.type = 'button';
    rightButton.className = 'right';
    rightButton.textContent = '→';

    const colorButton = document.createElement('button');
    colorButton.type = 'button';
    colorButton.className = 'card-color';
    colorButton.textContent = '🎨';

    const leftButton = document.createElement('button');
    leftButton.type = 'button';
    leftButton.className = 'left';
    leftButton.textContent = '←';

    footer.appendChild(leftButton);
    footer.appendChild(colorButton);
    footer.appendChild(rightButton);
    card.appendChild(footer);

    cardTitle.addEventListener('input', () => saveState());
    cardText.addEventListener('input', () => saveState());

    return card;
}

function updateCounters() {
    todoCounter.textContent = todoCount;
    progressCounter.textContent = progressCount;
    doneCounter.textContent = doneCount;
}

function saveState() {
    const getCards = (colId) =>
        Array.from(
            document.getElementById(colId).getElementsByClassName('card')
        ).map((card) => ({
            id: card.id,
            title: card.querySelector('.card-title').textContent,
            text: card.querySelector('.card-text').textContent,
            color: card.style.backgroundColor || '',
        }));

    const state = {
        idCount,
        todo: getCards('todo'),
        progress: getCards('progress'),
        done: getCards('done'),
    };

    try {
        localStorage.setItem('kanban', JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save kanban state', e);
    }
}

function loadState() {
    const raw = localStorage.getItem('kanban');
    if (!raw) return false;
    try {
        const parsed = JSON.parse(raw);
        idCount = parsed.idCount || 0;

        ['todo', 'progress', 'done'].forEach((colId) => {
            const column = document.getElementById(colId);
            const column_cards = column.querySelector('.cards');

            if (!column) return;
            Array.from(column.getElementsByClassName('card')).forEach((c) =>
                c.remove()
            );

            const arr = parsed[colId] || [];
            arr.forEach((cdata) => {
                const card = createCard(cdata);
                column_cards.appendChild(card);
            });
        });

        todoCount = document
            .getElementById('todo')
            .getElementsByClassName('card').length;
        progressCount = document
            .getElementById('progress')
            .getElementsByClassName('card').length;
        doneCount = document
            .getElementById('done')
            .getElementsByClassName('card').length;
        updateCounters();
        return true;
    } catch (e) {
        console.error('Failed to load kanban state', e);
        return false;
    }
}

function handleColumnEvents(event) {
    const column = event.target.closest('.collumn');
    if (!column) return;

    const column_cards = column.querySelector('.cards');
    if (!column_cards) return;

    const getCounter = (e) => {
        switch (e) {
            case 'todo':
                return [todoCount, (count) => (todoCount = count)];
            case 'progress':
                return [progressCount, (count) => (progressCount = count)];
            case 'done':
                return [doneCount, (count) => (doneCount = count)];
            default:
                return [0, () => {}];
        }
    };

    if (event.target.classList.contains('add')) {
        const card = createCard();
        column_cards.appendChild(card);
        const [count, setCount] = getCounter(column.id);
        setCount(count + 1);
        updateCounters();
        saveState();
        return;
    }

    if (event.target.classList.contains('card-x')) {
        event.target.closest('.card').remove();
        const [count, setCount] = getCounter(column.id);
        setCount(count - 1);
        updateCounters();
        saveState();
        return;
    }

    if (event.target.classList.contains('color')) {
        const cards = column.getElementsByClassName('card');
        const newColor = randomHsl();
        for (let card of cards) {
            card.style.backgroundColor = newColor;
        }
        saveState();
        return;
    }

    if (event.target.classList.contains('right')) {
        const card = event.target.closest('.card');
        const [count, setCount] = getCounter(column.id);
        setCount(count - 1);
        const nextColumn = column.nextElementSibling;
        const nextColumn_cards = nextColumn.querySelector('.cards');
        nextColumn_cards.appendChild(card);
        const [nextCount, setNextCount] = getCounter(nextColumn.id);
        setNextCount(nextCount + 1);
        updateCounters();
        saveState();
        return;
    }

    if (event.target.classList.contains('left')) {
        const card = event.target.closest('.card');
        const [count, setCount] = getCounter(column.id);
        setCount(count - 1);
        const prevColumn = column.previousElementSibling;
        const prevColumn_cards = prevColumn.querySelector('.cards');
        prevColumn_cards.appendChild(card);
        const [prevCount, setPrevCount] = getCounter(prevColumn.id);
        setPrevCount(prevCount + 1);
        updateCounters();
        saveState();
        return;
    }

    if (event.target.classList.contains('card-color')) {
        const card = event.target.closest('.card');
        card.style.backgroundColor = randomHsl();
        saveState();
        return;
    }

    if (event.target.classList.contains('sort')) {
        const cardsArray = Array.from(
            column_cards.getElementsByClassName('card')
        );
        cardsArray.sort((a, b) => {
            const titleA = a
                .querySelector('.card-title')
                .textContent.toLowerCase();
            const titleB = b
                .querySelector('.card-title')
                .textContent.toLowerCase();
            return titleA.localeCompare(titleB);
        });
        cardsArray.forEach((card) => column_cards.appendChild(card));
        saveState();
        return;
    }
}

document.getElementById('board').addEventListener('click', handleColumnEvents);

if (!loadState()) {
    todoCount = todo.getElementsByClassName('card').length;
    progressCount = progress.getElementsByClassName('card').length;
    doneCount = done.getElementsByClassName('card').length;

    const allIds = Array.from(document.querySelectorAll('.card'))
        .map((c) => parseInt(c.id, 10))
        .filter((n) => !Number.isNaN(n));
    if (allIds.length) idCount = Math.max(idCount, Math.max(...allIds) + 1);
    updateCounters();
    saveState();
}
