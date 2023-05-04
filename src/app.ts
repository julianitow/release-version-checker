import * as dotenv from "dotenv";
import { Logger } from "./lib/Logger/Logger";
import { NotificationService, ParserService } from "./services";
import { EMAIL, INotificationService, IParserService } from "./interfaces";
import path from "path";

const dotenvPath = path.join(process.cwd(), "/.env");
dotenv.config({ path: dotenvPath });
const CHECK_HOUR = process.env.CHECK_HOUR;
const URL = process.env.URL as string;
const DIV_ID = process.env.DIV_ID as string;

async function fetchElement(): Promise<Boolean> {
  Logger.INFO("Checking availability");
  const parserService: IParserService = new ParserService();
  const notificationService: INotificationService = new NotificationService();

  let element: HTMLElement | null = null;
  const checkHour = +(CHECK_HOUR as string);
  const now = new Date();

  const email: EMAIL = {
    subject: `${process.env.NAME}: ${process.env.SUBJECT_SUCCESS}`,
    text: `${process.env.EMAIL_BODY_SUCCESS} \n Clique ! ${URL}`,
  };

  try {
    const parsedPage = await parserService.parsePage(URL);
    element = await parserService.getElementByIdFromString(parsedPage, DIV_ID);
  } catch (err) {
    Logger.ERROR(err);
  }

  if (element === null || element.getAttribute("disabled") !== null) {
    if (now.getHours() === checkHour) {
      email.subject = `${process.env.NAME}: ${process.env.SUBJECT_HEALTH_CHECK}`;
      email.text = process.env.EMAIL_BODY_HEALTHCHECK as string;

      notificationService.sendEmail(
        process.env.SMTP_USER as string,
        process.env.SMTP_USER as string,
        email
      );
      Logger.INFO("Pas dispo.");
    }
    return false;
  }

  Logger.INFO(" Dispo !");

  notificationService.sendEmail(
    process.env.SMTP_USER as string,
    process.env.SMTP_USER as string,
    email
  );
  return true;
}

function stopInterval(interval: NodeJS.Timer): void {
  clearInterval(interval);
}

async function main() {
  Logger.INFO(`Hello from ${process.env.NAME}:v${process.env.VERSION}`);
  Logger.INFO("Process path:", process.cwd());
  Logger.INFO("Config path: ", dotenvPath);
  Logger.DEBUG("Health check at", CHECK_HOUR);
  Logger.INFO("Check availability every:", process.env.CHECK_DELAY, "mn");

  const delayMn = process.env.CHECK_DELAY as string;
  const delay = 1000 * 60 * +delayMn;

  Logger.DEBUG("Delay in ms:", delay);

  /*if (process.env.DOCKER === "true") {
    Logger.INFO("Running in docker.");
    await fetchElement();
    return;
  }*/

  const available = await fetchElement();
  if (available) {
    return;
  }
  Logger.INFO("Retrying in 30mn...");
  const interval = setInterval(async () => {
    if (await fetchElement()) {
      stopInterval(interval);
    }
    Logger.INFO("Retrying in 30mn...");
  }, delay);
}

main();
