
const apiUrl = "http://localhost:3000/tasks";


const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("tasks");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dueDateInput = document.getElementById("due-date");
const formTitle = document.getElementById("form-title");
const submitButton = document.getElementById("submit-button");
const addNewTaskButton= document.getElementById("add-new-task");
const createTaskDiv= document.getElementById("create-task-section");
const listTasksDiv= document.getElementById("list-tasks-section");
const emptylistDiv= document.getElementById("empty-task-section");


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
  console.log(reminders);
  
  reminders.forEach((reminder) => {
    
    // if (!shownReminders.has(reminder.id)) {
      alert(
        `Reminder: "${reminder.title}"\n\n${reminder.description}\nDue: ${new Date(reminder.dueDate).toLocaleString()}`
      );
      // shownReminders.add(reminder.id); 
    // }
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
function isListEmptyOrNull(list) {
  return !list || list.length === 0;
}


const displayTasks = (tasks) => {
  taskList.innerHTML = ""; 
  console.log(isListEmptyOrNull(tasks));
if (isListEmptyOrNull(tasks)){
  createTaskDiv.style.display = "none";
  listTasksDiv.style.display = "none";
  emptylistDiv.style.display = "block";
}
else{
  tasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.innerHTML = `
    <div class="form-group">            
        <label id="tasktitle"><strong>Task Title: ${task.title}</strong><br></label>
      </div>
      <div class="form-group">            
      <p id="taskdescription"><strong>Task Description:</strong> ${task.description}</p>
      </div>
      <div class="form-group">            
      <p id="duedatetime"><strong>Due Date & Time:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
      </div>     
      
      <div class="row border">
      <div class="col-md-4 border m-0">    
      ${
        task.completed
          ? `<button disabled class="btn btn-success"><i class="fas fa-check"></i>&nbsp;Completed</button>`
          : `<button  type="button" class="btn btn-success"
         onclick="markCompleted(${task.id})"><i class="fas fa-check"></i>&nbsp;Mark as Completed</button>`
      }  
        
        </div>
        <div class="col-md-2">
        ${
          task.completed
            ? ` <button disabled type="button" class="btn btn-warning" onclick="editTask(${task.id})"><i class="fas fa-edit"></i>&nbsp;Edit</button>`
            : ` <button  type="button" class="btn btn-warning" onclick="editTask(${task.id})"><i class="fas fa-edit"></i>&nbsp;Edit</button>`
        } 
        
        </div>
        
        <div class="col-md-3">
         ${
          task.completed
            ? `<button disabled type="button" class="btn btn-danger" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i>&nbsp;Delete</button>`
            : ` <button type="button" class="btn btn-danger" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i>&nbsp;Delete</button>`
        } 
        
        </div>
        </div>
    
      
    `;
    if (task.completed) {
      
      taskItem.style.opacity = "0.6";
    }
    taskList.appendChild(taskItem);
    createTaskDiv.style.display = "none";
    listTasksDiv.style.display = "block";
    emptylistDiv.style.display = "none";
  });
}
};


const defaultSubmitHandler = async (e) => {
  e.preventDefault();

  const newTask = {
    title: titleInput.value,
    description: descriptionInput.value,
    dueDate: dueDateInput.value,
  };
  console.log('1');
  createTaskDiv.style.display = "none";
  listTasksDiv.style.display = "block";
  emptylistDiv.style.display = "none";
  console.log('2');
  try {
    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    taskForm.reset();
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
    createTaskDiv.style.display = "block";
    listTasksDiv.style.display = "none";

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
        taskForm.reset();
        formTitle.innerText = "Create Task";
        submitButton.innerText = "Create Task";
        createTaskDiv.style.display = "none";
        listTasksDiv.style.display = "block";

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


