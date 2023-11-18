import express from "express";
import dotenv from "dotenv";
import OBSConnectionService from "./services/OBSConnection.js";
import ScheduleTaskService from "./services/ScheduleTask.js";

dotenv.config();

const app = express();
app.use(express.json());

const obsConnectionService = new OBSConnectionService(
  process.env.OBS_ADDRESS,
  process.env.OBS_PASSWORD
);

app.get("/", (res) => {
  console.log(res);
  return res.status(200).json({ message: `Api running.` });
});

app.post("/start", (req, res) => {
  const { time } = req.body;
  const currentDate = new Date();
  const [hours, minutes] = time.split(":");

  const scheduleDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    hours,
    minutes
  );

  if (scheduleDate.toString() === "Invalid Date") {
    return res.status(400).json({ error: "Invalid time format." });
  }

  new ScheduleTaskService(
    scheduleDate,
    obsConnectionService.startStreaming.bind(obsConnectionService)
  );
  return res.json({ message: `Streaming scheduled for: ${scheduleDate}` });

});

app.post("/stop", (req, res) => {
  const { time } = req.body;
  const currentDate = new Date();
  const [hours, minutes] = time.split(":");

  const scheduleDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    hours,
    minutes
  );

  if (scheduleDate.toString() === "Invalid Date") {
    return res.status(400).json({ error: "Invalid time format." });
  }

  new ScheduleTaskService(
    scheduleDate,
    obsConnectionService.stopStreaming.bind(obsConnectionService)
  );
  return res.json({ message: `Encerramento da transmissão agendado para: ${scheduleDate}` });

});

app.post("/switch", (req, res) => {
  const { time, sceneName } = req.body;
  const currentDate = new Date();
  const [hours, minutes] = time.split(":");

  const scheduleDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    hours,
    minutes
  );

  if (scheduleDate.toString() === "Invalid Date") {
    return res.status(400).json({ error: "Invalid time format." });
  }

  new ScheduleTaskService(scheduleDate, () =>
    obsConnectionService.switchScene(sceneName)
  );

  return res.json({ message: `Troca para de cena agendada para: ${scheduleDate}` });

});

app.listen(3000, () => {
  console.log("API is listening on port 3000");
});
