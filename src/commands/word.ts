import config from "@/config";
import { FormattedLocale, Utils, client } from "@/globals";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
	data: new SlashCommandBuilder()
		.setName("word")
		.setNameLocalization("tr", "kelime")
		.setDescription("You can report the words that doesn't exist in Chizue's dictionary with this command.")
		.setDescriptionLocalization("tr", "Bu komutla Chizue'nun sözlüğünde bulunmayan kelimeleri bildirebilirsin.")
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName("word")
				.setNameLocalization("tr", "kelime")
				.setDescription("The word you want to report.")
				.setDescriptionLocalization("tr", "Bildirmek istediğin kelime.")
                .setMaxLength(20)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("language")
				.setNameLocalization("tr", "dil")
				.setDescription("The language of the word you want to report.")
				.setDescriptionLocalization("tr", "Bildirmek istediğin kelimenin dili.")
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
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const word = interaction.options.getString("word", true);
		const language = interaction.options.getString("language", true) as FormattedLocale;
		const { userLocale, userFooter } = Utils.getUserMetadata(interaction.locale, interaction.user);

		const initialEmbed = new EmbedBuilder().setTitle(client.getLocalization(userLocale, "commandWordTitle")).setColor(Colors.Orange).setFooter(userFooter);

		if (!Object.keys(client.words[language]).includes(word.at(0)!)) {
			await interaction.reply({
				embeds: [initialEmbed.setDescription(client.getLocalization(userLocale, "commandWordWrongLanguage"))],
				ephemeral: true,
			});
			return;
		}

		//@ts-ignore
		const wordExists: boolean = client.words[language][word.at(0)].includes(word);

		const addButton = new ButtonBuilder().setCustomId(`add-word_${word}_${language}`).setLabel("Ekle").setStyle(ButtonStyle.Success).setDisabled(wordExists);

		const removeButton = new ButtonBuilder().setCustomId(`remove-word_${word}_${language}`).setLabel("Kaldır").setStyle(ButtonStyle.Danger).setDisabled(!wordExists);

		const deleteButton = new ButtonBuilder().setCustomId("delete").setEmoji("🗑️").setStyle(ButtonStyle.Secondary);

		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(addButton, removeButton, deleteButton);

		const wordReportEmbed = initialEmbed
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.avatarURL()!,
			})
			.addFields(
				{
					name: "Kelime",
					value: word,
                    inline: true
				},
				{
					name: "Dil",
					value: client.getLocalization("tr", language),
                    inline: true
				}
			);

		const thanksEmbed = new EmbedBuilder()
			.setTitle(client.getLocalization(userLocale, "commandWordTitle"))
			.setDescription(client.getLocalization(userLocale, "commandWordThanks"))
			.setColor(Colors.Green)
			.setFooter(userFooter);

		await client.words.wordReportChannel.send({
			embeds: [wordReportEmbed],
			components: [buttonRow],
		});

		await interaction.reply({
			embeds: [thanksEmbed],
			ephemeral: true,
		});
	},
};
