import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "@hausheld/db";
import { startDailyReminderScheduler } from "./services/dailyReminderScheduler";
import { calculateAwayStats, calculateEffectivePoints } from "./utils/absenceStats";

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

import type { User, Stat } from "@hausheld/types";

app.get("/", (req, res) => {
  res.json({
    message: "Hausheld API läuft"
  });
});


///////////////////
////Task routes////
///////////////////

app.get("/tasks", async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const { name, points } = req.body;

  const task = await prisma.task.create({
    data: {
      name,
      points
    }
  });

  res.status(201).json(task);
});

app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { name, points } = req.body;

  const pointsValue = Number(points);

  if (!name?.trim()) {
    return res.status(400).json({
      message: "Der Aufgabenname darf nicht leer sein.",
    });
  }

  if (!Number.isInteger(pointsValue) || pointsValue < 1) {
    return res.status(400).json({
      message: "Punkte müssen eine ganze Zahl größer als 0 sein.",
    });
  }

  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask) {
    return res.status(404).json({
      message: "Aufgabe nicht gefunden.",
    });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      name: name.trim(),
      points: pointsValue,
    },
  });

  res.json(updatedTask);
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask) {
    return res.status(404).json({
      message: "Aufgabe nicht gefunden.",
    });
  }

  await prisma.$transaction([
    prisma.taskCompletion.deleteMany({
      where: { taskId: id },
    }),
    prisma.task.delete({
      where: { id },
    }),
  ]);

  res.status(204).send();
});


///////////////////
////User routes////
///////////////////

app.post("/users", async (req, res) => {
  const { name } = req.body;

  const user = await prisma.user.create({
    data: { name },
  });

  res.status(201).json(user);
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();

  res.json(users);
});

app.patch("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: "Name fehlt." });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { name: name.trim() },
  });

  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  await prisma.$transaction([
    prisma.taskCompletion.deleteMany({ where: { userId: id } }),
    prisma.userAbsence.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } }),
  ]);

  res.status(204).send();
});

app.patch("/users/:id/away", async (req, res) => {
  const { id } = req.params;
  const { awayUntil } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      awayUntil: new Date(awayUntil),
    },
  });

  res.json(user);
});

app.patch("/users/:id/back", async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: {
      awayUntil: null,
    },
  });

  res.json(user);
});


// absence

app.get("/user-absences", async (req, res) => {
  const absences = await prisma.userAbsence.findMany({
    include: { user: true },
    orderBy: { startDate: "desc" },
  });

  res.json(absences);
});

app.post("/user-absences", async (req, res) => {
  const { userId, startDate, endDate, reason } = req.body;

  const absence = await prisma.userAbsence.create({
    data: {
      userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason?.trim() || null,
    },
    include: { user: true },
  });

  res.status(201).json(absence);
});

app.delete("/user-absences/:id", async (req, res) => {
  await prisma.userAbsence.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
});


//////////////////////////////
////Task completion routes////
//////////////////////////////

app.post("/task-completions", async (req, res) => {
  const { userId, taskId, completedAt } = req.body;

  const completion = await prisma.taskCompletion.create({
    data: {
      userId,
      taskId,
      completedAt: completedAt ? new Date(completedAt) : undefined,
    },
    include: {
      user: true,
      task: true,
    },
  });

  res.status(201).json(completion);
});

