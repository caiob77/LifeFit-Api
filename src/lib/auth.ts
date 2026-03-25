import "dotenv/config";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { prisma } from "./db.js";

const auth = betterAuth({
   emailAndPassword: {
    enabled: true,
   },
   database: prismaAdapter(prisma, {
    provider: "postgresql",
   }),
   plugins: [
    openAPI(),
   ],
});

export default auth;
