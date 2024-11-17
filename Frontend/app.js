// API Base URL (change if needed)
const apiUrl = "http://localhost:3000/tasks";

// DOM elements
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("tasks");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dueDateInput = document.getElementById("due-date");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");

const shownReminders = new Set();

const fetchReminders = async () => {
  try {
    const response = await fetch("http://localhost:3000/reminders");
    const reminders = await response.json();
    showRemindersAsAlerts(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
  }
};

// Show reminders as alerts
const showRemindersAsAlerts = (reminders) => {
  reminders.forEach((reminder) => {
    // Only show alert if it hasn't already been shown
    if (!shownReminders.has(reminder.id)) {
      alert(
        `Reminder: "${reminder.title}"\n\n${reminder.description}\nDue: ${new Date(reminder.dueDate).toLocaleString()}`
      );
      shownReminders.add(reminder.id); // Mark this reminder as shown
    }
  });
};

// Periodically fetch reminders
setInterval(fetchReminders, 60000); // Fetch reminders every minute

// Initial fetch
fetchReminders();

// Fetch all tasks and display them
const fetchTasks = async () => {
  try {
    const response = await fetch(apiUrl);
    const tasks = await response.json();
    displayTasks(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const resetButton = document.getElementById("reset");

// Add a click event listener
resetButton.addEventListener("click", () => {
  // Clear additional data or perform custom actions
  formTitle.innerText = "Create Task";
  submitButton.innerText = "Create Task";
});

// Display tasks in the UI
const displayTasks = (tasks) => {
  taskList.innerHTML = ""; // Clear current list
  tasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.innerHTML = `
      <strong>${task.title}</strong><br>
      <p>${task.description}</p>
      <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
      <div class="task-actions">
      ${
        task.completed
          ? `<button disabled style="background-color: grey; color: #fff;">Completed</button>`
          : `<button onclick="markCompleted(${task.id})">Mark as Completed</button>`
      }
        <button class="edit" onclick="editTask(${task.id})">Edit</button>
        <button onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    if (task.completed) {
      // taskItem.style.textDecoration = "line-through";
      taskItem.style.opacity = "0.6";
    }
    taskList.appendChild(taskItem);
  });
};
// <button class="snooze-button" onclick="snoozeTask(${task.id})">Snooze</button>

// Default form submission handler (for creating tasks)
const defaultSubmitHandler = async (e) => {
  e.preventDefault();

  const newTask = {
    title: titleInput.value,
    description: descriptionInput.value,
    dueDate: dueDateInput.value,
  };

  try {
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    resetButton.click();
    fetchTasks();
  } catch (error) {
    console.error("Error creating task:", error);
  }
};

// Set the default form submission handler
taskForm.onsubmit = defaultSubmitHandler;

// Mark task as completed
const markCompleted = async (id) => {
  try {
    await fetch(`${apiUrl}/${id}/complete`, { method: "PATCH" });
    fetchTasks();
  } catch (error) {
    console.error("Error marking task as completed:", error);
  }
};

// Snooze task
const snoozeTask = async (id) => {
  const snoozeMinutes = prompt("Enter minutes to snooze: ");
  if (!snoozeMinutes || isNaN(snoozeMinutes)) {
    alert("Invalid snooze time");
    return;
  }

  try {
    await fetch(`${apiUrl}/${id}/snooze`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snoozeMinutes: parseInt(snoozeMinutes) }),
    });
    fetchTasks();
  } catch (error) {
    console.error("Error snoozing task:", error);
  }
};

// Edit task
const editTask = async (id) => {
  try {
    // Fetch the task to edit
    const tasks = await fetch(apiUrl).then((res) => res.json());
    const task = tasks.find((t) => t.id === id);

    const utcDate = task.dueDate;
    const localDate = new Date(utcDate);

    // Extract components
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    // Format as 'YYYY-MM-DDTHH:mm'
    const localIso = `${year}-${month}-${day}T${hours}:${minutes}`;

    // Pre-fill the form with current task details
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    dueDateInput.value = localIso  // Remove the "Z" from ISO string
    console.log(task.dueDate, localIso);

    // Update form title and button text
    formTitle.innerText = "Edit Task";
    submitButton.innerText = "Update Task";

    // Change form submission behavior to update the task
    taskForm.onsubmit = async (e) => {
      e.preventDefault();

      const updatedTask = {
        title: titleInput.value,
        description: descriptionInput.value,
        dueDate: dueDateInput.value,
      };

      try {
        await fetch(`${apiUrl}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
        });
        fetchTasks();
        resetButton.click();
        formTitle.innerText = "Create Task";
        submitButton.innerText = "Create Task";
        taskForm.onsubmit = defaultSubmitHandler; // Reset form to default behavior
      } catch (error) {
        console.error("Error updating task:", error);
      }
    };
  } catch (error) {
    console.error("Error loading task for edit:", error);
  }
};

// Delete task
const deleteTask = async (id) => {
  try {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    fetchTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

// Initial fetch
fetchTasks();
