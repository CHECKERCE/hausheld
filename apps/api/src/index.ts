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

app.listen(port, () => {
  console.log(`API läuft auf http://localhost:${port}`);
});