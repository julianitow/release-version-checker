import Koa from "koa";
import Router from "@koa/router";
import * as dotenv from "dotenv";
import { Logger } from "./lib/Logger/Logger";
import { ParserService, VersionService } from "./services";
import { IParserService, IVersion } from "./interfaces";
import path from "path";
import NodeCache from "node-cache";
import https from "https";
import fs from "fs";
import { SecurityMiddleware } from "./middlewares";

const dotenvPath = path.join(process.cwd(), "/.env");
dotenv.config({ path: dotenvPath });
const CHECK_HOUR = process.env.CHECK_HOUR;
const URL = process.env.URL as string;
const CLASS_NAME = process.env.CLASS_NAME as string;
const PORT = process.env.PORT || 3000;

async function fetchElement(): Promise<string | undefined> {
  const parserService: IParserService = new ParserService();

  let elements: HTMLElement[] | null = null;

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
  const cache = new NodeCache();

  router.get('/latest', async (ctx) => {
    try {
      let _v = cache.get('version') as string;
      if (!_v || _v === "N/A") {
          _v = await fetchElement() ?? "N/A";
          cache.set('version', _v, 1000);
      }
      ctx.body = _v;
      ctx.status = 200;
    } catch(err) {
      ctx.status = 500;
    }
  });

  if (!fs.existsSync(SecurityMiddleware.blacklistFilePath)) fs.writeFileSync(SecurityMiddleware.blacklistFilePath, "");
  if (!fs.existsSync(SecurityMiddleware.errorFilePath)) fs.writeFileSync(SecurityMiddleware.errorFilePath, "");

  SecurityMiddleware.routes = router.stack.map(i => i.path) as string[];

  app
    .use(Logger.KOA_LOG)
    .use(SecurityMiddleware.koaSecurity)
    .use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      ctx.set('X-Response-Time', `${ms}ms`);
    })
    .use(router.routes())
    .use(router.allowedMethods())

  if (process.env.HTTPS) {
    Logger.INFO("HTTPS SERVER MODE");
    // From: https://www.rechberger.io/setup-https-letsencrypt-for-koa-js/#setup
    const httpsConfig = {
      domain: process.env.DOMAIN,
      https: {
        port: process.env.SECURED_PORT || 3443,
        options: {
          key: fs.readFileSync(path.resolve(process.cwd(), 'certs/privkey.pem'), 'utf8').toString(),
          cert: fs.readFileSync(path.resolve(process.cwd(), 'certs/fullchain.pem'), 'utf8').toString(),
        }
      }
    }
    const serverCB = app.callback();
    try {
      const httpsServer = https.createServer(httpsConfig.https.options, serverCB);
      httpsServer.listen(httpsConfig.https.port, () => {
        //if(!!err) {
        //  throw(new Error(`HTTPS Server failure: ${err} ==> ${err && err.stack}`));
        //}
        console.log(`HTTPS Server OK: https://${httpsConfig.domain} :: port: ${httpsConfig.https.port}`);
      });
    } catch(err) {
      console.error(err);
    }
  } else {
    Logger.WARN("HTTP SERVER MODE");
    app.listen(PORT, () => { Logger.INFO(`Listening on port: ${PORT}`)});
  }
}

main();
