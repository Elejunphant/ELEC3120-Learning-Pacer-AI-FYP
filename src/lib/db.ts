import { PrismaClient } from '@prisma/client'
import path from 'path'

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  if (envUrl) {
    // Postgres / Postgres-compatible URLs — pass through unchanged.
    if (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://')) {
      return envUrl;
    }
    // Absolute SQLite path
    if (envUrl.startsWith('file:/') && !envUrl.startsWith('file://')) {
      return envUrl;
    }
    // Relative SQLite path → resolve against cwd
    if (envUrl.startsWith('file:./') || envUrl.startsWith('file:')) {
      const relativePath = envUrl.replace('file:', '');
      const absolutePath = path.resolve(process.cwd(), relativePath);
      return `file:${absolutePath}`;
    }
    // Unknown protocol — trust the user, return as-is
    return envUrl;
  }

  const dbPath = path.join(process.cwd(), 'db', 'custom.db');
  return `file:${dbPath}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

process.env.DATABASE_URL = getDatabaseUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
