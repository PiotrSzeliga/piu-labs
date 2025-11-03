const todo = document.getElementById('todo');
const progress = document.getElementById('progress');
const done = document.getElementById('done');

const addButtons = document.getElementsByClassName('add');
const colorButtons = document.getElementsByClassName('color');
const sortButtons = document.getElementsByClassName('sort');

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

function createCard() {
    const card = document.createElement('div');
    card.style.backgroundColor = randomHsl();
    
    const cardTitle = document.createElement('h4');
    card.appendChild(cardTitle);

    const cardText = document.createElement('h5');
    card.appendChild(cardText);

    return card;
}

function updateCounters() {
    todoCounter.textContent = todoCount;
    progressCounter.textContent = progressCount;
    doneCounter.textContent = doneCount;
}

addButtons