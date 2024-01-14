import { Utils, client } from "@/globals";
import { ChatInputCommandInteraction, Colors, EmbedBuilder, EmbedFooterData, Guild, GuildMember, SlashCommandBuilder, User } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("score")
		.setNameLocalization("tr", "skor")
		.setDescription("With this command, you can view the score of the member you want.")
		.setDescriptionLocalization("tr", "Bu komutla istediğin üyenin skorunu görebilirsin.")
		.setDMPermission(false)
		.addUserOption((option) =>
			option.setName("member").setNameLocalization("tr", "üye").setDescription("Select a member.").setDescriptionLocalization("tr", "Bir üye seç.")
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const selectedMember = interaction.options.getUser("member") ?? interaction.user;

        const { userFooter, userLocale } = Utils.getUserMetadata(interaction.locale,interaction.user);

		const initialEmbed = new EmbedBuilder()
			.setTitle(client.getLocalization<true>(userLocale, "commandScoreTitle")(selectedMember.displayName))
            .setColor(Colors.Blue)
			.setFooter(userFooter);

		const player = client.players.get(selectedMember.id);

		const playerScore = player?.score;

		const memberScore = player
			? Object.values(player?.scores[interaction.guildId as string]).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
			: undefined;

		if (!player || !playerScore) {
			const userEmbed = initialEmbed.setDescription(client.getLocalization(userLocale, "commandScoreNoScore")).setColor(Colors.Red);

			await interaction.reply({
				embeds: [userEmbed],
				ephemeral: true,
			});

			return;
		}

		const scoreEmbed = initialEmbed.addFields({
			name: client.getLocalization(userLocale, "commandScoreTotalScore"),
			value: playerScore.toString(),
		}).setAuthor({
            name: selectedMember.displayName,
            iconURL: selectedMember.avatarURL() as string,
        });

		if (memberScore) {
			scoreEmbed.data.fields?.push({ name: client.getLocalization(userLocale, "commandScoreGuildScore"), value: memberScore.toString() });
		}

        await interaction.reply({
            embeds: [ scoreEmbed ],
            ephemeral: true
        });
	},
};
