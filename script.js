const taskList = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-task');
const openSheet = document.getElementById('open-sheet');
const bottomSheet = document.getElementById('bottom-sheet');
const overlay = document.getElementById('overlay');
const hourPicker = document.getElementById('hour-picker');
const minPicker = document.getElementById('minute-picker');

let tasks = JSON.parse(localStorage.getItem('tasks_wathiq')) || [];

function setupPickers() {
    for(let i=0; i<24; i++) hourPicker.innerHTML += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
    for(let i=0; i<60; i+=5) minPicker.innerHTML += `<option value="${i}">${i.toString().padStart(2, '0')}</option>`;
}

document.getElementById('current-date').innerText = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

openSheet.addEventListener('click', () => {
    bottomSheet.classList.add('active');
    overlay.classList.add('active');
});

overlay.addEventListener('click', () => {
    bottomSheet.classList.remove('active');
    overlay.classList.remove('active');
});

// إضافة مهمة مع خيار التكرار
addBtn.addEventListener('click', () => {
    if (taskInput.value.trim() === "") return;

    const freq = document.querySelector('input[name="frequency"]:checked').value;

    const task = {
        id: Date.now(),
        text: taskInput.value,
        time: `${hourPicker.value.padStart(2, '0')}:${minPicker.value.padStart(2, '0')}`,
        frequency: freq, // 'once' or 'daily'
        completed: false,
        notifiedToday: false
    };

    tasks.push(task);
    saveAndRender();
    
    taskInput.value = "";
    bottomSheet.classList.remove('active');
    overlay.classList.remove('active');
    if (navigator.vibrate) navigator.vibrate(20);
});

function renderTasks() {
    taskList.innerHTML = "";
    tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-card ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <button class="delete-btn" onclick="deleteTask(${task.id})">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <div class="task-content" onclick="toggleTask(${task.id})">
                <div class="task-info">
                    <h3>${task.text}</h3>
                    <p>${task.frequency === 'daily' ? 'يوميًا الساعة' : 'مرة واحدة الساعة'} ${task.time}</p>
                </div>
            </div>
            <div class="task-action" onclick="toggleTask(${task.id})">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${task.completed ? '#34C759' : '#3A3A3C'}" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    ${task.completed ? '<path d="M9 12l2 2 4-4"></path>' : ''}
                </svg>
            </div>
        `;
        taskList.appendChild(div);
    });
}

function deleteTask(id) {
    if(confirm('هل تريد حذف هذا التذكير؟')) {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    }
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    if (navigator.vibrate) navigator.vibrate(50);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('tasks_wathiq', JSON.stringify(tasks));
    renderTasks();
}

// نظام الإشعارات المطور
setInterval(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let changed = false;
    tasks.forEach(task => {
        if(task.time === currentTime && !task.completed && !task.notifiedToday) {
            sendNotification(task.text);
            task.notifiedToday = true;
            
            // إذا كانت "مرة واحدة"، نحذفها أو نحددها كمكتملة بعد الإشعار
            if(task.frequency === 'once') {
                task.completed = true;
            }
            changed = true;
        }

        // إعادة ضبط notifiedToday عند منتصف الليل
        if(currentTime === "00:00") {
            task.notifiedToday = false;
            changed = true;
        }
    });

    if(changed) saveAndRender();
}, 60000);

function sendNotification(title) {
    if (Notification.permission === "granted") {
        new Notification("تذكّر - واثق", {
            body: title,
            requireInteraction: true 
        });
        let audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
    } else {
        Notification.requestPermission();
    }
}

setupPickers();
renderTasks();
