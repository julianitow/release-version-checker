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
    return element;
  }

  getElementsByClassName(html: string, className: string): HTMLElement[] | null {
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const elements = [...doc.getElementsByClassName("ml-1 wb-break-all") as HTMLCollectionOf<HTMLElement>];
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if(element.classList.contains('f5')) {
        elements.splice(i, 1);
      }
    }
    elements.reverse();
    return elements;
  }

  async parsePage(url: string, timeout: number = 60000): Promise<string> {
    const config: any = {};
    if (process.env.CHROMIUM_PATH) {
      config.executablePath = process.env.CHROMIUM_PATH;
    }
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: "new",
      ...config,
    });
    const page = await browser.newPage();

    await page.goto(url);
    const source = await page.content();
    await browser.close();
    return source;
  }
}
