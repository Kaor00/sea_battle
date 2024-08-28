const grid = document.getElementById('grid');  // игровое поле
const menu = document.getElementById('ch_sheap'); // меню выбора кораблей
const lincor = document.getElementById('lincor'); // тип корабля в меню
const kreiser = document.getElementById('kreiser'); // тип корабля в меню
const traller = document.getElementById('traller'); // тип корабля в меню
const undersheap = document.getElementById('undersheap'); // тип корабля в меню
const delete_ship = document.getElementById('del_sheap'); // строка удалить в меню
const battle = document.getElementById('game'); //Старт игры
const back = document.getElementById('back'); // Возврат на предыдущую страницу
const help = document.getElementById('help'); //
const conversation = document.getElementById('conversation'); // 
const cur_help = document.getElementById('cur_help'); //

let data = JSON.parse(localStorage.getItem('_data_')); // данные общие
let names = Object.keys(data); // массив имен ячеек
let model_ship, xx, yy, val, temp_unit; // переменные о типе корабля, его начальные координаты и название ячейки
let mass = []; // Временное хранение ячеек типа корабля
let stack = []; // Стэк ячеек, где выставлены корабли
let flot = []; // Все корабли с именами
let empty_flot = []; //Все пустые ячейки вокруг кораблей
let count_l = 1, count_k = 1, count_t = 1, count_u = 1; // Счетчики количества кораблей
let model_obj = {
    'Линкор': [4, 1], 
    'Крейсер': [3, 2],
    'Миноносец': [2, 3],
    'Подводная лодка': [1, 4]
};

battle.style.display = 'none';
back.style.display = 'block';

//
help.addEventListener('mouseover', open_helper) // вызов подсказки при наведении
    help.addEventListener('mouseout', close_helper) // отмена подсказки при потере фокуса

function open_helper() {
    conversation.style.display = 'block';
    cur_help.textContent = 'кликните на любую ячейку'

};
function close_helper() {
    conversation.style.display = 'none';
};

// Создаем поле расстановки кораблей
names.forEach(e => {
    let cell = document.createElement('div');
    cell.classList.add('cell');
    cell.textContent = e;
    cell.style.background = 'rgb(122, 167, 226)';
    cell.addEventListener('click', call_menu);
    grid.appendChild(cell);
});

// Проверяем сколько кораблей  выставлено на поле 
function check_start() {
    let hid = 'none';
    let vis = 'block'
    let txt = 'поставьте все корабли'
    if (stack.length == 20) {
        hid = 'block';
        vis = 'none';
        txt = 'можно начинать бой'
        menu.style.display = 'none';
        battle.onclick = start;
    };
    cur_help.textContent = txt
    back.style.display = vis;
    battle.style.display = hid
};

// Вызываем меню для выбора кораблей
function call_menu(event) {
    check_start();
    checking();
    val = event.target.textContent;
    xx = event.clientX;
    yy = event.clientY;
    menu.style.left = `${xx - 50}px`;
    menu.style.top = `${yy + 30}px`;
    
    if (stack.includes(names.indexOf(val))) {
        menu.style.display = 'flex';
        delete_ship.style.display = 'block';
        lincor.style.display = 'none';
        kreiser.style.display = 'none';
        traller.style.display = 'none';
        undersheap.style.display = 'none';
        delete_ship.onclick = del_ship;
        val = event.target.textContent;
    }
    else if (empty_flot.includes(names.indexOf(val))) {
        menu.style.display = 'none';
    }else if (flot.length == 0) {
        menu.style.display = 'flex';
        delete_ship.style.display = 'none';
    }else if (stack.length == 20) {
        menu.style.display = 'none';

    }
    else {
        menu.style.display = 'flex';
        delete_ship.style.display = 'none';
    };
};

// Выбираем корабль
menu.addEventListener('click', choice_ship);
function choice_ship(event){
    menu.style.display = 'none';
    model_ship = event.target.textContent;

    if (model_ship != 'удалить'){
        window.addEventListener('mousemove', render_ship);
    };
    if (model_ship == 'Подводная лодка') {
        let _cells_ = document.querySelectorAll('.cell');
        clear_grid();
        mass.push(data[val].index);
        _cells_[data[val].index].style.background = 'black';
        window.addEventListener('click', past_ship, {patient: true});
    };
};

