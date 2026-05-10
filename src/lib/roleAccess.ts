// src/lib/roleAccess.ts

export const roleAccess: Record<string, { routes: RegExp[]; default: string }> =
  {
    student: {
      routes: [/^\/student($|\/.*)/],
      default: "/student",
    },
    teacher: {
      routes: [/^\/student($|\/.*)/, /^\/teacher($|\/.*)/],
      default: "/teacher",
    },
    admin: {
      routes: [/^\/.*/], // full access
      default: "/admin",
    },
  };
