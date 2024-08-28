let data = JSON.parse(localStorage.getItem('_data_')); // данные общие
let player = JSON.parse(localStorage.getItem('_player_')); // данные о раставленных кораблях игрока
let bot = JSON.parse(localStorage.getItem('_bot_')); // данные о раставленных кораблях бота
let names = Object.keys(data); // массив имен ячеек

const grid_b = document.getElementById('grid_container'); // получаем поле бота
const grid_p = document.getElementById('player_grid'); // получаем поле игрока
const gun = document.getElementById('gun'); // пушка
const boom = document.getElementById('boom'); // audio
const audio = document.getElementById('audio'); // audio
const music_box = document.getElementById('music_container'); // audio
const helper = document.getElementById('helper'); // подсказка
const close_h = document.getElementById('close'); // закрытие подсказки
const end_game = document.getElementById('end_game'); // вызов меню при окончании игры
const end_title = document.getElementById('end_title'); // информация о победе или поражении
const msg = document.getElementById('msg'); // Подсказка хода
const log_title = document.getElementById('log_title'); // Шапка логов
const log_wrap = document.getElementById('log_wrap'); // Поле для логов
const exit_container = document.getElementById('exit_container'); // Кнопка выхода

grid_b.style.display = 'grid'; // открываем поле игры

let stack_bot = []; // стэк раставленных кораблей бота
let stack_player = []; // стэк раставленных кораблей игрока
let steps_player = []; // стек попаданий игрока
let steps_bot = []; // стек попаданий бота
let empty_steps = []; // стек промахов бота
let mass_p = []; // массив кораблей игрока
let mass_b = []; // массив кораблей бота
let count_step = 0; // Счётчик ходов игрока
let attack_key = true
// let fract = [] // массив вероятного корабля
// let vars = [] // массив вероятных ходов при попадании в корабль

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    // audio.play();
});
music_box.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
    }else {
        audio.pause();
    };
});

exit_container.onclick = exit_func;

// создаем ячейки поля
names.forEach(e => {
    let cell_b = document.createElement('div');
    let cell_p = document.createElement('div');
    cell_b.classList.add('cell');
    cell_p.classList.add('player_cell');
    cell_b.textContent = e;
    cell_p.textContent = e;
    cell_b.style.background = 'rgb(122, 167, 226)';
    cell_p.style.background = 'rgb(122, 167, 226)';
    grid_b.appendChild(cell_b);
    grid_p.appendChild(cell_p);

    cell_b.onclick = game;
    cell_b.addEventListener('click', move);
    grid_p.classList.add('ative_grid');
    msg.textContent = 'Ваш ход';
});

// расставляем корабли бота
bot.forEach(ship => {
    let _cells_ = document.querySelectorAll('.cell');
    ship[1].forEach(e => {
        let index = names.indexOf(e);
        // _cells_[index].style.background = 'black'; // Настройка видимости кораблей
        stack_bot.push(_cells_[index].textContent);
    });
    mass_b.push([ship[0], ship[1], 0]);
});

// расставляем корабли игрока
player.forEach(ship => {
    let _cells_p_ = document.querySelectorAll('.player_cell');
    ship[1].forEach(e => {
        _cells_p_[e].style.background = 'black';
        stack_player.push(e);
    });
    mass_p.push([ship[0], ship[1], 0]);
});

// ФУНКЦИИ
// Игра
function game(event){
    if (attack_key) run_p(event);
};

// Ход игрока
function run_p(event){
    let _cells_ = document.querySelectorAll('.cell');
    let name = event.target.textContent;
    let index = names.indexOf(name);
    boom.play();
    event.target.onclick = null;
    logger(name, stack_bot, 'player', mass_b);
    count_step++;
    if (stack_bot.includes(name)) {
        change_color_b(name, _cells_, mass_b);
        steps_player.push(name);
    }else{
        // document.body.requestPointerLock(); //новый способ отключать указатель мыши
        grid_p.classList.remove('ative_grid');
        msg.textContent = 'Ход соперника';
        _cells_[index].style.background = 'white';
        grid_b.classList.add('ative_grid');
        attack_key = false
        let pause_attack = setTimeout(run_logic_bot, 1500);
    };
    mass_b = mass_b.filter(el => el[2] != el[1].length);
    if (stack_bot.length == steps_player.length) {
        end_title.textContent = 'ПОБЕДА';
        let date_game = data_log();
        localStorage.setItem('count_steps_player', count_step);
        localStorage.setItem('date_game', date_game);
        final();
    };
};

