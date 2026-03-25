import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";



const prisma = new PrismaClient({ 
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

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
