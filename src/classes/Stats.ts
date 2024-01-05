// Import necessary modules and types from Discord.js, local files, and Node.js
import { IStats } from "@/types";
import { Colors, EmbedBuilder, Message, TextChannel } from "discord.js";
import { Utils, client } from "@/globals";
import { writeFileSync } from "fs";
import * as config from "@/client/config.json";

// Define a class called Stats to encapsulate statistics-related functionality
export class Stats {
	// Private properties to store Discord TextChannel, Message, and various statistics
	private statsChannel!: TextChannel;
	private statsMessage!: Message;
	private all!: IStats;
	private periodicStats!: {
		hourly: IStats;
		daily: IStats;
	};

	// Initialization method, takes a TextChannel and Message as parameters
	async init(statsChannel: TextChannel, statsMessage: Message) {
		// Dynamically import statistics from a specified path
		const stats = (await import(config.statsPath)).default;
		// Get current time, player count, and wiped data for initialization
		const startTime = new Date().getTime();
		const playerCount = await client.playerCount();
		const wipedData = await this.getWipedData();
		// Initialize all statistics and periodic statistics
		this.all = { ...stats, playerCount, startTime };
		this.periodicStats = {
			daily: wipedData,
			hourly: wipedData,
		};

		// Assign provided TextChannel and Message to class properties
		this.statsChannel = statsChannel;
		this.statsMessage = statsMessage;

		// Set up periodic updates using setInterval
		setInterval(() => this.updateStats(), 5000);
		setInterval(() => this.sendStats("Saatlik", "hourly"), Utils.hourToMs(3));
		setInterval(() => this.sendStats("Günlük", "daily"), Utils.hourToMs(24));
	}

	// Update the statistics displayed in the Discord message
	private async updateStats() {
		await this.statsMessage.edit({
			embeds: [await this.getAllStatsEmbed()],
		});
        await this.saveStats();
	}

	// Save statistics to a file
	async saveStats() {
		writeFileSync(config.statsPath, JSON.stringify({ wordCount: this.all.wordCount }), { encoding: "utf-8" });
	}

	// Send statistics for a specific period to the Discord channel
	async sendStats(periodName: string, periodKey: keyof typeof this.periodicStats) {
		// Extract player count and word count for the specified period
		const { playerCount, wordCount } = Object.assign({}, this.periodicStats[periodKey]);
		// Update the periodic statistics for the next period
		this.periodicStats[periodKey] = await this.getWipedData();

		// Create and send an embed with the periodic statistics
		const periodicStatsEmbed = (await this.getStatsEmbed({ wordCount, playerCount })).setTitle(`${periodName} İstatistik Raporu`);

		await this.statsChannel.send({
			embeds: [periodicStatsEmbed],
		});
	}

	// Increase the word count in both all-time and periodic statistics
	async increaseWordCount(count = 1) {
		this.all.wordCount += count;
		this.periodicStats.daily.wordCount += count;
		this.periodicStats.hourly.wordCount += count;
	}

	// Generate an embed with all statistics
	private async getAllStatsEmbed() {
		// Get counts for guilds, games, and players
		const guildCount = client.guilds.cache.size;
		const gameCount = client.games.count();
		const playerCount = await client.playerCount();

		// Build and return the embed with all statistics
		return new EmbedBuilder().setTitle("Veriler & İstatistikler").setColor(Colors.Blue).setFields(
			{
				name: "Sunucu Sayısı",
				value: guildCount.toString(),
			},
			{
				name: "Oyun Sayısı",
				value: gameCount.toString(),
			},
			{
				name: "Kelime Sayısı",
				value: this.all.wordCount.toString(),
			},
			{
				name: "Oyuncu Sayısı",
				value: playerCount.toString(),
			}
		);
	}

	// Generate an embed with specific statistics
	private async getStatsEmbed(stats: { wordCount: number; playerCount: number }) {
		// Get the current player count
		const playerCount = await client.playerCount();

		// Build and return the embed with specific statistics
		return new EmbedBuilder()
			.setColor(Colors.Green)
			.setAuthor({ name: client.user?.username as string, iconURL: client.user?.avatarURL() as string })
			.setFields(
				{
					name: "Yazılan Kelime",
					value: stats.wordCount.toString(),
				},
				{
					name: "Eklenen Oyuncu",
					value: (playerCount - stats.playerCount).toString(),
				}
			);
	}

	// Generate wiped data for periodic statistics
	private async getWipedData() {
		// Get the current player count
		const playerCount = await client.playerCount();

		// Return wiped data with initial word count, player count, and start time
		return {
			wordCount: 0,
			playerCount: playerCount,
			startTime: new Date().getHours(),
		};
	}
}
