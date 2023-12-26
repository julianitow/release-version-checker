import { Context } from "koa";

enum LEVEL {
  "DEBUG" = "DEBUG",
  "INFO" = "INFO",
  "WARN" = "WARN",
  "ERROR" = "ERROR",
}

export class Logger {
  private static print(level: LEVEL, out: any): void {
    const now = new Date();
    const logFunc = level === LEVEL.ERROR ? console.error : console.log;
    logFunc(
      `[${level}]::${
        now.getHours() < 10 ? `O${now.getHours()}` : now.getHours()
      }:${now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes()}:${
        now.getSeconds() < 10 ? `0${now.getSeconds()}` : now.getSeconds()
      }:`,
      ...out
    );
  }

  static async KOA_LOG(ctx: Context, next: any): Promise<void> {
    Logger.INFO(`<-- ${ctx.request.method}::${ctx.url} ${ctx.request.ip}`);
    await next();
    const rt = ctx.response.get('X-Response-Time');
    Logger.INFO(`--> ${ctx.method}::${ctx.url} - ${rt} - ${ctx.response.status}`);
  }

  static DEBUG(...out: any[]): void {
    if (process.env.DEBUG) {
      Logger.print(LEVEL.DEBUG, out);
    }
  }

  static INFO(...out: any[]): void {
    Logger.print(LEVEL.INFO, out);
  }

  static ERROR(...out: any[]): void {
    Logger.print(LEVEL.ERROR, out);
  }

  static WARN(...out: any[]): void {
    Logger.print(LEVEL.WARN, out);
  }
}
