import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hausheld API läuft 🏠"
  });
});

app.listen(port, () => {
  console.log(`API läuft auf http://localhost:${port}`);
});