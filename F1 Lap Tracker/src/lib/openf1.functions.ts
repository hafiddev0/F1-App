import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { openF1Client } from "./openf1.server";

const sessionKeySchema = z.object({ sessionKey: z.number() });

export const getLatestSession = createServerFn({ method: "GET" })
  .validator(() => ({}))
  .handler(async () => openF1Client.getLatestSession());

export const getSessionByKey = createServerFn({ method: "GET" })
  .validator((data) => sessionKeySchema.parse(data))
  .handler(async ({ data }) => openF1Client.getSessionByKey(data.sessionKey));

export const getDrivers = createServerFn({ method: "GET" })
  .validator((data) => sessionKeySchema.parse(data))
  .handler(async ({ data }) => openF1Client.getDrivers(data.sessionKey));

export const getPositions = createServerFn({ method: "GET" })
  .validator((data) => sessionKeySchema.parse(data))
  .handler(async ({ data }) => openF1Client.getPositions(data.sessionKey));

export const getIntervals = createServerFn({ method: "GET" })
  .validator((data) => sessionKeySchema.parse(data))
  .handler(async ({ data }) => openF1Client.getIntervals(data.sessionKey));

export const getLaps = createServerFn({ method: "GET" })
  .validator((data) => sessionKeySchema.parse(data))
  .handler(async ({ data }) => openF1Client.getLaps(data.sessionKey));

export const getCarData = createServerFn({ method: "GET" })
  .validator((data) => z.object({ sessionKey: z.number(), driverNumber: z.number() }).parse(data))
  .handler(async ({ data }) => openF1Client.getCarData(data.sessionKey, data.driverNumber));

export const getRaceControlMessages = createServerFn({ method: "GET" })
  .validator((data) => sessionKeySchema.parse(data))
  .handler(async ({ data }) => openF1Client.getRaceControlMessages(data.sessionKey));

export const getWeather = createServerFn({ method: "GET" })
  .validator((data) => sessionKeySchema.parse(data))
  .handler(async ({ data }) => openF1Client.getWeather(data.sessionKey));

export const getStints = createServerFn({ method: "GET" })
  .validator((data) => sessionKeySchema.parse(data))
  .handler(async ({ data }) => openF1Client.getStints(data.sessionKey));
