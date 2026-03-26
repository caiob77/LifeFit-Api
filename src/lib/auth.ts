import "dotenv/config";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { prisma } from "./db.js";

const auth = betterAuth({
   baseURL: process.env.BETTER_AUTH_URL as string,
   socialProviders: {
      google: { 
          clientId: process.env.GOOGLE_CLIENT_ID as string, 
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
      }, 
   },
   database: prismaAdapter(prisma, {
    provider: "postgresql",
   }),
   plugins: [
    openAPI(),
   ],
});

export default auth;
