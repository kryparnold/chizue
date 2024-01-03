// Import necessary modules and dependencies from external sources
import { Utils, client, prisma } from "@/globals";
import { CountingGame as CountingGameModel, GameType } from "@prisma/client";
import { Locale, Message } from "discord.js";

// Define the CountingGame class
export class CountingGame {
	// Properties of the CountingGame class
	public id: string;
	private player: string;
	public multiplier: number;
	public readonly type = GameType.CountingGame;
	public recentNumber: number;

	// Constructor to initialize the CountingGame instance
	constructor(game: CountingGameModel) {
		this.id = game.id;
		this.player = game.player;
		this.multiplier = game.multiplier;
		this.recentNumber = game.recentNumber;
	}

	// Method to handle a number input in the counting game
	async handleNumber(message: Message) {
		// Extract the integer from the message content
		const integer = +message.content;

		// Determine the locale based on the guild's preferred locale or default to English (US)
		const locale = Utils.formatLocale(message.guild?.preferredLocale ?? Locale.EnglishUS);

		// Check if the message author is the same as the player of the current game
		if (message.author.id === this.player) {
			// Delete the current message and send a reply indicating the same player error
			await message.delete().catch(() => {});
			await message.channel.send(client.getLocalization(locale, "gameSamePlayer")).then((reply) => setTimeout(() => reply.delete(), 5000));
			return;
		} else if (integer != this.recentNumber + this.multiplier) {
			// If the input number is incorrect, react with a deny emoji, send the correct number, and reset the game state
			await message.react(client.emotes.deny);
			await message.channel.send(this.multiplier.toString()).then(async (message) => await message.react(client.emotes.accept));
			this.recentNumber = this.multiplier;
			this.player = "";
			return;
		}

		// If the input number is correct, react with an accept emoji and update the game state
		await message.react(client.emotes.accept);
		this.recentNumber = integer;
		this.player = message.author.id;
		await this.save();
	}

	// Method to set the multiplier of the counting game
	async setMultiplier(multiplier: number) {
		// Update the multiplier and save the game state
		this.multiplier = multiplier;
		await this.save();
		return this;
	}

	// Method to save the current game state to the database
	async save() {
		await prisma.countingGame.update({
			where: {
				id: this.id,
			},
			data: {
				player: this.player,
				multiplier: this.multiplier,
				recentNumber: this.recentNumber,
			},
		});
	}
}
