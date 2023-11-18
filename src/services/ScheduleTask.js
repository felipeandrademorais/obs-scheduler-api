import schedule from "node-schedule";

export default class ScheduleTaskService {
  constructor(time, task) {
    this.time = time;
    this.task = task;
    this.job = schedule.scheduleJob(this.time, this.executeTask.bind(this));
  }

  async executeTask() {
    console.log("Executando a função...");
    await this.task();
    this.job.cancel();
  }

  static getAllScheduledTasks() {
    const scheduledJobs = schedule.scheduledJobs;
    const scheduledJobDetails = {};

    Object.keys(scheduledJobs).forEach((jobName) => {
      scheduledJobDetails[jobName] = {
        nextInvocation: scheduledJobs[jobName].nextInvocation(),
      };
    });

    return scheduledJobDetails;
  }
}