// Вращаем
function render_ship(event){
    let _cells_ = document.querySelectorAll('.cell');
    let winX = event.clientX;
    let winY = event.clientY;
    let _count_ship = model_obj[model_ship][0];

    if ((xx - winX) < -25) {
        clear_grid();
        mass.length = 0;
        for (let i=0; i<_count_ship; i++){
            let _index = (data[val].index ) + i;
            if (_index > -1 && _index < 100) {
                if (((_cells_[_index].textContent.slice(0,1).charCodeAt(0)) - (_cells_[data[val].index].textContent.slice(0,1).charCodeAt(0)) >= 0) && !stack.includes(_index) && !empty_flot.includes(_index)) {
                    mass.push(_index);
                };
            };
        };
        if (mass.length == _count_ship){
            mass.forEach(e => {
                _cells_[e].style.background = 'black';
                window.addEventListener('click', past_ship, {patient: true});
            });
            cur_help.textContent = "";
        }
        else {
            mass.length = 0;
            cur_help.textContent = "невозможно поставить";
        };
    }
    else if ((xx - winX) > 25) {
        clear_grid();
        mass.length = 0;
        for (let i=0; i<_count_ship; i++){
            let _index = (data[val].index ) - i;
            if (_index > -1 && _index < 100) {
                if (((_cells_[_index].textContent.slice(0,1).charCodeAt(0)) - ((_cells_[data[val].index].textContent.slice(0,1).charCodeAt(0))) <= _count_ship) && !stack.includes(_index) && !empty_flot.includes(_index) ) {
                    mass.push(_index);
                };
            };
        };
        if (mass.length == _count_ship){
            mass.forEach(e => {
                _cells_[e].style.background = 'black';
                window.addEventListener('click', past_ship, {patient: true});
            });
            cur_help.textContent = "";
        }
        else {
            mass.length = 0;
            cur_help.textContent = "невозможно поставить";
        };
    }
    else if (winY > yy) {
        clear_grid();
        mass.length = 0;
        for (let i=0; i<_count_ship; i++){
            let _index = (data[val].index ) + i*10;
            if ((_index > -1 && _index < 100) && !stack.includes(_index) && !empty_flot.includes(_index)) {
                mass.push(_index);
            };
        };
        if (mass.length == _count_ship){
            mass.forEach(e => {
                _cells_[e].style.background = 'black';
                window.addEventListener('click', past_ship, {patient: true});
            });
            cur_help.textContent = "";
        }
        else {
            mass.length = 0;
            cur_help.textContent = "невозможно поставить";
        };
    }
    else if (winY < yy) {
        clear_grid();
        mass.length = 0;
        for (let i=0; i<_count_ship; i++){
            let _index = (data[val].index ) - i*10;
            if ((_index > -1 && _index < 100) && !stack.includes(_index) && !empty_flot.includes(_index)) {
                mass.push(_index);
            };
        };
        if (mass.length == _count_ship){
            mass.forEach(e => {
                _cells_[e].style.background = 'black';
                window.addEventListener('click', past_ship, {patient: true});
            });
            cur_help.textContent = "";
        }
        else {
            mass.length = 0;
            cur_help.textContent = "невозможно поставить";
        };
    };
};

// Очистка поля 
function clear_grid() {
    let _cells_ = document.querySelectorAll('.cell');
    _cells_.forEach(e => {
        let ind = names.indexOf(e.textContent);
        if (!stack.includes(ind)) {
            e.style.background = 'rgb(122, 167, 226)';
        };
    });
};

// Выставление корабля
function past_ship(){
    window.removeEventListener('mousemove', render_ship);
    window.removeEventListener('click', past_ship);
    if (mass.length > 0) {
        stack = [...stack, ...mass];
    
        check_menu(mass);
        mass.length = 0;
        menu.style.display = 'none';
    };
};

