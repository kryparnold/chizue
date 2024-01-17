import {
    ButtonInteraction,
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    Collection,
    GatewayIntentBits,
    Message,
    Options,
    SlashCommandBuilder,
    TextChannel,
} from "discord.js";
import { Logger, Words, localizations, prisma, Games, Utils, Stats, Players, ButtonParams, Config, ProcessTracker, Process, ProcessTypes } from "@/globals";

// Importing configuration and file system modules
import { readdirSync } from "fs";
import path from "node:path";
import { GameType } from "@prisma/client";
import { randomUUID } from "crypto";

// Enum representing different states of the bot
export enum BotStatuses {
    Initializing,
    Stable,
    Quitting,
}

// Extension of the default Discord.js Client class with additional properties and methods
class BotClient extends Client {
    logger: Logger;
    words: Words;
    games: Games;
    stats: Stats;
    players: Players;
    processes: ProcessTracker;
    config = new Config();
    status = BotStatuses.Initializing;
    activeWordles: string[] = [];
    private commands = new Collection<
        string,
        {
            data: SlashCommandBuilder;
            execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
        }
    >();
    private buttons = new Collection<
        string,
        {
            data: { id: string; params: string[] };
            execute: (interaction: ButtonInteraction, params: ButtonParams) => Promise<void>;
        }
    >();

    constructor() {
        super({
            intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
        });

        this.logger = new Logger();
        this.words = new Words();
        this.games = new Games();
        this.stats = new Stats();
        this.players = new Players();
        this.processes = new ProcessTracker();
    }

    // Initialize various components of the bot
    async init() {
        this.updateStatus(this.config.clientStatus);
        setInterval(() => this.updateStatus(this.config.clientStatus), 600000);
        await this.initLogger();
        await this.initStats();
        await this.initCommands();
        await this.initButtons();
        await this.initPlayers();
        await this.initGames();
        await this.initWords();
    }

    // Method to update client status
    updateStatus(status: string) {
        this.user?.setActivity(status, { type: 4 });
    }

