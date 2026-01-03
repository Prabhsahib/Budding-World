document.addEventListener("DOMContentLoaded", () => {
  // ---------- BACKGROUND BY TIME ----------
  function setBackgroundByTime() {
    const hour = new Date().getHours(); // 0–23 (user local time)

    let bg = "Morning_sky.png"; // default

    // Night: 6:00 pm – 5:59 am
    if (hour >= 18 || hour < 6) {
      bg = "Night_sky.png";
    }
    // Morning: 6:00 am – 11:59 am
    else if (hour >= 6 && hour < 12) {
      bg = "Morning_sky.png";
    }
    // Afternoon: 12:00 pm – 4:59 pm
    else if (hour >= 12 && hour < 17) {
      bg = "Afternoon_sky.png";
    }
    // Evening: 5:00 pm – 5:59 pm
    else {
      bg = "Evening_sky.png"; // 5:00 pm – 5:59 pm
    }

    // Put background on <html> so CSS body backgrounds don't override it
    document.documentElement.style.background =
      `url("${bg}") center / cover fixed no-repeat`;
    document.body.style.background = "transparent";
  }

  setBackgroundByTime();
  setInterval(setBackgroundByTime, 60 * 1000);

  // ---------- TASKS ----------
  const addBtn = document.getElementById("addTaskBtn");
  const input = document.getElementById("taskInput");
  const listEl = document.getElementById("branch-scroll-area");

  const STORAGE_KEY = "budding_tasks_v1";

  const tasks = loadTasks();
  tasks.forEach(renderTask);

  addBtn.addEventListener("click", addTask);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  function addTask() {
    const text = input.value.trim();
    if (!text) return;

    const newTask = {
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      text
    };

    tasks.push(newTask);
    saveTasks(tasks);

    renderTask(newTask);
    input.value = "";
  }

  function renderTask(task) {
    const container = document.createElement("div");
    container.className = "branch-container";
    container.dataset.id = task.id;

    container.innerHTML = `
      <img src="Left_Branch.png" class="branch-img" alt="branch">
      <div class="task-text">${escapeHtml(task.text)}</div>
      <button class="done-btn" aria-label="Mark done">✅</button>
    `;

    // Done button: remove from screen + remove from storage
    container.querySelector(".done-btn").addEventListener("click", () => {
      container.remove();

      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx !== -1) {
        tasks.splice(idx, 1);
        saveTasks(tasks);
      }
    });

    listEl.appendChild(container);
  }

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
