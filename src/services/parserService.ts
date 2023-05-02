import puppeteer from "puppeteer";
import { JSDOM } from "jsdom";
import { IParserService } from "../interfaces/services";
import { Logger } from "../lib/Logger";

export class ParserService implements IParserService {
  async getElementByIdFromString(
    html: string,
    id: string
  ): Promise<HTMLElement | null> {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const element = doc.getElementById(id) as HTMLInputElement;
    Logger.DEBUG("Element =>", element);
    return element;
  }
  async parsePage(url: string, timeout: number = 60000): Promise<string> {
    const config: any = {};
    if (process.env.CHROMIUM_PATH) {
      config.executablePath = process.env.CHROMIUM_PATH;
    }
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      ...config,
    });
    const page = await browser.newPage();

    await page.goto(url);
    Logger.WARN("page.waitForTimeout deprecated");
    await page.waitForTimeout(timeout);
    const source = await page.content();
    await browser.close();
    return source;
  }
}
