import {
	ButtonInteraction,
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	Collection,
	GatewayIntentBits,
	Locale,
	Message,
	SlashCommandBuilder,
} from "discord.js";
import { Logger, Words, localizations, prisma, Games, Utils } from "@/globals";

// Importing configuration and file system modules
import * as config from "./config.json";
import * as stats from "./stats.json";
import { readdirSync, writeFileSync } from "fs";
import path from "node:path";
import { GameType, Locales } from "@prisma/client";

// Enum representing different states of the bot
export enum BotStatuses {
	Initializing,
	Stable,
	Closing,
}

// Extension of the default Discord.js Client class with additional properties and methods
class BotClient extends Client {
	logger: Logger;
	words: Words;
	games: Games;
    //@ts-ignore
    stats = stats.default;
	status = BotStatuses.Stable;
	commands = new Collection<
		string,
		{
			data: SlashCommandBuilder;
			execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
		}
	>();
	buttons = new Collection<
		string,
		{
			data: { id: string };
			execute: (interaction: ButtonInteraction) => Promise<void>;
		}
	>();
	emotes = {
		accept: config.acceptEmote,
	};

	constructor() {
		super({
			intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
		});

		this.logger = new Logger();
		this.words = new Words();
		this.games = new Games();

		setInterval(() => {
			writeFileSync(config.statsPath, JSON.stringify(this.stats), "utf-8");
		}, 10000);
	}

	// Initialize various components of the bot
	async init() {
		await this.initLogger();
		await this.initCommands();
		await this.initButtons();
		await this.initGames();
		await this.initWords();
	}

	// Handle chat input commands
	async handleCommand(interaction: ChatInputCommandInteraction) {
		const command = client.commands.get(interaction.commandName);

		if (!command) {
			throw "Command not found: " + interaction.commandName;
		}

		try {
			await command.execute(interaction);
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

		const button = client.buttons.get(interaction.customId);

		if (!button) {
			throw "Button not found: " + interaction.customId;
		}

		try {
			await button.execute(interaction);
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

	// Placeholder function for handling messages
	async handleMessage(message: Message) {
		const game = this.games.get(message.channelId);

		if (
			!game || // Check if there is a game in message's channel
			!message.content || // Not all messages have content
			message.author.bot || // Check if the message author is a bot
			message.author.system // Check if the message author is a system
		)
			return;

		if (game.type === GameType.WordGame && !Utils.invalidCharacters.test(message.content)) {
			// Check if game type is WordGame(prisma) and the message content is a valid word.
			game.handleWord(message);
		} else if (game.type === GameType.CountingGame && !isNaN(+message.content)) {
			// Check if game type is CountingGame(prisma) and the message content is a valid number.
			game.handleNumber(message);
		}
	}

	// Initialize the logger with the specified client username
	async initLogger() {
		const logChannel = await this.channels.fetch(config.logChannelId);

		if (logChannel?.type !== ChannelType.GuildText) {
			throw "Log Channel must be a Text Channel.";
		}

		this.logger.init(logChannel);

		this.logger.log(`${this.user?.username} is initializing...`);
	}

	// Initialize slash commands
	async initCommands() {
		const commandsPath = path.join(import.meta.dir, config.commandsPath);
		const commandFiles = readdirSync(commandsPath);

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command: any = await import(filePath);
			client.commands.set(command.default.data.name, command.default);
		}

		this.logger.log(`Loaded ${commandFiles.length} Slash Commands.`);
	}

	// Initialize buttons
	async initButtons() {
		const buttonsPath = path.join(import.meta.dir, config.buttonsPath);
		const buttonFiles = readdirSync(buttonsPath);

		for (const file of buttonFiles) {
			const filePath = path.join(buttonsPath, file);
			const button: any = await import(filePath);
			client.buttons.set(button.default.data.id, button.default);
		}

		this.logger.log(`Loaded ${buttonFiles.length} Buttons.`);
	}

	//Initialize games
	async initGames() {
		const wordGames = (await prisma.wordGame.findMany()) ?? [];
		const countingGames = (await prisma.countingGame.findMany()) ?? [];
        const players = (await prisma.player.findMany()) ?? [];

		this.games.init(wordGames, players, countingGames);

		this.logger.log(`Loaded ${wordGames.length + countingGames.length} Games.`);
	}

	// Initialize word data
	async initWords() {
		const wordSums = await this.words.init();

		this.logger.log(`**${wordSums.tr}** Turkish Word initialized.`);
		this.logger.log(`**${wordSums.en}** English Word initialized.`);
		this.logger.log("Word initialization completed.");
	}

	// Retrieve a localized string based on the provided locale and key
	getLocalization<T extends boolean = false>(
		initialLocale: Locale | Locales,
		key: keyof (typeof localizations)["en"]
	): T extends false ? string : (arg: string) => string {
		let locale: keyof typeof localizations = "tr";

		if (![Locale.Turkish, "Turkish"].includes(initialLocale) && [Locale.EnglishGB, Locale.EnglishUS, "English"].includes(initialLocale)) {
			locale = "en";
		}

		if (localizations[locale]?.[key]) {
			return localizations[locale][key] as T extends false ? string : (arg: string) => string;
		} else {
			throw new Error(`Localization not found for ${key} in ${locale}`);
		}
	}
}

// Create an instance of the bot client
const client = new BotClient();

// Export the client for external use if needed
export { client };
