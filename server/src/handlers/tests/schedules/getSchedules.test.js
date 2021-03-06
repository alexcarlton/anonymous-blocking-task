import jwt from "jsonwebtoken";
import { addSchedule } from "../../../database/queries/schedules/addSchedule.mjs";
import request from "supertest";
import { app } from "../../../app.mjs";
import { resetData } from "../../../database/data.mjs";

jest.mock("../../../socketServer/emitBlockedServices.mjs");

describe("getSchedules", () => {
  beforeEach(() => {
    resetData();
  });

  const userId = "123";

  it("gets all schedules for the user", async () => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

    const schedules = [
      {
        name: "Morning Focus",
        type: "repeated",
        services: [{ name: "facebook" }, { name: "reddit" }],
        duration: 120,
        repeats: ["* * 14 * * 1", "* * 14 * * 3"],
      },
      {
        name: "Afternoon Focus",
        type: "one-off",
        services: [{ name: "facebook" }, { name: "reddit" }],
        startDate: "2021-02-27T09:00:00.000+00:00",
        duration: 120,
      },
    ];

    addSchedule({ userId, schedule: { ...schedules[0], id: "1" } });
    addSchedule({ userId, schedule: { ...schedules[1], id: "2" } });

    const response = await request(app)
      .get(`/schedules`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      data: {
        schedules: [
          { id: "1", isActive: false, ...schedules[0] },
          { id: "2", isActive: false, ...schedules[1] },
        ],
      },
    });
  });

  it("should return an empty array if the user has no schedules", async () => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);

    const response = await request(app)
      .get(`/schedules`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      data: {
        schedules: [],
      },
    });
  });
});