// Ход бота
// function run_b(){
//     if (stack_player.length == steps_bot.length) {
//         end_title.textContent = 'ПОРАЖЕНИЕ';
//         final();
//         return
//     };
//     let _cells_p_ = document.querySelectorAll('.player_cell');
//     step = Math.floor(Math.random()*100);
//     while (steps_bot.includes(step) || empty_steps.includes(step)) {
//         step = Math.floor(Math.random()*100);
//     };
//     logger(step, stack_player, 'bot', mass_p);
//     if (stack_player.includes(step)) {
//         change_color_p(step, _cells_p_,  mass_p);
//         steps_bot.push(step);
//         smart_empty(step);
//         pause_attack = setTimeout(run_b, 1500);
//     }
//     else {
//         grid_p.classList.add('ative_grid');
//         grid_b.classList.remove('ative_grid');
//         msg.textContent = 'Ваш ход';
//         _cells_p_[step].style.background = 'white';
//         empty_steps.push(step);
//         // document.exitPointerLock(); // включить указатель мыши по новому способу
//         attack_key = true;
//     };
//     mass_p = mass_p.filter(el => el[2] != el[1].length);
// };

// логирование ходов
function logger(step, stack, whoose, mass) {
    let log = document.createElement('p');
    let clr;
    clr = (whoose == 'bot') ? 'red' : 'blue';
    if (!stack.includes(step)) {
        log.textContent = 'Промах';
        log.style.color = clr;
        log.textContent = `${whoose}: ${log.textContent}`;
        log_wrap.insertAdjacentHTML("afterbegin", '<p style="color:' + clr + '">' + log.textContent + '</p>');
    }else{
        mass.forEach(elem => {
            if (elem[1].includes(step)){
                elem[2]++;
            };
            if (elem[1].length == elem[2]){
                log.textContent = `Уничтожен ${elem[0]}`;
                log.style.color = clr;
                log.textContent = `${whoose}: ${log.textContent}`;
                log_wrap.insertAdjacentHTML("afterbegin", '<p style="color:' + clr + '">' + log.textContent + '</p>');
            }else {
                if (elem[1].includes(step)) {
                    log.textContent = `Подбит корабль`;
                    log.style.color = clr;
                    log.textContent = `${whoose}: ${log.textContent}`;
                    log_wrap.insertAdjacentHTML("afterbegin", '<p style="color:' + clr + '">' + log.textContent + '</p>');
                };
                msg.textContent = 'Попадание';
            };
        });
    };
};

//Смена Цвета кораблей бота при попадании
function change_color_b(name, cells, mass_ship){
    mass_ship.forEach(elem => {
        if (elem[1].length == elem[2]){
            elem[1].forEach(e => {
                let index = names.indexOf(e);
                cells[index].style.background = 'red';
                msg.textContent = 'Вы уничтожили корабль';
            });
        };
        if (elem[1].length != elem[2]) {
            elem[1].forEach(e => {
                if (name == e) {
                    let index = names.indexOf(e);
                    cells[index].style.background = 'orange';
                };
            });
        };
    });
};

// Смена Цвета кораблей игрока при попадании
function change_color_p(name, cells, mass_ship){
    mass_ship.forEach(elem => {
        if (elem[1].length == elem[2]){
            elem[1].forEach(e => {
                cells[e].style.background = 'red';
                msg.textContent = 'Ваш корабль уничтожен';
            });
        };
        if (elem[1].length != elem[2]) {
            elem[1].forEach(e => {
                if (name == e) {
                    cells[e].style.background = 'orange';
                };
            });
        };
    });
};

// Получение времени и даты 
function data_log(){
    const date = new Date();
    const currentDate = date.toLocaleDateString();
    const currentTime = date.toLocaleTimeString();
    return `${currentDate} ${currentTime}`;
};

// создаем движение во время выстрела
function move(){
    gun.style.transform = 'translateY(10px)';
    gun.style.transition = 'transform .8s';
    setTimeout(()=>{
        gun.style.transform = 'translateY(0px)' ;
    }, 500);
};

// Финал
function final() {
    end_game.style.display = 'flex';
    grid_b.style.display = 'none';
    grid_p.style.display = 'none';
    // gun.removeEventListener('click', open_grid);
    helper.style.display = 'none';
    msg.style.display = 'none';
    log_title.style.display = 'none';
    log_wrap.style.display = 'none';
};

// Выход из игры
function exit_func() {
    localStorage.setItem('_mass_p_', mass_p);
    localStorage.setItem('_mass_b_', mass_b);
    exit_container.setAttribute('href', '../../index.html');
};


// ------------------------------logic bot------------------------------------- 
let stamp = [] // предположительные ходы при попадании на многопалубный корабль
let vars = [] // временный стэк вероятных ходов

