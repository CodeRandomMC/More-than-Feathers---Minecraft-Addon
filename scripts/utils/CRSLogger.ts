export class Logger {
  static readonly TAG: string = "[More than Feathers]";
  static debugEnabled: boolean = false;

  static log(message: string): void {
    console.log(`${Logger.TAG} ${message}`);
  }

  static warn(message: string): void {
    console.warn(`${Logger.TAG} ${message}`);
  }

  static error(message: string): void {
    console.error(`${Logger.TAG} ${message}`);
  }

  static info(message: string): void {
    console.info(`${Logger.TAG} ${message}`);
  }

  static debug(message: string): void {
    if (Logger.debugEnabled) {
      console.log(`${Logger.TAG}[DEBUG] ${message}`);
    }
  }

  static setDebug(enabled: boolean): void {
    Logger.debugEnabled = enabled;
    Logger.info(`${this.TAG} Debug logging ${enabled ? "enabled" : "disabled"}.`);
  }
}
