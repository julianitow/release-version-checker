export interface IParserService {
  parsePage(url: string): Promise<string>;
  getElementByIdFromString(html: string, id: string): Promise<HTMLElement | null>;
  getElementsByClassName(html: string, className: string): HTMLElement[] | null;
}