//  Логические ходы бота
function run_logic_bot(){
    if (!check_final()) return;

    let _cells_p_ = document.querySelectorAll('.player_cell');
    let step = choice_step();
    logger(step, stack_player, 'bot', mass_p);

    if (!stack_player.includes(step)) {
        grid_p.classList.add('ative_grid');
        grid_b.classList.remove('ative_grid');
        msg.textContent = 'Ваш ход';
        _cells_p_[step].style.background = 'white';
        empty_steps.push(step);
        attack_key = true;
        return;
    };
    change_color_p(step, _cells_p_,  mass_p);
    let cur = mass_p.find(e => e[1].includes(step))[1];
    let count_attack = mass_p.find(e => e[1].includes(step))[2];
    steps_bot.push(step);
    if (cur.length == count_attack) {
        stamp.length = 0;
        vars.length = 0;
        smart_empty(step);
    };
    if (cur.length > 1 && cur.length != count_attack) {
        let step_vars = [-10, 1, 10, -1];
        vars = [...checking_vars(step, step_vars)];
        next_steps(step);
    };
    mass_p = mass_p.filter(el => el[2] != el[1].length);
    pause_attack = setTimeout(run_logic_bot, 1500);
}

// Создание нового поля вероятности при попадании в две клетки корабля
function next_steps(arg) {
    if (stack_player.includes(arg)) stamp.push(arg);
    if (stamp.length > 1){
        let next_step = Math.abs(stamp[0] - stamp[1]);
        if (stamp[0] > stamp[1]) stamp[0], stamp[1] = stamp[1], stamp[0];
        vars = [
            check_num(stamp[0] - next_step), 
            check_num(stamp[1] + next_step),
            check_num(stamp[0] - next_step*2),
            check_num(stamp[1] + next_step*2)].filter(e => e != undefined);
        console.log(step, vars, 'next_step')
    };
};

// выбор ячейки хода
function choice_step() {
    step = Math.floor(Math.random()*100);
    while (steps_bot.includes(step) || empty_steps.includes(step)) {
        step = Math.floor(Math.random()*100);
    };
    if (vars.length > 0) {
        step = vars[Math.floor(Math.random() * vars.length)]
        if (stamp > 1) step = vars[0];
        vars = vars.filter(e => e != step)
    };
    return step;
};

// проверка выигрыша бота
function check_final() {
    const txt = 'ПОРАЖЕНИЕ';
    if (stack_player.length != steps_bot.length) return true;
    end_title.textContent = txt;
    final();
    return false;
};

// заполнение массива пустых ячеек вокруг убитого корабля
function smart_empty(step){
    let step_empty_i = [-10, -9, 1, 11, 10, 9, -1, -11];
    let u_ship = mass_p.filter(ship => {
        if (ship[1].length == ship[2] ) {
            return ship[1].includes(step);
        };
    });

    if (u_ship.length != 0){
        u_ship[0][1].forEach(elem => {
            empty_steps = [...empty_steps, ...checking(elem, step_empty_i)];
        });
    }; 
};

//  Добавление пустых ячеек в массив пустых ячеек после уничтожения корабля
function checking(arg, arr) {
    let temp_arr = []
    arr.forEach(a => {
        let w = a + arg;
        if ([
            chek_is_range(w),
            check_includ_stack(w),
            check_includ_empty(w),
            check_jump_l(a, arg),
            check_jump_r(a, arg)
        ].every(el => {return el == true}) && !temp_arr.includes(w)) {
            temp_arr.push(w);
        };
    });
    return temp_arr;
};

//  Добавление вероятого расположения корабля
function checking_vars(arg, arr) {
    let temp_arr = []
    arr.forEach(a => {
        let w = a + arg;
        if ([
            chek_is_range(w),
            check_includ_empty(w),
            check_includ_steps(w),
            check_jump_l(a, arg),
            check_jump_r(a, arg)
        ].every(el => {return el == true}) && !temp_arr.includes(w)) {
            temp_arr.push(w);
        };
    });
    return temp_arr;
};

// проверка значения 
function check_num(arg){
    if ([
        chek_is_range(arg),
        check_includ_empty(arg),
        check_includ_steps(arg),
    ].every(el => {return el == true})) {
        return arg;
    };
};

// проверка на вхождение числа в диапазон
function chek_is_range(x) {
    return (x) >= 0 && (x) <= 99;
};
//  проверка на отсутствеи числа в стеке кораблей 
function check_includ_stack(x) {
    return !stack_player.includes(x);
};
//  проверка на отсутствие числа в стеке пустых значений
function check_includ_empty(x) {
    return !empty_steps.includes(x);
};
// проверка на отсутствие числа в стеке попаданий бота
function check_includ_steps(x) {
    return !steps_bot.includes(x);
};
//  проверка числа на отсутствие переноса на левую сторону поля
function check_jump_l(e, arg) {
    if (arg % 10 == 9 || arg == 9) {
        return ![-9, 1, 11].includes(e);
    };
    return true;
};
//  проверка числа на отсутствие переноса на правую сторону поля
function check_jump_r(e, arg) {
    if (arg % 10 == 0 || arg == 0) {
        return ![-11, -1, 9].includes(e);
    };
    return true;
};