// Проверка выбора в меню, изменение состояния отображения и формирование массива flot
function check_menu(mass) {
    let len_ship = model_obj[model_ship][0];
    let cnt_ship = model_obj[model_ship][1];
    let temp_arr = [];
    if (len_ship == 4) {
        count_l++;
        lincor.style.display = 'none';
        temp_arr = [...mass];
        flot.push([model_ship, temp_arr, len_ship, fill_empty(temp_arr)]);
    }
    else if (len_ship == 3){
        temp_arr = [...mass];
        flot.push([model_ship, temp_arr, len_ship, fill_empty(temp_arr)]);
        if (count_k == cnt_ship){
            kreiser.style.display = 'none';
            count_k++;
        }else {
            count_k++;
        };
    }else if (len_ship == 2){
        temp_arr = [...mass];
        flot.push([model_ship, temp_arr, len_ship, fill_empty(temp_arr)]);
        if (count_t == cnt_ship){
            traller.style.display = 'none';
            count_t++;
        }else {
            count_t++;
        };
    }else if (len_ship == 1){
        temp_arr = [...mass];
        flot.push([model_ship, temp_arr, len_ship, fill_empty(temp_arr)]);
        if (count_u == cnt_ship){
            undersheap.style.display = 'none';
            count_u++;
        }else {
            count_u++;
        };
    };
    check_start();
}

// Удаляем корабль
function del_ship(){
    flot.forEach((unit, index) => {
        let m = names.indexOf(val);
        if (unit[1].includes(m)) {
            temp_unit = unit[0];
            unit[1].forEach(e => {
                if (stack.includes(e)) {
                    stack = stack.filter(elem => elem != e);
                };
            });
            unit[3].forEach(e => {
                if (empty_flot.includes(e)){
                    empty_flot = empty_flot.filter(elem => elem != e);
                };
            });
            flot = flot.filter(el => el != unit);
        }; 
    });
    if (temp_unit == 'Линкор') {
        count_l--;
    };
    if (temp_unit == 'Крейсер') {
        count_k--;
    };
    if (temp_unit == 'Миноносец') {
        count_t--;
    };
    if (temp_unit == 'Подводная лодка') {
        count_u--;
    };
    clear_grid();
    fill_empty(stack);
    check_start();
};


// заполняем стэк пустых ячеек вокруг кораблей
function fill_empty(temp_arr) {
    let empty_mass = [];
    let step_indx = [-10, -9, 1, 11, 10, 9, -1, -11];
    temp_arr.forEach(e => {
        let start_index = e;
        let letter_num_start = names[start_index].slice(0,1).charCodeAt();
        step_indx.forEach(v => {
            let temp_index = e + v;
            if (temp_index >= 0 && temp_index <= 99) {
                let letter_num= names[temp_index].slice(0,1).charCodeAt();
                if (!empty_mass.includes(temp_index) && !temp_arr.includes(temp_index) && ((letter_num + 1 == letter_num_start) || (letter_num - 1 == letter_num_start) || (letter_num == letter_num_start) )) {
                    empty_mass.push(temp_index);
                };
            };
        });
    });
    empty_mass.forEach(el => {
        if (!empty_flot.includes(el)) {
            empty_flot.push(el);
        };
    });
    return empty_mass;
}

// Проверка установки
function checking() {
    let name_flot = [];
    flot.forEach(unit => {
        if (unit[0] == 'Линкор') {
            name_flot.push(unit[0]);
            if (count_l >= 2) {
                lincor.style.display = 'none';
            }else {
                lincor.style.display = 'block';
            };
        }
        else if (unit[0] == 'Крейсер') {
            if (!name_flot.includes(unit[0])) {
                name_flot.push(unit[0]);
            };
            if (count_k >= 3) {
                kreiser.style.display = 'none';
            }else {
                kreiser.style.display = 'block';
            };
        }
        else if (unit[0] == 'Миноносец') {
            if (!name_flot.includes(unit[0])) {
                name_flot.push(unit[0]);
            };
            if (count_t >= 4) {
                traller.style.display = 'none';
            }else {
                traller.style.display = 'block';
            };
        } 
        else if (unit[0] == 'Подводная лодка') {
            if (!name_flot.includes(unit[0])) {
                name_flot.push(unit[0]);
            };
            if (count_u >= 5) {
                undersheap.style.display = 'none';
            }else {
                undersheap.style.display = 'block';
            };
        };
    });
    if (!name_flot.includes('Линкор')) {
        lincor.style.display = 'block';
    };
    if (!name_flot.includes('Крейсер')) {
        kreiser.style.display = 'block';
    };
    if (!name_flot.includes('Миноносец')) {
        traller.style.display = 'block';
    };
    if (!name_flot.includes('Подводная лодка')) {
        undersheap.style.display = 'block';
    };
};


