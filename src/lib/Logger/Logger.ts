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
