// Importing necessary types and modules from the project's global scope and Discord.js library
import { Utils, client } from "@/globals";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";

// Defining an interface to represent player scores
interface IPlayerScores {
    [x: string]: {
        username: string;
        score: number;
    };
}

// Exporting a default command object
export default {
    // Command data including name, description, and permissions
    data: new SlashCommandBuilder()
        .setName("scores")
        .setNameLocalization("tr", "skorlar")
        .setDescription("With this command you can see the top 10 highest score on the server.")
        .setDescriptionLocalization("tr", "Bu komutla sunucudaki en yüksek 10 skoru görebilirsin.")
        .setDMPermission(false),

    // Execution function for the command
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ephemeral: true});
        // Retrieving guild ID from the interaction
        const guildId = interaction.guildId!;

        // Retrieving all games associated with the guild
        const games = client.games.getGuildGames(guildId);

        // Extracting user metadata for footer information and locale
        const { userFooter, userLocale } = Utils.getUserMetadata(interaction.locale, interaction.user);

        // Creating an initial embed with basic information
        const initialEmbed = new EmbedBuilder()
            .setTitle(client.getLocalization<true>(userLocale, "commandScoresTitle")(interaction.guild?.name as string))
            .setColor(Colors.Blue)
            .setFooter(userFooter);

        // Object to store player scores
        const playerScores: IPlayerScores = {};

        // Iterating through each game and its players
        for (let i = 0; i < games.length; i++) {
            const game = games[i];
            const gamePlayers = game.players.getAll();

            for (let j = 0; j < gamePlayers.length; j++) {
                const gamePlayer = gamePlayers[j];
                const playerGameScore = gamePlayer.scores[guildId][game.id];

                // Fetching user information
                const { displayName, discriminator } = await client.users.fetch(gamePlayer.id);

                // Constructing a unique username for the player
                const username = displayName + (discriminator === "0" ? "" : `#${discriminator}`);

                // Updating player scores in the playerScores object
                if (!playerScores[gamePlayer.id]) {
                    playerScores[gamePlayer.id] = {
                        username,
                        score: playerGameScore,
                    };
                } else {
                    playerScores[gamePlayer.id].score += playerGameScore;
                }
            }
        }

        // Sorting the playerScores object by score in descending order and taking the top 10
        const leaderboard = Object.values(playerScores)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        // Handling the case where there are no games to display
        if (!leaderboard.length) {
            // Creating an embed to inform the user that there are no games
            const noGameEmbed = initialEmbed.setColor(Colors.Red).setDescription(client.getLocalization(userLocale, "commandScoresNoGames"));

            // Responding to the interaction with the no-games embed as an ephemeral message
            await interaction.editReply({
                embeds: [noGameEmbed]
            });

            return;
        }

        // Creating a string representation of the leaderboard
        const leaderboardString = leaderboard.map((player, index) => `**${index + 1}.** ${player.username}: ${player.score.toFixed(1)}`).join("\n");

        // Creating an embed with the leaderboard information
        const leaderboardEmbed = initialEmbed.setDescription(leaderboardString);

        // Responding to the interaction with the leaderboard embed as an ephemeral message
        await interaction.editReply({
            embeds: [leaderboardEmbed]
        });
    },
};
