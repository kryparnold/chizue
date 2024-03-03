// Import necessary modules and dependencies from external sources
import { Utils, client, prisma } from "@/globals";
import { CountingGame as RawCountingGame, GameType } from "@prisma/client";
import { GuildTextBasedChannel, Locale, Message } from "discord.js";

export class CountingGame {
    public id: string;
    private name: string;
    private recentPlayerId: string;
    public recentMessageId: string;
    public guildId: string;
    public multiplier: number;
    readonly type = GameType.CountingGame;
    public recentNumber: number;
    private isProcessing = false;

    // Constructor to initialize the CountingGame instance
    constructor(game: RawCountingGame) {
        this.id = game.id;
        this.name = game.name;
        this.recentPlayerId = game.recentPlayerId;
        this.recentMessageId = game.recentMessageId;
        this.guildId = game.guildId;
        this.multiplier = game.multiplier;
        this.recentNumber = game.recentNumber;
    }

    // Method to handle a number input in the counting game
    async handleNumber(message: Message) {
        // Check if a process is already in progress
        if (this.isProcessing) {
            // If so, wait for the process to complete
            await this.waitForProcessing();
        }

        // Mark the start of the processing
        this.isProcessing = true;

        // Extract the integer from the message content
        const integer = +message.content;

        // Determine the locale based on the guild's preferred locale or default to English (US)
        const locale = Utils.formatLocale(message.guild?.preferredLocale ?? Locale.EnglishUS);

        // Check if the message author is the same as the player of the current game
        if (message.author.id === this.recentPlayerId) {
            this.isProcessing = false;
            // Delete the current message and send a reply indicating the same player error
            await message.delete().catch(() => {});
            await message.channel.send(client.getLocalization(locale, "gameSamePlayer")).then((reply) => setTimeout(() => reply.delete(), 5000));
            return;
        } else if (integer != this.recentNumber + this.multiplier) {
            // If the input number is incorrect, react with a deny emoji, send the correct number, and reset the game state
            await message.react(client.config.denyEmote).catch(() => {});
            await message.channel.send(this.multiplier.toString()).then(async (message) => await message.react(client.config.acceptEmote));
            this.recentNumber = this.multiplier;
            this.recentPlayerId = "";
            await this.save();
            this.isProcessing = false;
            return;
        }

        // If the input number is correct, react with an accept emoji and update the game state
        await message.react(client.config.acceptEmote).catch(() => {});
        this.recentNumber = integer;
        this.recentPlayerId = message.author.id;
        this.recentMessageId = message.id;
        this.setName((message.channel as GuildTextBasedChannel).name);
        await this.save();
        this.isProcessing = false;
    }

    // Method to wait for the processing to complete
    private async waitForProcessing() {
        // Wait for isProcessing to become false
        while (this.isProcessing) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    // Method to set the multiplier of the counting game
    async setMultiplier(multiplier: number) {
        // Update the multiplier and save the game state
        this.multiplier = multiplier;
        await this.save();
        return this;
    }

    // Method to set the name
    setName(name: string) {
        this.name = name;
    }

    // Method to save the current game state to the database
    async save() {
        await prisma.countingGame.update({
            where: {
                id: this.id,
            },
            data: {
                name: this.name,
                recentPlayerId: this.recentPlayerId,
                recentMessageId: this.recentMessageId,
                multiplier: this.multiplier,
                recentNumber: this.recentNumber,
            },
        });
    }
}
