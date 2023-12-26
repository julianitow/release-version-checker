import { IVersionService } from "../interfaces/services/IVersionService";

export class VersionService implements IVersionService {
    static getVersionFromHTMLElement(element: HTMLElement): string {
        return element.innerHTML.split(" ").filter(v => v !== '').filter(v => v !== '\n')[0];
    }
}