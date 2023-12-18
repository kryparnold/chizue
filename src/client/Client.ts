import { ChannelType, Client, GatewayIntentBits } from "discord.js";
import { Logger } from "../managers/Logger";
import * as config from "./config.json";

enum BotStatuses{
    INITIALIZING,
    STABLE,
    CLOSING
}

class BotClient extends Client {
    logger: Logger;
    status = BotStatuses.INITIALIZING;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
            ],
        });

        this.logger = new Logger();
    }

    async init() {
        const logChannel = await this.channels.fetch(config.logChannelId);

        if (logChannel?.type !== ChannelType.GuildText) {
            throw "Log Channel must be a Text Channel.";
        }

        this.logger.logChannel = logChannel;

        this.logger.log("Chizue is initializing...");
    }
}

const client = new BotClient();

export { client };
