import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

type Reminder = {
  id: string,
  title: string,
  description: string,
  dueDate: string,
  isCompleted: boolean
}

const reminders: Reminder[] = [];

// Create a new reminder
app.post("/reminder", async (c) => {
  const body = await c.req.json();
  const newReminder: Reminder = body.reminder;

  if (newReminder && newReminder.id && newReminder.title && newReminder.description && newReminder.dueDate && typeof newReminder.isCompleted === 'boolean') {
    reminders.push(newReminder);
    return c.json(newReminder, 200); // 200 OK
  } else {
    return c.json({ error: 'Invalid request' }, 400); // 400 Bad Request
  }
})

//Get all completed reminders
app.get('/reminder/completed', (c) => {
  const completedReminders = reminders.filter((reminder) => reminder.isCompleted === true);

  if (completedReminders.length > 0) {
    return c.json(completedReminders, 200); // 200 OK
  } else {
    return c.json({ error: 'No completed reminders found' }, 404); // 404 Not Found
  }
});

//Get all incomplete reminders
app.get('/reminder/incomplete', (c) => {
  const incompleteReminders = reminders.filter((reminder) => reminder.isCompleted === false);
  
  if (incompleteReminders.length > 0) {
    return c.json(incompleteReminders, 200); // 200 OK
  } else {
    return c.json({ error: 'No incomplete reminders found' }, 404); // 404 Not Found
  }
});

// Get reminders due today
app.get("/reminder/due-today", (c) => {
  const todayDateString = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const dueTodayReminders = reminders.filter(
    (reminder) => reminder.dueDate >= todayDateString && reminder.isCompleted === false
  );
  if (dueTodayReminders.length === 0) {
    return c.json({ message: "No reminders due today" });
    }
  return c.json(dueTodayReminders,200);
});

//Get reminders by ID
app.get('/reminder/:id', async (c) => {
  const id = c.req.param('id');
  const reminder = reminders.find(r => r.id === id);

  if (reminder) {
    return c.json(reminder, 200); // 200 OK
  } else {
    return c.json({ error: 'Reminder not found' }, 404); // 404 Not Found
  }
});

//Update a reminder
app.patch('/reminder/:id', async (c) => {
  try{
    const id = c.req.param('id');
  const body = await c.req.json();
  const reminder = reminders.find(r => r.id === id);
  if (!reminder) {
    return c.json({ error: 'Reminder not found' }, 404); // 404 Not Found
  }
  const updatedReminder: Partial<Reminder> = body.reminder;

  if (
    (body.title && typeof body.title !== "string") ||
    (body.description && typeof body.description !== "string") ||
    (body.dueDate && typeof body.dueDate !== "string") ||
    (body.isCompleted !== undefined && typeof body.isCompleted !== "boolean")
  ) {
    return c.json({ message: "400 Bad Request: Invalid fields provided." }, 400);
  }

  Object.assign(reminder, updatedReminder);
  return c.json(reminder, 200); // 200 OK
  }
  catch{
    return c.json({ message: "400 Bad Request: Invalid fields provided." }, 400);
  }
});

//Get all reminders
app.get('/reminder', async (c) => {
  return c.json(reminders);
});
 
//Delete a reminder
app.delete("/reminder/:id", (context) => {
  const id = context.req.param("id");
  const index = reminders.findIndex((reminder) => reminder.id === id);

  if (index === -1) {
    return context.json({ message: "404 Not Found: Reminder not found." }, 404);
  }

  reminders.splice(index, 1);

  return context.json({ message: "Reminder deleted successfully." }, 200);
});

//Mark a reminder as completed
app.post("/reminder/:id/mark-completed", (context) => {
  const id = context.req.param("id");
  const reminder = reminders.find((reminder) => reminder.id === id);

  if (!reminder) {
    return context.json({ message: "404 Not Found: Reminder not found." }, 404);
  }

  reminder.isCompleted = true;
  return context.json({ message: "Reminder marked as completed.", reminder }, 200);
});

//Unmark a reminder as completed
app.post("/reminder/:id/unmark-completed", (context) => {
  const id = context.req.param("id");
  const reminder = reminders.find((reminder) => reminder.id === id);

  if (!reminder) {
    return context.json({ message: "404 Not Found: Reminder not found." }, 404);
  }

  reminder.isCompleted = false;
  return context.json({ message: "Reminder unmarked as completed.", reminder }, 200);
});



serve(app);