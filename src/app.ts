import Koa from "koa";
import Router from "@koa/router";
import * as dotenv from "dotenv";
import { Logger } from "./lib/Logger/Logger";
import { ParserService, VersionService } from "./services";
import { IParserService, IVersion } from "./interfaces";
import path from "path";

const dotenvPath = path.join(process.cwd(), "/.env");
dotenv.config({ path: dotenvPath });
const CHECK_HOUR = process.env.CHECK_HOUR;
const URL = process.env.URL as string;
const CLASS_NAME = process.env.CLASS_NAME as string;
const PORT = process.env.PORT || 3000;

async function fetchElement(): Promise<string | undefined> {
  const parserService: IParserService = new ParserService();

  let elements: HTMLElement[] | null = null;
  let version: string = "";

  try {
    const parsedPage = await parserService.parsePage(URL);
    elements = await parserService.getElementsByClassName(parsedPage, CLASS_NAME);
    if (!elements) return;
    const v: IVersion = {
      version: VersionService.getVersionFromHTMLElement(elements[elements.length - 1]).replace("\n", ""),
      url: ""
    }
    return JSON.stringify(v);
  } catch (err) {
    Logger.ERROR(err);
    throw err;
  }
}

async function main() {
  Logger.INFO(`Hello from ${process.env.NAME}:v${process.env.VERSION}`);
  Logger.INFO("Process path:", process.cwd());
  Logger.INFO("Config path: ", dotenvPath);

  const app = new Koa();
  const router = new Router();

  router.get('/latest', async (ctx, next) => {
    try {
      ctx.body = await fetchElement();
      ctx.status = 200;
    } catch(err) {
      ctx.status = 500;
    }
  });

  app
    .use(Logger.KOA_LOG)
    .use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      ctx.set('X-Response-Time', `${ms}ms`);
    })
    .use(router.routes())
    .use(router.allowedMethods())

  app.listen(PORT, () => { Logger.INFO(`Listening on port: ${PORT}`)});
}

main();
