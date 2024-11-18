
const apiUrl = "http://localhost:3000/tasks";


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


const showRemindersAsAlerts = (reminders) => {
  reminders.forEach((reminder) => {
    
    if (!shownReminders.has(reminder.id)) {
      alert(
        `Reminder: "${reminder.title}"\n\n${reminder.description}\nDue: ${new Date(reminder.dueDate).toLocaleString()}`
      );
      shownReminders.add(reminder.id); 
    }
  });
};


setInterval(fetchReminders, 60000); 


fetchReminders();


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


resetButton.addEventListener("click", () => {
 
  formTitle.innerText = "Create Task";
  submitButton.innerText = "Create Task";
});


const displayTasks = (tasks) => {
  taskList.innerHTML = ""; 
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
      
      taskItem.style.opacity = "0.6";
    }
    taskList.appendChild(taskItem);
  });
};

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


taskForm.onsubmit = defaultSubmitHandler;


const markCompleted = async (id) => {
  try {
    await fetch(`${apiUrl}/${id}/complete`, { method: "PATCH" });
    fetchTasks();
  } catch (error) {
    console.error("Error marking task as completed:", error);
  }
};


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


const editTask = async (id) => {
  try {
   
    const tasks = await fetch(apiUrl).then((res) => res.json());
    const task = tasks.find((t) => t.id === id);

    const utcDate = task.dueDate;
    const localDate = new Date(utcDate);

    
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0"); 
    const day = String(localDate.getDate()).padStart(2, "0");
    const hours = String(localDate.getHours()).padStart(2, "0");
    const minutes = String(localDate.getMinutes()).padStart(2, "0");

    
    const localIso = `${year}-${month}-${day}T${hours}:${minutes}`;

    
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    dueDateInput.value = localIso  
    console.log(task.dueDate, localIso);

   
    formTitle.innerText = "Edit Task";
    submitButton.innerText = "Update Task";

    
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
        taskForm.onsubmit = defaultSubmitHandler; 
      } catch (error) {
        console.error("Error updating task:", error);
      }
    };
  } catch (error) {
    console.error("Error loading task for edit:", error);
  }
};


const deleteTask = async (id) => {
  try {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    fetchTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
};

fetchTasks();
