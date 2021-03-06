import scheduler from "node-schedule";
import { DateTime } from "luxon";
import { data } from "../../data.mjs";
import { setScheduleIsActive } from "./setScheduleIsActive.mjs";
import { addJobToSchedule } from "./addJobToSchedule.mjs";
import { emitBlockedServices } from "../../../socketServer/emitBlockedServices.mjs";

const startSchedule = ({ scheduleId, userId, duration }) => {
  console.info(`Activated schedule ${scheduleId} for user ${userId}`);

  setScheduleIsActive({ scheduleId, userId, isActive: true });

  const endDate = DateTime.now().plus({ minutes: duration }).toMillis();

  const deactivateScheduleJob = scheduler.scheduleJob(endDate, () => {
    console.info(`De-activated schedule ${scheduleId} for user ${userId}`);

    setScheduleIsActive({ userId, scheduleId, isActive: false });

    emitBlockedServices({ userId });
  });

  addJobToSchedule({ userId, scheduleId, job: deactivateScheduleJob });

  emitBlockedServices({ userId });
};

const processScheduleTime = ({ scheduleId, userId, start, duration }) => {
  const activateScheduleJob = scheduler.scheduleJob(start, () =>
    startSchedule({
      scheduleId,
      userId,
      duration,
    })
  );

  addJobToSchedule({ userId, scheduleId, job: activateScheduleJob });
};

function addSchedule({ userId, schedule }) {
  const existingSchedules = data.schedules.byUserId[userId];

  data.schedules.byUserId[userId] = {
    ...existingSchedules,
    [schedule.id]: { ...schedule, isActive: false, jobs: [] },
  };

  if (schedule.type === "one-off") {
    const startDate = DateTime.fromISO(schedule.startDate).toMillis();

    return processScheduleTime({
      scheduleId: schedule.id,
      userId,
      start: startDate,
      duration: schedule.duration,
    });
  }

  return schedule.repeats.map((repeat) =>
    processScheduleTime({
      scheduleId: schedule.id,
      userId,
      start: repeat,
      duration: schedule.duration,
    })
  );
}

export { addSchedule };
