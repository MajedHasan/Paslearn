import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient; // This must be a `var` to match the global scope's declaration
}

// Ensure prisma client is initialized correctly
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
