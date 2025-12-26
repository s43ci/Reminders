// المتغيرات الأساسية
const taskList = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-task');
const openSheet = document.getElementById('open-sheet');
const bottomSheet = document.getElementById('bottom-sheet');
const overlay = document.getElementById('overlay');
const hourPicker = document.getElementById('hour-picker');
const minPicker = document.getElementById('minute-picker');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// إعداد عجلة الوقت
function setupPickers() {
    for(let i=0; i<24; i++) hourPicker.innerHTML += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
    for(let i=0; i<60; i+=5) minPicker.innerHTML += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
}

// تحديث التاريخ
document.getElementById('current-date').innerText = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

// فتح وإغلاق النافذة
openSheet.addEventListener('click', () => {
    bottomSheet.classList.add('active');
    overlay.classList.add('active');
});

overlay.addEventListener('click', () => {
    bottomSheet.classList.remove('active');
    overlay.classList.remove('active');
});

// إضافة مهمة
addBtn.addEventListener('click', () => {
    if (taskInput.value.trim() === "") return;

    const task = {
        id: Date.now(),
        text: taskInput.value,
        time: `${hourPicker.value}:${minPicker.value}`,
        completed: false
    };

    tasks.push(task);
    saveAndRender();
    
    // إغلاق النافذة وتفريغ المدخلات
    taskInput.value = "";
    bottomSheet.classList.remove('active');
    overlay.classList.remove('active');

    // اهتزاز بسيط عند الإضافة
    if (navigator.vibrate) navigator.vibrate(20);
});

function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-card ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <div class="task-info">
                <h3>${task.text}</h3>
                <p>كل يوم في ${task.time}</p>
            </div>
            <div class="task-action" onclick="toggleTask(${task.id})">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${task.completed ? '#34C759' : '#3A3A3C'}" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    ${task.completed ? '<path d="M9 12l2 2 4-4"></path>' : ''}
                </svg>
            </div>
        `;
        
        // خاصية السحب للحذف (بسيطة)
        div.addEventListener('touchstart', handleTouchStart, false);
        div.addEventListener('touchmove', (e) => handleTouchMove(e, task.id, div), false);
        
        taskList.appendChild(div);
    });
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    if (navigator.vibrate) navigator.vibrate(50); // اهتزاز عند الإتمام
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
}

// فحص الإشعارات كل دقيقة
setInterval(() => {
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes()}`;
    
    tasks.forEach(task => {
        if(task.time === currentTime && !task.completed) {
            sendNotification(task.text);
        }
    });
}, 60000);

function sendNotification(title) {
    if (Notification.permission === "granted") {
        new Notification("تذكير: " + title, {
            body: "حان موعد إنجاز مهمتك",
            icon: "icon.png",
            requireInteraction: true // يبقى حتى يتفاعل المستخدم
        });
        // صوت خفيف (اختياري)
        let audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play();
    } else {
        Notification.requestPermission();
    }
}

// منطق السحب (Swipe) للحذف مبسط
let xDown = null;                                                        
function handleTouchStart(evt) { xDown = evt.touches[0].clientX; }                                         
function handleTouchMove(evt, id, el) {
    if ( ! xDown ) return;
    let xUp = evt.touches[0].clientX;                                    
    let xDiff = xDown - xUp;
    if ( xDiff > 150 ) { // سحب لليمين في RTL (يعني لليسار)
        tasks = tasks.filter(t => t.id !== id);
        el.style.transform = "translateX(100%)";
        setTimeout(saveAndRender, 200);
        xDown = null;
    }
}

setupPickers();
renderTasks();
