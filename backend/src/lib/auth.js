import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import dotenv from "dotenv";

import prisma from "../config/prisma.js";

dotenv.config();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins: [process.env.FRONTEND_URL, process.env.FRONTEND_DEPLOYED_URL],

  emailAndPassword: {
    enabled: true,
  },
});
