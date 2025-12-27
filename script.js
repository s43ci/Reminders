let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentEditingId = null;

// عناصر الواجهة
const taskList = document.getElementById('task-list');
const bottomSheet = document.getElementById('bottom-sheet');
const overlay = document.getElementById('overlay');
const taskInput = document.getElementById('task-input');
const noteInput = document.getElementById('note-input');
const dateDisplay = document.getElementById('date-display');

// عرض التاريخ
const options = { weekday: 'long', day: 'numeric', month: 'long' };
dateDisplay.innerText = new Date().toLocaleDateString('ar-SA', options);

function saveToLocal() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="task-header" onclick="toggleTask('${task.id}')">
                <div style="flex: 1;">
                    <div class="task-title">${task.title}</div>
                    <div class="task-note">${task.note}</div>
                </div>
                <div class="task-status">${task.completed ? '✔' : ''}</div>
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="editTask('${task.id}')" style="background:none; border:none; color:#0a84ff; font-family:inherit; cursor:pointer;">تعديل</button>
                <button onclick="deleteTask('${task.id}')" style="background:none; border:none; color:#ff453a; font-family:inherit; cursor:pointer;">حذف</button>
            </div>
        `;
        taskList.appendChild(card);
    });
}

function openSheet(isEdit = false) {
    bottomSheet.classList.add('active');
    overlay.style.display = 'block';
    if (!isEdit) {
        document.getElementById('sheet-title').innerText = 'مهمة جديدة';
        taskInput.value = '';
        noteInput.value = '';
        currentEditingId = null;
    }
}

function closeSheet() {
    bottomSheet.classList.remove('active');
    overlay.style.display = 'none';
}

document.getElementById('save-task-btn').addEventListener('click', () => {
    if (!taskInput.value.trim()) return;

    if (currentEditingId) {
        const task = tasks.find(t => t.id === currentEditingId);
        task.title = taskInput.value;
        task.note = noteInput.value;
    } else {
        tasks.push({
            id: Date.now().toString(),
            title: taskInput.value,
            note: noteInput.value,
            completed: false
        });
    }
    
    saveToLocal();
    renderTasks();
    closeSheet();
});

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    saveToLocal();
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveToLocal();
    renderTasks();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    currentEditingId = id;
    taskInput.value = task.title;
    noteInput.value = task.note;
    document.getElementById('sheet-title').innerText = 'تعديل المهمة';
    openSheet(true);
}

document.getElementById('open-sheet-btn').addEventListener('click', () => openSheet());
document.getElementById('close-sheet-btn').addEventListener('click', closeSheet);
overlay.addEventListener('click', closeSheet);

renderTasks();
