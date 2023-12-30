import fs from "fs";
import crypto from "crypto";
import path from "path";
import { Context } from "koa";

export class SecurityMiddleware {

    private static algorithm = 'aes-256-ctr';
    private static key: string = crypto.createHash('sha256').update(process.env.KEY as string).digest('base64').substring(0, 32);
    private static alreadyWrittenData: string | undefined;

    public static errorFilePath: string = path.resolve(process.cwd(), 'error_logs');
    public static blacklistFilePath: string = path.resolve(process.cwd(), 'blacklist');
    public static routes: string[];
 
    private static encrypt(data: string): Buffer {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(SecurityMiddleware.algorithm, SecurityMiddleware.key, iv);
        return Buffer.concat([iv, cipher.update(data), cipher.final()]);
    }

    private static decrypt(data: Buffer): string | undefined {
        if (data.length == 0) return;
        let encrypted = data;
        const iv = encrypted.subarray(0, 16);
        encrypted = encrypted.subarray(16);
        const decipher = crypto.createDecipheriv(SecurityMiddleware.algorithm, SecurityMiddleware.key, iv);
        return Buffer.concat([decipher.update(Buffer.from(encrypted)), decipher.final()]).toString();
    }

    private static checkIfBan(ip: string): boolean {
        const banned = fs.readFileSync(SecurityMiddleware.blacklistFilePath).toString().split('\n');
        if (banned.filter(_e => _e.indexOf(ip) !== -1).length > 0) return true;
        return false;
    }

    private static ban(ip: string): void {
        fs.appendFileSync(SecurityMiddleware.blacklistFilePath, `${ip}\n`);
    }

    private static unban(ip: string): void {
        const allLines = SecurityMiddleware.alreadyWrittenData?.split('\n') ?? [];
        const interestingLines = allLines.filter(line => line.indexOf(ip) === -1);
        let unbannedIpData = "";
        for (let line of interestingLines) {
            line += "\n";
            unbannedIpData += line
        }
        SecurityMiddleware.alreadyWrittenData = unbannedIpData;
        fs.writeFileSync(SecurityMiddleware.errorFilePath, SecurityMiddleware.encrypt(SecurityMiddleware.alreadyWrittenData!));
    }

    private static writeRequestToFile(ip: string) {
        const dataToWrite = `${new Date().toISOString()};${ip}\n`;
        SecurityMiddleware.alreadyWrittenData += dataToWrite;
        fs.writeFileSync(SecurityMiddleware.errorFilePath, SecurityMiddleware.encrypt(SecurityMiddleware.alreadyWrittenData!));
    }

    private  static getErrorCount(ip: string): number {
        const allLines = SecurityMiddleware.alreadyWrittenData!.split('\n');
        const interestingLines = allLines.filter(line => line.indexOf(ip) !== -1);
        return interestingLines.length;
    }

    static async koaSecurity(ctx: Context, next: any): Promise<void> {
        const ip = ctx.request.ip;

        if (ip === "" || ip === "::1" || ip ===  null || ip === undefined) {
            ctx.status = 403;
            return;
        }

        if (SecurityMiddleware.checkIfBan(ip)) {
            ctx.response.body = "BANNED";
            ctx.status = 403;
            return;
        }
        
        if (!SecurityMiddleware.routes.includes(ctx.url)) {
            if(!fs.existsSync(SecurityMiddleware.errorFilePath)) fs.writeFileSync(SecurityMiddleware.errorFilePath, "");
            SecurityMiddleware.alreadyWrittenData = SecurityMiddleware.decrypt(fs.readFileSync(SecurityMiddleware.errorFilePath));
            SecurityMiddleware.writeRequestToFile(ip);
            if(SecurityMiddleware.getErrorCount(ip) > 4) {
                SecurityMiddleware.ban(ip);
            }
        } else {
            SecurityMiddleware.unban(ip);
        }

        await next();
    }
}