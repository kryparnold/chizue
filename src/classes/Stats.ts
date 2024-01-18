import { IStats } from "@/types";
import { Colors, EmbedBuilder, Message, TextChannel } from "discord.js";
import { Utils, client } from "@/globals";
import fs from "fs/promises";

export class Stats {
    // Properties to store Discord TextChannel, Message, Intervals, and various statistics
    private statsChannel!: TextChannel;
    private statsMessage!: Message;
    private all!: IStats;
    private periodicStats!: { hourly: IStats; daily: IStats };
    private updateIntervals!: NodeJS.Timeout[];

    // Initialization method
    async init(statsChannel: TextChannel, statsMessage: Message) {
        // Dynamically import statistics from a specified path
        const stats = await import(client.config.statsPath);
        const startTime = new Date().getTime();
        const playerCount = await client.playerCount();
        const wipedData = await this.getWipedData();

        // Initialize statistics and periodic statistics
        this.all = { ...stats.default, playerCount, startTime };
        this.periodicStats = { daily: wipedData, hourly: wipedData };

        // Assign provided TextChannel and Message to class properties
        this.statsChannel = statsChannel;
        this.statsMessage = statsMessage;

        // Set up periodic updates using setInterval
        this.updateIntervals = [
            setInterval(() => this.updateStats(), 60000),
            setInterval(() => this.sendStats("Saatlik", "hourly"), Utils.hourToMs(3)),
            setInterval(() => this.sendStats("Günlük", "daily"), Utils.hourToMs(24)),
        ];
    }

    // Update the statistics displayed in the Discord message
    private async updateStats() {
        // Check if there are changes before updating
        const embed = await this.getAllStatsEmbed();
        if (this.statsChanged(this.all, this.periodicStats.hourly)) {
            await this.statsMessage.edit({ embeds: [embed] });
            await this.saveStats();
        }
    }

    // Save statistics to a file
    private async saveStats() {
        const { wordCount } = this.all;
        await fs.writeFile(client.config.statsPath, JSON.stringify({ wordCount }, null, 4), { encoding: "utf-8" });
    }

    // Send statistics for a specific period to the Discord channel
    private async sendStats(periodName: string, periodKey: keyof typeof this.periodicStats) {
        // Extract player count, word count, game count, and guild count for the specified period
        const stats = Object.assign({}, this.periodicStats[periodKey]);
        this.periodicStats[periodKey] = await this.getWipedData();

        // Check if there are changes before sending
        if (this.statsChanged(stats, this.periodicStats[periodKey])) {
            const embed = await this.getStatsEmbed(stats);
            await this.statsChannel.send({ embeds: [embed.setTitle(`${periodName} İstatistik Raporu`)] });
        }
    }

    // Generate an embed with all statistics, including games and guilds
    private async getAllStatsEmbed() {
        const guildCount = client.guilds.cache.size;
        const gameCount = client.games.count();
        const playerCount = await client.playerCount();

        // Build and return the embed with all statistics
        return new EmbedBuilder()
            .setTitle("Veriler & İstatistikler")
            .setColor(Colors.Blue)
            .setFields(
                { name: "Sunucu Sayısı", value: guildCount.toString() },
                { name: "Oyun Sayısı", value: gameCount.toString() },
                { name: "Kelime Sayısı", value: this.all.wordCount.toString() },
                { name: "Oyuncu Sayısı", value: playerCount.toString() }
            );
    }

    // Generate an embed with specific statistics, including games and guilds
    private async getStatsEmbed(stats: { wordCount: number; playerCount: number; gameCount: number; guildCount: number }) {
        const playerCount = client.players.count();
        const gameCount = client.games.count();
        const guildCount = client.guilds.cache.size;

        // Build and return the embed with specific statistics
        return new EmbedBuilder()
            .setColor(Colors.Green)
            .setAuthor({ name: client.user?.username as string, iconURL: client.user?.avatarURL() as string })
            .setFields(
                { name: "Yazılan Kelime", value: stats.wordCount.toString() },
                { name: "Eklenen Oyuncu", value: (playerCount - stats.playerCount).toString() },
                { name: "Oyun Sayısı", value: (gameCount - stats.gameCount).toString() },
                { name: "Sunucu Sayısı", value: (guildCount - stats.guildCount).toString() }
            );
    }

    // Generate wiped data for periodic statistics
    private async getWipedData() {
        const playerCount = await client.playerCount();
        const gameCount = client.games.count();
        const guildCount = client.guilds.cache.size;

        // Return wiped data with initial word count, player count, game count, guild count, and start time
        return { wordCount: 0, playerCount, gameCount, guildCount, startTime: new Date().getHours() };
    }

    // Check if statistics have changed
    private statsChanged(statsA: any, statsB: any) {
        return Object.keys(statsA).some((key) => statsA[key] !== statsB[key]);
    }

    // Increase the word count in both all-time and periodic statistics
    async increaseWordCount(count = 1) {
        this.all.wordCount += count;
        this.periodicStats.daily.wordCount += count;
        this.periodicStats.hourly.wordCount += count;
    }

    // Method to stop intervals
    async stopUpdating() {
        this.updateIntervals.forEach((interval) => clearInterval(interval));
        await this.updateStats();
        await this.sendStats("Saatlik", "hourly");
        await this.sendStats("Günlük", "daily");
    }
}
