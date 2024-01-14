import { Utils, client } from "@/globals";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder, User } from "discord.js";

interface IPlayerScores {
	[x: string]: {
		username: string;
		score: number;
	};
}

export default {
	data: new SlashCommandBuilder()
		.setName("scores")
		.setNameLocalization("tr", "skorlar")
		.setDescription("With this command you can see the top 10 highest score on the server.")
		.setDescriptionLocalization("tr", "Bu komutla sunucudaki en yüksek 10 skoru görebilirsin.")
		.setDMPermission(false),
	async execute(interaction: ChatInputCommandInteraction) {
		const guildId = interaction.guildId as string;
		const games = client.games.getGuildGames(guildId);

		const { userFooter, userLocale } = Utils.getUserMetadata(interaction.locale, interaction.user);

		const initialEmbed = new EmbedBuilder()
			.setTitle(client.getLocalization<true>(userLocale, "commandScoresTitle")(interaction.guild?.name as string))
			.setColor(Colors.Blue)
			.setFooter(userFooter);

		const playerScores: IPlayerScores = {};

		for (let i = 0; i < games.length; i++) {
			const game = games[i];
			const gamePlayers = game.players.getAll();

			for (let j = 0; j < gamePlayers.length; j++) {
				const gamePlayer = gamePlayers[j];
                const playerGameScore = gamePlayer.scores[guildId][game.id];
				const { displayName, discriminator } = await client.users.fetch(gamePlayer.id);

				let player = playerScores[gamePlayer.id];

				if (!player) {
					const username = displayName + (discriminator === "0" ? "" : `#${discriminator}`);

                    playerScores[gamePlayer.id] = {
                        username,
                        score: playerGameScore
                    }
				} else {
					player.score += playerGameScore;
				}
			}
		}

		const leaderboard = Object.values(playerScores)
			.sort((a, b) => b.score - a.score)
			.slice(0, 10);

		if (!leaderboard.length) {
			const noGameEmbed = initialEmbed.setColor(Colors.Red).setDescription(client.getLocalization(userLocale, "commandScoresNoGames"));

			await interaction.reply({
				embeds: [noGameEmbed],
				ephemeral: true,
			});

			return;
		}

		const leaderboardString = leaderboard.map((player, index) => `**${index + 1}.** ${player.username}: ${player.score.toFixed(1)}`).join("\n");

		const leaderboardEmbed = initialEmbed.setDescription(leaderboardString);

		await interaction.reply({
			embeds: [leaderboardEmbed],
			ephemeral: true,
		});
	},
};
