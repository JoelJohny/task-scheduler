const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());


app.use(bodyParser.json());


const filePath = path.join(__dirname, "tasks.json");


const readTasks = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error);
    return [];
  }
};


const writeTasks = (tasks) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing tasks:", error);
  }
};


app.post("/tasks", (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({ message: "Title and dueDate are required" });
  }

  const tasks = readTasks();
  const newTask = {
    id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1, 
    title,
    description: description || "",
    dueDate: new Date(dueDate).toISOString(),
    completed: false,
  };
  console.log(dueDate,newTask);
  

  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json({ message: "Task created", task: newTask });
});

app.get("/tasks", (req, res) => {
    const tasks = readTasks(); 
    res.status(200).json(tasks); 
  });
  

app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description, dueDate } = req.body;

  const tasks = readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title || tasks[taskIndex].title,
    description: description || tasks[taskIndex].description,
    dueDate: dueDate ? new Date(dueDate).toISOString() : tasks[taskIndex].dueDate,
  };

  writeTasks(tasks);
  res.status(200).json({ message: "Task updated", task: tasks[taskIndex] });
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const tasks = readTasks();
  const updatedTasks = tasks.filter((task) => task.id !== taskId);

  if (tasks.length === updatedTasks.length) {
    return res.status(404).json({ message: "Task not found" });
  }

  writeTasks(updatedTasks);
  res.status(200).json({ message: "Task deleted" });
});


app.patch("/tasks/:id/complete", (req, res) => {
  const taskId = parseInt(req.params.id);
  const tasks = readTasks();
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.completed = true;
  writeTasks(tasks);
  res.status(200).json({ message: "Task marked as completed", task });
});


app.patch("/tasks/:id/snooze", (req, res) => {
  const taskId = parseInt(req.params.id);
  const { snoozeMinutes } = req.body;

  if (!snoozeMinutes) {
    return res.status(400).json({ message: "Snooze minutes are required" });
  }

  const tasks = readTasks();
  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  task.dueDate = new Date(new Date(task.dueDate).getTime() + snoozeMinutes * 60000).toISOString();
  writeTasks(tasks);
  res.status(200).json({ message: "Task snoozed", task });
});


// cron.schedule("*/1 * * * *", () => {
//   const tasks = readTasks();
//   const now = new Date();
//   const soon = new Date(now.getTime() + 15 * 60000); 

//   tasks.forEach((task) => {
//     if (new Date(task.dueDate) <= soon && !task.completed) {
//       console.log(`Reminder: Task "${task.title}" is due soon!`);
//     }
//   });
// });

// const remindersFilePath = path.join(__dirname, "reminders.json");


const readReminders = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data.filter(reminder => !reminder.completed);
    // return JSON.parse(data);
  } catch (error) {
    console.error("Error reading reminders:", error);
    return [];
  }
};


// const writeReminders = (reminders) => {
//   try {
//     fs.writeFileSync(remindersFilePath, JSON.stringify(reminders, null, 2), "utf8");
//   } catch (error) {
//     console.error("Error writing reminders:", error);
//   }
// };

// cron.schedule("*/1 * * * *", () => {
//   const tasks = readTasks();
//   const now = new Date();
//   const soon = new Date(now.getTime() + 15 * 60000); 

//   const reminders = tasks
//     .filter((task) => new Date(task.dueDate) <= soon && !task.completed)
//     .map((task) => ({
//       id: task.id,
//       title: task.title,
//       description: task.description,
//       dueDate: task.dueDate,
//     }));

//   writeReminders(reminders);
// });

app.get("/reminders", (req, res) => {
  const reminders = readReminders();
  res.json(reminders);
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
