import { Channel, TextChannel } from "discord.js";

class Logger{
    public logChannel: TextChannel | undefined;
    private defaultPrefix = "[Chizue]";
    private logPool: string[] = [];

    async init(logChannel: TextChannel){
        this.logChannel = logChannel;
        setInterval(() => {
            if(this.logPool.length === 0) return;
            const logMessage = this.logPool.join("\n");
            this.logPool.length = 0;
            this.logChannel?.send(logMessage);
        },1500)
    }

    log(logMessage: string){
        console.log(`${this.defaultPrefix} ${logMessage}`);
        this.logPool.push(`${this.defaultPrefix} ${logMessage}`);
    }
    
}

export { Logger };