app.get("/task-completions", async (req, res) => {
  const completions = await prisma.taskCompletion.findMany({
    include: {
      user: true,
      task: true,
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  res.json(completions);
});

app.delete("/task-completions/:id", async (req, res) => {
  const { id } = req.params;

  await prisma.taskCompletion.delete({
    where: { id },
  });

  res.status(204).send();
});

////////////////////
////Stats routes////
////////////////////

app.get("/stats", async (req, res) => {
  const completions = await prisma.taskCompletion.findMany({
    include: {
      user: true,
      task: true,
    },
  });

  const users = await prisma.user.findMany();
  const userIds = users.map(u => u.id);

  const absences = await prisma.userAbsence.findMany({ include: { user: true } });

  const stats: Record<string, Stat> = {};

  // init
  for (const user of users) {
    stats[user.id] = {
      userId: user.id,
      name: user.name,
      tasksDone: 0,
      points: 0,
      isAway: false,
      activeDays: 0,
      absenceDays: 0
    };
  }

  // neue Punkteberechnung
  for (const completion of completions) {
    const effectivePoints = calculateEffectivePoints(
      completion,
      userIds,
      absences
    );

    const userId = completion.userId;

    stats[userId].tasksDone += 1;
    stats[userId].points += effectivePoints;
  }

  for (const user of users) {
    const userAbsences = absences.filter(a => a.userId === user.id);

    const awayStats = calculateAwayStats(user, completions, userAbsences);

    stats[user.id].isAway = awayStats.isAway;
    stats[user.id].activeDays = awayStats.activeDays;
    stats[user.id].absenceDays = awayStats.absenceDays;
  }

  res.json(Object.values(stats));
});

////////////////////////
////Reminder routes////
//////////////////////

app.get("/reminders", async (req, res) => {
  const reminders = await prisma.reminder.findMany({
    orderBy: {
      dueAt: "asc",
    },
  });

  res.json(reminders);
});

app.post("/reminders", async (req, res) => {
  const { title, message, dueAt, done, triggered } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Titel fehlt." });
  }

  if (!message?.trim()) {
    return res.status(400).json({ message: "Nachricht fehlt." });
  }

  const dueDate = new Date(dueAt);

  if (Number.isNaN(dueDate.getTime())) {
    return res.status(400).json({ message: "Ungültiges Datum." });
  }

  const reminder = await prisma.reminder.create({
    data: {
      title: title.trim(),
      message: message.trim(),
      dueAt: dueDate,
      done: typeof done === "boolean" ? done : false,
      triggered: typeof triggered === "boolean" ? triggered : false,
    },
  });

  res.status(201).json(reminder);
});

app.patch("/reminders/:id/done", async (req, res) => {
  const { id } = req.params;

  const reminder = await prisma.reminder.update({
    where: { id },
    data: { done: true },
  });

  res.json(reminder);
});

app.delete("/reminders/:id", async (req, res) => {
  const { id } = req.params;

  await prisma.reminder.delete({
    where: { id },
  });

  res.status(204).send();
});

app.patch("/reminders/:id/trigger", async (req, res) => {
  const { id } = req.params;

  const reminder = await prisma.reminder.update({
    where: {
      id,
    },
    data: {
      triggered: true,
    },
  });

  res.json(reminder);
});

app.patch("/reminders/:id/reset-trigger", async (req, res) => {
  const { id } = req.params;

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      triggered: false,
    },
  });

  res.json(reminder);
});

app.patch("/reminders/:id/reopen", async (req, res) => {
  const { id } = req.params;

  const reminder = await prisma.reminder.update({
    where: { id },
    data: {
      done: false,
    },
  });

  res.json(reminder);
});

app.get("/reminders/pending", async (req, res) => {
  const reminders = await prisma.reminder.findMany({
    where: {
      done: false,
      triggered: false,
      dueAt: {
        lte: new Date(),
      },
    },
    orderBy: {
      dueAt: "asc",
    },
  });

  res.json(reminders);
});


////////////////////////
////Telegram routes////
//////////////////////

app.get("/telegram-chats", async (req, res) => {
  const chats = await prisma.telegramChat.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(chats);
});

app.post("/telegram-chats", async (req, res) => {
  const { chatId, title } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "chatId fehlt." });
  }

  const chat = await prisma.telegramChat.upsert({
    where: { chatId: String(chatId) },
    update: {
      title: title ?? null,
    },
    create: {
      chatId: String(chatId),
      title: title ?? null,
    },
  });

  res.status(201).json(chat);
});

app.patch("/users/:id/telegram", async (req, res) => {
  const { id } = req.params;
  const { telegramUserId, telegramName } = req.body;

  if (!telegramUserId) {
    return res.status(400).json({ message: "telegramUserId fehlt." });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      telegramUserId: String(telegramUserId),
      telegramName: telegramName ?? null,
    },
  });

  res.json(user);
});

startDailyReminderScheduler();

app.listen(port, () => {
  console.log(`API läuft auf http://localhost:${port}`);
});