    // Handle chat input commands
    async handleCommand(interaction: ChatInputCommandInteraction) {
        const command = client.commands.get(interaction.commandName);
        const subCommand = interaction.options.getSubcommand(false) ?? undefined;

        if (!command) {
            throw "Command not found: " + interaction.commandName;
        }

        try {
            // Create a Slash Command Process to track the command execution
            const commandProcess: Process = {
                id: randomUUID(),
                startTime: new Date().getTime(),
                type: ProcessTypes.SlashCommand,
                props: {
                    name: interaction.commandName,
                    subCommand,
                    authorId: interaction.user.id,
                    authorName: interaction.user.username,
                },
            };

            // Add the Slash Command Process to the tracker
            this.processes.add(commandProcess);

            // Call the command's execute method
            await command.execute(interaction);

            // Remove the Slash Command Process from the tracker after processing
            this.processes.remove(commandProcess.id);
        } catch (error) {
            console.error(error);

            // Respond to the user with an error message
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            }
        }
    }

    // Handle button interactions
    async handleButton(interaction: ButtonInteraction) {
        if (interaction.customId.startsWith("_")) return;

        const [buttonId, ..._params] = interaction.customId.split("_");

        const button = client.buttons.get(buttonId);

        if (!button) {
            throw "Button not found: " + buttonId;
        }

        const params: ButtonParams = {};

        if (_params.length) {
            button.data.params.forEach((param, index) => {
                params[param] = _params[index] ?? undefined;
            });
        }

        try {
            // Create a Button Process to track the button execution
            const buttonProcess: Process = {
                id: randomUUID(),
                startTime: new Date().getTime(),
                type: ProcessTypes.Button,
                props: {
                    name: buttonId,
                    authorId: interaction.user.id,
                    authorName: interaction.user.username,
                },
            };

            // Add the Button Process to the tracker
            this.processes.add(buttonProcess);

            // Call the button's execute method
            await button.execute(interaction, params);

            // Remove the Button Process from the tracker after processing
            this.processes.remove(buttonProcess.id);
        } catch (error) {
            console.error(error);

            // Respond to the user with an error message
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                });
            }
        }
    }

    // Handle messages for the game
    async handleMessage(message: Message) {
        // Retrieve the game associated with the message's channel
        const game = this.games.get(message.channelId);

        // Check conditions that may indicate the message is not relevant for the game
        if (
            !game || // Check if there is a game in the message's channel
            !message.content || // Not all messages have content
            message.author.bot || // Check if the message author is a bot
            message.author.system // Check if the message author is a system
        )
            return;

        // Handle messages based on the type of game
        if (game.type === GameType.WordGame && !Utils.invalidCharacters.test(message.content)) {
            // Check if the game type is WordGame and the message content is a valid word.

            // Create a Word Process to track the word-related operation
            const wordProcess: Process = {
                id: randomUUID(),
                startTime: new Date().getTime(),
                type: ProcessTypes.Word,
                props: {
                    word: message.content,
                    playerId: message.author.id,
                },
            };

            // Add the Word Process to the tracker
            this.processes.add(wordProcess);

            // Call the game's handleWord method to process the word-related operation
            await game.handleWord(message);

            // Remove the Word Process from the tracker after processing
            this.processes.remove(wordProcess.id);
        } else if (game.type === GameType.CountingGame && !isNaN(+message.content)) {
            // Check if the game type is CountingGame and the message content is a valid number.

            // Create a Number Process to track the number-related operation
            const numberProcess: Process = {
                id: randomUUID(),
                startTime: new Date().getTime(),
                type: ProcessTypes.Number,
                props: {
                    integer: +message.content,
                    playerId: message.author.id,
                },
            };

            // Add the Number Process to the tracker
            this.processes.add(numberProcess);

            // Call the game's handleNumber method to process the number-related operation
            await game.handleNumber(message);

            // Remove the Number Process from the tracker after processing
            this.processes.remove(numberProcess.id);
        }
    }

    // Initialize the logger with the specified client username
    async initLogger() {
        const logChannel = await this.channels.fetch(this.config.logChannelId);

        if (logChannel?.type !== ChannelType.GuildText) {
            throw "Log Channel must be a Text Channel.";
        }

        this.logger.init(logChannel);

        this.logger.log(`${this.user?.username} is initializing...`);
    }

    // Initialize the Stats with the specified channel
    async initStats() {
        const statsChannel = await this.channels.fetch(this.config.statsChannelId);
        const statsMessage = await ((await this.channels.fetch(this.config.statsMessageChannelId)) as TextChannel).messages.fetch(this.config.statsMessageId);

        if (statsChannel?.type !== ChannelType.GuildText) {
            throw "Stats Channel must be a Text Channel.";
        }

        await this.stats.init(statsChannel, statsMessage);

        this.logger.log("Stats initialized.");
    }

    // Initialize slash commands
    async initCommands() {
        const commandFiles = readdirSync(this.config.commandsPath);

        for (const file of commandFiles) {
            const filePath = path.join(this.config.commandsPath, file);
            const command: any = await import(filePath);
            client.commands.set(command.default.data.name, command.default);
        }

        this.logger.log(`Loaded ${commandFiles.length} Slash Commands.`);
    }

    // Initialize buttons
    async initButtons() {
        const buttonFiles = readdirSync(this.config.buttonsPath);

        for (const file of buttonFiles) {
            const filePath = path.join(this.config.buttonsPath, file);
            const button: any = await import(filePath);
            client.buttons.set(button.default.data.id, button.default);
        }

        this.logger.log(`Loaded ${buttonFiles.length} Buttons.`);
    }

    // Initialize players
    async initPlayers() {
        const players = (await prisma.player.findMany()) ?? [];

        this.players.init(players);

        this.logger.log(`Loaded ${players.length} Players.`);
    }

    // Initialize games
    async initGames() {
        const wordGames = (await prisma.wordGame.findMany()) ?? [];
        const countingGames = (await prisma.countingGame.findMany()) ?? [];
        const players = this.players.getAll();

        this.games.init(wordGames, players, countingGames);

        this.logger.log(`Loaded ${wordGames.length + countingGames.length} Games.`);
    }

    // Initialize word data
    async initWords() {
        const wordReportChannel = await this.channels.fetch(this.config.wordReportChannelId);
        const wordLogChannel = await this.channels.fetch(this.config.wordLogChannelId);

        if (wordReportChannel?.type !== ChannelType.GuildText || wordLogChannel?.type !== ChannelType.GuildText) {
            throw "Word Report && Word Log Channel must be a Text Channel.";
        }

        const wordSums = await this.words.init(wordReportChannel, wordLogChannel);

        this.logger.log(`**${wordSums.tr}** Turkish Word initialized.`);
        this.logger.log(`**${wordSums.en}** English Word initialized.`);
        this.logger.log("Word initialization completed.");
    }

    // Retrieve a localized string based on the provided locale and key
    getLocalization<T extends boolean = false>(
        locale: keyof typeof localizations,
        key: keyof (typeof localizations)["en"]
    ): T extends false ? string : (arg: string) => string {
        if (localizations[locale]?.[key]) {
            return localizations[locale][key] as T extends false ? string : (arg: string) => string;
        } else {
            throw new Error(`Localization not found for ${key} in ${locale}`);
        }
    }

    // Method to get player count from database
    async playerCount() {
        return await prisma.player.count();
    }

    // Method to set client status
    async setStatus(status: string) {
        this.updateStatus(status);
        this.config.clientStatus = status;
        await this.config.save();
    }

    // Method to set client accept emote
    async setAcceptEmote(emote: string) {
        this.config.acceptEmote = emote;
        await this.config.save();
    }

    // Method to make announcement in all game channels
    async makeAnnouncement(announcement: string) {
        const gameChannelIds = this.games.getIds();
        let announcementCounter = 0;

        for (let i = 0; i < gameChannelIds.length; i++) {
            const channelId = gameChannelIds[i];
            const channel = (await client.channels.fetch(channelId)) as TextChannel;

            if (!channel) {
                throw "Invalid game channel.";
            }

            announcementCounter++;
            await channel.send(announcement);
        }

        return announcementCounter;
    }
}

// Create an instance of the bot client
const client = new BotClient();

// Export the client for external use if needed
export { client };