// Блок для бота
let stack_b = []; 
let empty_b = [];
let ship_b = [];
let cells = Object.keys(data);

//  расставляем корабли  в режиме авто
function start_past(){
    let sheaps_arr = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    let tmp = 0;
    sheaps_arr.forEach(sheap => {
        tmp += sheap;
        while(stack_b.length != tmp){
            past_sheaps(sheap, empty_b, ship_b, stack_b, cells);
        };
    });
};

function past_sheaps(sheap, empty_b, ship_b, stack_b, cells){
    let rand_index = Math.floor(Math.random()*100);
    let oriental = Math.random() < 0.5 ? 1 : 2;
    let x = cells[rand_index];
    let count = 0 ;
    let h = 0;
    let v = 0;
    let tmp_arr = [];

    if(oriental == 1){
        while (count != sheap){

            if (x.slice(1,) >= 7){
                let tmp_v1 = cells[rand_index-v];
                if (empty_b.includes(tmp_v1)){
                    break
                }else{
                    tmp_arr.push(tmp_v1);
                    v = v + 10;
                    count++;
                };
            }else{
                let tmp_v2 = cells[rand_index+v];
                if (empty_b.includes(tmp_v2)){
                    break;
                }else{
                    tmp_arr.push(tmp_v2);
                    v = v + 10;
                    count++;
                };
            };
        };
    }else{
        while (count != sheap){
            
            if ((x.slice(0,1)).charCodeAt(0) >= 72){
                let tmp_v3 = cells[rand_index-h];
                if (empty_b.includes(tmp_v3)){
                    break;
                }else{
                    tmp_arr.push(tmp_v3);
                    h++;
                    count++;
                };
            }else{
                let tmp_v4 = cells[rand_index+h];
                if (empty_b.includes(tmp_v4)){
                    break;
                }else{
                    tmp_arr.push(tmp_v4);
                    h++;
                    count++;
                };
            };
        };
    };
    if (tmp_arr.length == sheap){
        ship_b.push(tmp_arr);
        let step_indx = [-10, -9, 1, 11, 10, 9, -1, -11];
        for (let j=0; j<tmp_arr.length; j++){
            stack_b.push(tmp_arr[j]);
            empty_b.push(tmp_arr[j]);
            for (let k=0; k<step_indx.length; k++){
                let index_emp = cells.indexOf(tmp_arr[j]) + step_indx[k];
                if((index_emp >= 0) && (index_emp <= 99) && !empty_b.includes(cells[index_emp])){
                    empty_b.push(cells[index_emp]);
                };
            };
        };
    };
    count = 0; 
    h = 0; 
    v = 0;
    tmp_arr = [];
};

// Запуск игры
let flot_b = [];
let path = '../html/game.html'
function start() {
    start_past();
    ship_b.forEach(e => {
        if (e.length == 4) {
            flot_b.push(['Линкор', e, 0]);
        }else if (e.length == 3) {
            flot_b.push(['Крейсер', e, 0]);
        }else if (e.length == 2) {
            flot_b.push(['Миноносец', e, 0]);
        }else{
            flot_b.push(['Подводная лодка', e, 0]);
        };
    });
    localStorage.setItem('_player_', JSON.stringify(flot));
    localStorage.setItem('_bot_', JSON.stringify(flot_b))
    battle.setAttribute('href', path)
};
