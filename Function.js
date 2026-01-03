document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addTaskBtn");
  const input = document.getElementById("taskInput");
  const listEl = document.getElementById("branch-scroll-area");

  const STORAGE_KEY = "budding_tasks_v1";

  // ----- Load tasks on startup -----
  const tasks = loadTasks();
  tasks.forEach(renderTask);

  // ----- Add task handlers -----
  addBtn.addEventListener("click", addTask);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  function addTask() {
    const text = input.value.trim();
    if (!text) return;

    const newTask = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text: text
    };

    tasks.push(newTask);
    saveTasks(tasks);

    renderTask(newTask);
    input.value = "";
  }

  // ----- Render one task (branch) -----
  function renderTask(task) {
    const container = document.createElement("div");
    container.className = "branch-container";
    container.dataset.id = task.id;

    container.innerHTML = `
      <img src="Left_Branch.png" class="branch-img" alt="branch">
      <div class="task-text">${escapeHtml(task.text)}</div>
      <button class="done-btn" aria-label="Mark done">✅</button>
    `;

    // Remove task when ✅ clicked
    container.querySelector(".done-btn").addEventListener("click", () => {
      // Remove from DOM
      container.remove();

      // Remove from array + storage
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx !== -1) {
        tasks.splice(idx, 1);
        saveTasks(tasks);
      }
    });

    listEl.appendChild(container);
  }

  // ----- Storage helpers -----
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("Could not load tasks:", err);
      return [];
    }
  }

  function saveTasks(taskArray) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(taskArray));
    } catch (err) {
      console.warn("Could not save tasks:", err);
    }
  }

  // ----- Security: avoid HTML injection -----
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[ch]));
  }
});
