import Ajax from './ajax.js';

const ajax = new Ajax({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 5000,
});

const list = document.getElementById('list');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('error');

const showLoader = (show) => loader.classList.toggle('show', show);
const showError = (msg) => {
    errorBox.textContent = msg;
    errorBox.classList.toggle('show', !!msg);
};
const hideError = () => {
    errorBox.textContent = '';
    errorBox.classList.remove('show');
};
const reset = () => {
    list.innerHTML = '';
    hideError();
    showLoader(false);
};

async function loadData() {
    reset();
    showLoader(true);
    try {
        const data = await ajax.get('/posts');
        data.slice(0, 10).forEach((item) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.title}</strong><p>${item.body}</p>`;
            list.appendChild(li);
        });
    } catch (err) {
        showError(err.message);
    }
    showLoader(false);
}

async function postData() {
    reset();
    showLoader(true);
    try {
        const result = await ajax.post('/posts', {
            title: 'Nowy post',
            body: 'Treść',
            userId: 1,
        });
        list.innerHTML = `<li><strong>Utworzono POST (ID: ${result.id})</strong></li>`;
    } catch (err) {
        showError(err.message);
    }
    showLoader(false);
}

async function putData() {
    reset();
    showLoader(true);
    try {
        const result = await ajax.put('/posts/1', {
            title: 'Zmieniony tytuł',
            body: 'Nowa treść',
            userId: 1,
        });
        list.innerHTML = `<li><strong>Zaktualizowano POST #1</strong></li>`;
    } catch (err) {
        showError(err.message);
    }
    showLoader(false);
}

async function deleteData() {
    reset();
    showLoader(true);
    try {
        await ajax.delete('/posts/1');
        list.innerHTML = `<li><strong>Usunięto POST #1</strong></li>`;
    } catch (err) {
        showError(err.message);
    }
    showLoader(false);
}

async function loadError() {
    reset();
    showLoader(true);
    try {
        await ajax.get('/bad-endpoint');
    } catch (err) {
        showError(err.message);
    }
    showLoader(false);
}

document.getElementById('btnLoad').onclick = loadData;
document.getElementById('btnPost').onclick = postData;
document.getElementById('btnPut').onclick = putData;
document.getElementById('btnDelete').onclick = deleteData;
document.getElementById('btnError').onclick = loadError;
document.getElementById('btnReset').onclick = reset;
