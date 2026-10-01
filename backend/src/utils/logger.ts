export const logger = {
  info: (msg: string, ...rest: unknown[]) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, ...rest);
  },
  warn: (msg: string, ...rest: unknown[]) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, ...rest);
  },
  error: (msg: string, ...rest: unknown[]) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, ...rest);
  }
};
