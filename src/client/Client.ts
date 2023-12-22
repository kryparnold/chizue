import {
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    Collection,
    GatewayIntentBits,
    SlashCommandBuilder,
} from "discord.js";
import { Logger } from "@/managers/Logger";
import { Words } from "@/managers/Words";
import * as config from "@/config.json";
import { readdirSync } from "fs";
import path from "node:path";


export enum BotStatuses {
    INITIALIZING,
    STABLE,
    CLOSING,
}

class BotClient extends Client {
    logger: Logger;
    words: Words;
    status = BotStatuses.INITIALIZING;
    commands = new Collection<
        string,
        { data: SlashCommandBuilder; execute: (interaction: ChatInputCommandInteraction) => Promise<void> }
    >();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
            ],
        });

        this.logger = new Logger();
        this.words = new Words();
    }

    async init() {
        await this.initLogger();
        await this.initCommands();
        await this.initWords();
    }

    async initLogger(){
        const logChannel = await this.channels.fetch(config.logChannelId);

        if (logChannel?.type !== ChannelType.GuildText) {
            throw "Log Channel must be a Text Channel.";
        }

        this.logger.init(logChannel);

        this.logger.log("Chizue is initializing...");
    }

    async initCommands(){
        this.logger.log("Loading Slash Commands...");

        const commandsPath = path.join(import.meta.dir, "../commands");
        const commandFiles = readdirSync(commandsPath);
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command: any = await import(filePath);
            client.commands.set(command.default.data.name, command.default);
        }

        this.logger.log(`Loaded ${commandFiles.length} Slash Commands.`);
    }

    async initWords(){
        const wordSums = await this.words.init();

        this.logger.log(`**${wordSums.tr}** Turkish Word initialized.`);
        this.logger.log(`**${wordSums.en}** English Word initialized.`);
        this.logger.log("Word initialization completed.");
    }
}

const client = new BotClient();

export { client };
