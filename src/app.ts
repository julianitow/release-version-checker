import * as dotenv from "dotenv";
import { Logger } from "./lib/Logger/Logger";
import { NotificationService, ParserService } from "./services";
import { EMAIL, INotificationService, IParserService } from "./interfaces";

dotenv.config();
const CHECK_HOUR = process.env.CHECK_HOUR;
const URL = process.env.URL as string;
const DIV_ID = process.env.DIV_ID as string;

async function main() {
  Logger.INFO(`Hello from ${process.env.NAME}:v${process.env.VERSION}`);
  Logger.DEBUG("HEALTH CHECK at", CHECK_HOUR);
  const parserService: IParserService = new ParserService();
  const notificationService: INotificationService = new NotificationService();

  let element: HTMLElement | null = null;

  try {
    const parsedPage = await parserService.parsePage(URL);
    element = await parserService.getElementByIdFromString(parsedPage, DIV_ID);
  } catch (err) {
    Logger.ERROR(err);
  }

  if (!element) {
    const checkHour = +(CHECK_HOUR as string);
    const now = new Date();
    if (now.getHours() === checkHour) {
      const email: EMAIL = {
        subject: `${process.env.NAME}: ${process.env.SUBJECT_HEALTH_CHECK}`,
        text: process.env.EMAIL_BODY_HEALTHCHECK as string,
      };
      notificationService.sendEmail(
        process.env.SMTP_USER as string,
        process.env.SMTP_USER as string,
        email
      );
      Logger.INFO("Pas dispo en 44.");
      return;
    }
  }
  Logger.INFO(" Dispo en 44 !");
  const email: EMAIL = {
    subject: `${process.env.NAME}: ${process.env.SUBJECT_SUCCESS}`,
    text: `${process.env.EMAIL_BODY_SUCCESS} \n Clique ! ${URL}`,
  };
  notificationService.sendEmail(
    process.env.SMTP_USER as string,
    process.env.SMTP_USER as string,
    email
  );
}

main();
