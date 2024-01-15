import config from "@/config";
import { FormattedLocale, Utils, client } from "@/globals";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
} from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("kryp")
		.setDescription("Commands for Kryp")
		.setDescriptionLocalization("tr", "Kryp için komutlar")
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand((wordCommand) =>
			wordCommand
				.setName("word")
				.setNameLocalization("tr", "kelime")
				.setDescription("Sends the word management embed.")
				.setDescriptionLocalization("tr", "Kelime yönetim embed'ini gönderir.")
				.addStringOption((option) =>
					option
						.setName("word")
						.setNameLocalization("tr", "kelime")
						.setDescription("The word you want to manage.")
						.setDescriptionLocalization("tr", "Yönetmek istediğin kelime.")
						.setMaxLength(20)
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("language")
						.setNameLocalization("tr", "dil")
						.setDescription("The language of the word you want to manage.")
						.setDescriptionLocalization("tr", "Yönetmek istediğin kelimenin dili.")
						.setChoices(
							{
								name: "Turkish",
								name_localizations: {
									tr: "Türkçe",
								},
								value: "tr",
							},
							{
								name: "English",
								name_localizations: {
									tr: "İngilizce",
								},
								value: "en",
							}
						)
						.setRequired(true)
				)
		),
	guildId: config.guildId,
	async execute(interaction: ChatInputCommandInteraction) {
		const subCommand = interaction.options.getSubcommand(true);

		const { userFooter } = Utils.getUserMetadata(interaction.locale, interaction.user);

		if (subCommand === "word") {
			const word = interaction.options.getString("word", true);
			const language = interaction.options.getString("language", true) as FormattedLocale;
			//@ts-ignore
			const wordExists: boolean = client.words[language][word.at(0)].includes(word);

			const addButton = new ButtonBuilder()
				.setCustomId(`add-word_${word}_${language}`)
				.setLabel("Ekle")
				.setStyle(ButtonStyle.Success)
				.setDisabled(wordExists);

			const removeButton = new ButtonBuilder()
				.setCustomId(`remove-word_${word}_${language}`)
				.setLabel("Kaldır")
				.setStyle(ButtonStyle.Danger)
				.setDisabled(!wordExists);

			const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(addButton, removeButton);

			const wordReportEmbed = new EmbedBuilder()
				.setTitle("Word")
				.setColor(Colors.Orange)
				.setFooter(userFooter)
				.setAuthor({
					name: interaction.user.username,
					iconURL: interaction.user.avatarURL()!,
				})
				.addFields(
					{
						name: "Kelime",
						value: word,
						inline: true,
					},
					{
						name: "Dil",
						value: client.getLocalization("tr", language),
						inline: true,
					}
				);

			await interaction.reply({
				embeds: [wordReportEmbed],
				components: [buttonRow],
				ephemeral: true,
			});
		}
	},
};
