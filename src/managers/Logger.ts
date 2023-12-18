import { Channel, TextChannel } from "discord.js";

class Logger{
    public logChannel: TextChannel | undefined;
    private defaultPrefix = "[Chizue]"

    log(logMessage: string){
        console.log(`${this.defaultPrefix} ${logMessage}`);
        this.logChannel?.send(`${this.defaultPrefix} ${logMessage}`);
    }
    
}

export { Logger };