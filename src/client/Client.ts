import { ButtonInteraction, ChannelType, ChatInputCommandInteraction, Client, Collection, GatewayIntentBits, Locale, SlashCommandBuilder } from "discord.js";
import { Logger, Words, localizations } from "@/globals";
import * as config from "./config.json";
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
	status = BotStatuses.STABLE;
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

	constructor() {
		super({
			intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
		});

		this.logger = new Logger();
		this.words = new Words();
	}

	async init() {
		await this.initLogger();
		await this.initCommands();
		await this.initButtons();
		await this.initWords();
	}

	async handleCommand(interaction: ChatInputCommandInteraction) {
		const command = client.commands.get(interaction.commandName);

		if (!command) {
			throw "Command not found: " + interaction.commandName;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);

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

	async initLogger() {
		const logChannel = await this.channels.fetch(config.logChannelId);

		if (logChannel?.type !== ChannelType.GuildText) {
			throw "Log Channel must be a Text Channel.";
		}

		this.logger.init(logChannel);

		this.logger.log("Chizue is initializing...");
	}

	async initCommands() {
		this.logger.log("Loading Slash Commands...");

		const commandsPath = path.join(import.meta.dir, config.commandsPath);
		const commandFiles = readdirSync(commandsPath);
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command: any = await import(filePath);
			client.commands.set(command.default.data.name, command.default);
		}

		this.logger.log(`Loaded ${commandFiles.length} Slash Commands.`);
	}

	async initButtons() {
		this.logger.log("Loading Buttons...");

		const buttonsPath = path.join(import.meta.dir, config.buttonsPath);
		const buttonFiles = readdirSync(buttonsPath);
		for (const file of buttonFiles) {
			const filePath = path.join(buttonsPath, file);
			const button: any = await import(filePath);
			client.buttons.set(button.default.data.id, button.default);
		}

		this.logger.log(`Loaded ${buttonFiles.length} Buttons.`);
	}

	async initWords() {
		const wordSums = await this.words.init();

		this.logger.log(`**${wordSums.tr}** Turkish Word initialized.`);
		this.logger.log(`**${wordSums.en}** English Word initialized.`);
		this.logger.log("Word initialization completed.");
	}

	getLocalization<T extends boolean = false>(
		initialLocale: Locale,
		key: keyof (typeof localizations)["en"]
	): T extends false ? string : (arg: string) => string {
		let locale: keyof typeof localizations = "tr";

		if (initialLocale !== Locale.Turkish && [Locale.EnglishGB, Locale.EnglishUS].includes(initialLocale)) {
			locale = "en";
		}

		if (localizations[locale]?.[key]) {
			return localizations[locale][key] as T extends false ? string : (arg: string) => string;
		} else {
			throw new Error(`Localization not found for ${key} in ${locale}`);
		}
	}
}

const client = new BotClient();

export { client };
