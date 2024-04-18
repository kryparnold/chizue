// Importing necessary types and modules from the project's global scope and Discord.js library
import { Utils, client } from "@/globals";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";

// Exporting a default command object
export default {
    // Command data including name, description, and options
    data: new SlashCommandBuilder()
        .setName("score")
        .setNameLocalization("tr", "skor")
        .setDescription("With this command, you can view the score of the member you want.")
        .setDescriptionLocalization("tr", "Bu komutla istediğin üyenin skorunu görebilirsin.")
        .setDMPermission(false)
        .addUserOption((option) =>
            option.setName("member").setNameLocalization("tr", "üye").setDescription("Select a member.").setDescriptionLocalization("tr", "Bir üye seç.")
        ),

    // Execution function for the command
    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        // Retrieving the selected member from the interaction options, defaulting to the interaction user
        const selectedMember = interaction.options.getUser("member") ?? interaction.user;

        // Extracting user metadata for footer information and locale
        const { userFooter, userLocale } = Utils.getUserMetadata(interaction.locale, interaction.user);

        // Creating an initial embed with basic information
        const initialEmbed = new EmbedBuilder()
            .setTitle(client.getLocalization<true>(userLocale, "commandScoreTitle")(selectedMember.displayName))
            .setColor(Colors.Blue)
            .setFooter(userFooter);

        // Retrieving player information based on the selected member's ID
        const player = client.players.get(selectedMember.id);

        // Retrieving the player's score and calculating the guild total score if available
        const playerScore = player?.score;
        const memberScore = player
            ? Object.values(player.scores[interaction.guildId!]).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
            : undefined;
        const channelScores = [];

        for await (const [channelId, score] of Object.entries(player?.scores[interaction.guildId!] ?? [])) channelScores.push(`<#${channelId}> - ${score}`);

        // Handling cases where player or player score is unavailable
        if (!player || !playerScore) {
            // Creating an embed to inform the user that there is no score available
            const userEmbed = initialEmbed.setDescription(client.getLocalization(userLocale, "commandScoreNoScore")).setColor(Colors.Red);

            // Responding to the interaction with the no-score embed as an ephemeral message
            await interaction.editReply({
                embeds: [userEmbed],
            });

            return;
        }

        // Creating an embed with the player's score and additional information
        const scoreEmbed = initialEmbed
            .addFields({
                name: client.getLocalization(userLocale, "commandScoreTotalScore"),
                value: playerScore.toFixed(1),
            })
            .setAuthor({
                name: selectedMember.displayName,
                iconURL: selectedMember.avatarURL() as string,
            });

        // Adding guild total score to the embed if available
        if (memberScore) {
            scoreEmbed.data.fields?.push({ name: client.getLocalization(userLocale, "commandScoreGuildScore"), value: memberScore.toFixed(1) });
        }

        if (channelScores.length) {
            scoreEmbed.data.fields?.push({ name: client.getLocalization(userLocale, "commandScoreChannelScores"), value: channelScores.join("\n") });
        }

        // Responding to the interaction with the score embed as an ephemeral message
        await interaction.editReply({
            embeds: [scoreEmbed],
        });
    },
};
