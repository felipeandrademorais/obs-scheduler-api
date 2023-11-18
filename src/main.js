import dotenv from "dotenv";
import OBSConnectionService from "./services/OBSConnection.js";
import ScheduleTaskService from "./services/ScheduleTask.js";

dotenv.config();

const obsConnectionService = new OBSConnectionService(
  process.env.OBS_ADDRESS,
  process.env.OBS_PASSWORD
);

async function mainMenu() {
  const scenes = await obsConnectionService.getSceneList();

  console.log("Escolha uma opção para agendar:");
  console.log("1. Iniciar transmissão");
  console.log("2. Trocar de cena");
  console.log("3. Encerrar transmissão");

  process.stdin.once("data", async (optionData) => {
    const option = optionData.toString().trim();

    console.log("Digite a hora para executar a ação (formato: HH:MM):");
    process.stdin.once("data", async (timeData) => {
      const time = timeData.toString().trim();
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
        console.log("Formato de hora inválido. Tente novamente.");
        mainMenu(); 
        return;
      }

      switch (option) {
        case "1":
          console.log(`Início da transmissão agendado para: ${scheduleDate}`);
          new ScheduleTaskService(
            scheduleDate,
            obsConnectionService.startStreaming.bind(obsConnectionService)
          );
          mainMenu(); 
          break;
        case "2":
          console.log("Escolha uma cena pelo número:");
          scenes.forEach((scene) => {
            console.log(`${scene.sceneIndex}. ${scene.sceneName}`);
          });
          process.stdin.once("data", async (sceneData) => {
            const sceneIndex = parseInt(sceneData.toString().trim(), 10);
            const sceneName = await getSceneNameByIndex(sceneIndex);
            console.log("Name:", sceneName);
            console.log(`Troca de cena agendada para: ${scheduleDate}`);
            new ScheduleTaskService(scheduleDate, () =>
              obsConnectionService.switchScene(sceneName)
            );
            mainMenu();
          });
          break;
        case "3":
          console.log(
            `Encerramento da transmissão agendado para: ${scheduleDate}`
          );
          new ScheduleTaskService(
            scheduleDate,
            obsConnectionService.stopStreaming.bind(obsConnectionService)
          );
          mainMenu();
          break;
        default:
          console.log("Opção inválida. Tente novamente.");
          mainMenu();
      }
    });
  });
}

async function getSceneNameByIndex(index) {
  const scenes = await obsConnectionService.getSceneList();

  for (const scene of scenes) {
    if (scene.sceneIndex === index) {
      return scene.sceneName;
    }
  }

  console.log("Cena não encontrada para o índice:", index);
  return null;
}


mainMenu();
