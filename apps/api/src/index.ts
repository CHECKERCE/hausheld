import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "@hausheld/db";

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  await prisma.task.delete({
    where: { id },
  });

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


  //////////////////////////////
 ////Task completion routes////
//////////////////////////////

app.post("/task-completions", async (req, res) => {
  const { userId, taskId } = req.body;

  const completion = await prisma.taskCompletion.create({
    data: {
      userId,
      taskId,
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

  const stats = completions.reduce<Record<string, {
    userId: string;
    name: string;
    tasksDone: number;
    points: number;
  }>>((acc, completion) => {
    const userId = completion.user.id;

    if (!acc[userId]) {
      acc[userId] = {
        userId,
        name: completion.user.name,
        tasksDone: 0,
        points: 0,
      };
    }

    acc[userId].tasksDone += 1;
    acc[userId].points += completion.task.points;

    return acc;
  }, {});

  res.json(Object.values(stats));
});

app.listen(port, () => {
  console.log(`API läuft auf http://localhost:${port}`);
});