const path = 'data/data1.json';
const start = document.getElementById('start')

document.getElementById('start').addEventListener('click', getResp);

function getResp() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', path);
    xhr.send();
    xhr.addEventListener('load', () => {
        const data = JSON.parse(xhr.response);
        localStorage.setItem('_data_', JSON.stringify(data));
    });
    start.setAttribute('href', 'static/html/new_game.html');
};
