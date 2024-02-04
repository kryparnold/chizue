import { IStats } from "@/types";
import { Colors, EmbedBuilder, Message, TextChannel } from "discord.js";
import { Utils, client, prisma } from "@/globals";

export class Stats {
    // Properties to store Discord TextChannel, Message, Intervals, and various statistics
    private statsChannel!: TextChannel;
    private statsMessage!: Message;
    private all!: IStats;
    private periodicStats!: { hourly: IStats; daily: IStats };
    private updateIntervals!: NodeJS.Timeout[];

    // Initialization method
    async init(statsChannel: TextChannel, statsMessage: Message, initialWordCount: number) {
        const wipedData = await this.getWipedStats();
        const { wordCount, ...wipedAllData } = wipedData; // Deconstructing the wordCount from wipedData to pass it to all data

        // Initialize statistics and periodic statistics
        this.all = { wordCount: initialWordCount, ...wipedAllData };
        this.periodicStats = { daily: wipedData, hourly: wipedData };

        // Assign provided TextChannel and Message to class properties
        this.statsChannel = statsChannel;
        this.statsMessage = statsMessage;

        // Set up periodic updates using setInterval
        this.updateIntervals = [
            setInterval(() => this.updateStats(), 60000),
            setInterval(() => this.saveStats(), 10000),
            setInterval(() => this.sendStats("Saatlik", "hourly"), Utils.hourToMs(3)),
            setInterval(() => this.sendStats("Günlük", "daily"), Utils.hourToMs(24)),
        ];
    }

    // Update the statistics displayed in the Discord message
    private async updateStats() {
        // Get the embed for general stats
        const embed = await this.getAllStatsEmbed();

        // Edit the message with embed
        await this.statsMessage.edit({ embeds: [embed] });
    }

    // Save statistics to a file
    private async saveStats() {
        const { wordCount, guildCount } = this.all;
        await prisma.stats
            .update({
                where: {
                    id: 0,
                },
                data: {
                    guildCount: {
                        set: guildCount,
                    },
                    wordCount: {
                        set: wordCount,
                    },
                },
            })
            .catch(async (error) => {
                await prisma.stats.create({
                    data: {
                        id: 0,
                        wordCount: wordCount ?? 0,
                        guildCount: guildCount ?? 0,
                    },
                });
            });
    }

    // Send statistics for a specific period to the Discord channel
    private async sendStats(periodName: string, periodKey: keyof typeof this.periodicStats) {
        // Copy the stats object
        const stats = Object.assign({}, this.periodicStats[periodKey]);

        // Wipe the stats
        this.periodicStats[periodKey] = await this.getWipedStats();

        // Get the embed by stats
        const embed = await this.getStatsEmbed(stats);

        // Don't send the embed if there is no field
        if (embed.data.fields?.length === 0) return;

        // Send the stat embed
        await this.statsChannel.send({ embeds: [embed.setTitle(`${periodName} İstatistik Raporu`)] });
    }

    // Generate an embed with all statistics, including games and guilds
    private async getAllStatsEmbed() {
        const guildCount = client.guilds.cache.size;
        const gameCount = client.games.count();
        const playerCount = await client.playerCount();

        // Build and return the embed with all statistics
        const statFields = [
            { name: "Sunucu Sayısı", value: guildCount.toString() },
            { name: "Oyun Sayısı", value: gameCount.toString() },
            { name: "Kelime Sayısı", value: this.all.wordCount.toString() },
            { name: "Oyuncu Sayısı", value: playerCount.toString() },
        ];

        return new EmbedBuilder().setTitle("Veriler & İstatistikler").setColor(Colors.Blue).addFields(statFields);
    }

    // Generate an embed with specific statistics, including games and guilds
    private async getStatsEmbed(stats: { wordCount: number; playerCount: number; gameCount: number; guildCount: number }) {
        const playerCount = client.players.count();
        const gameCount = client.games.count();
        const guildCount = client.guilds.cache.size;

        // Build and return the embed with specific statistics
        const statFields = [
            { name: "Yazılan Kelime", value: stats.wordCount.toString() },
            { name: "Eklenen Oyuncu", value: (playerCount - stats.playerCount).toString() },
            { name: "Oyun Sayısı", value: (gameCount - stats.gameCount).toString() },
            { name: "Sunucu Sayısı", value: (guildCount - stats.guildCount).toString() },
        ].filter((field) => parseInt(field.value) !== 0); // Filter out fields with value 0

        return new EmbedBuilder()
            .setColor(Colors.Green)
            .setAuthor({ name: client.user?.username as string, iconURL: client.user?.avatarURL() as string })
            .addFields(statFields);
    }

    // Generate wiped data for periodic statistics
    private async getWipedStats() {
        const playerCount = await client.playerCount();
        const gameCount = client.games.count();
        const guildCount = client.guilds.cache.size;

        // Return wiped data with initial word count, player count, game count, guild count, and start time
        return { wordCount: 0, playerCount, gameCount, guildCount, startTime: new Date().getHours() };
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
