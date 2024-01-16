// Importing necessary types and modules from the project's global scope and Discord.js library
import { FormattedLocale, Utils, client } from "@/globals";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, EmbedBuilder, SlashCommandBuilder } from "discord.js";

// Exporting a default command object
export default {
	// Command data including name, description, and options
	data: new SlashCommandBuilder()
		.setName("word")
		.setNameLocalization("tr", "kelime")
		.setDescription("You can report the words that don't exist in Chizue's dictionary with this command.")
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

	// Execution function for the command
	async execute(interaction: ChatInputCommandInteraction) {
		// Extracting word and language options from the interaction
		const word = interaction.options.getString("word", true);
		const language = interaction.options.getString("language", true) as FormattedLocale;

		// Extracting user metadata for locale and footer information
		const { userLocale, userFooter } = Utils.getUserMetadata(interaction.locale, interaction.user);

		// Creating an initial embed with a title, color, and footer
		const initialEmbed = new EmbedBuilder().setTitle(client.getLocalization(userLocale, "commandWordTitle")).setColor(Colors.Orange).setFooter(userFooter);

		// Checking if the specified language is supported
		if (!Object.keys(client.words[language]).includes(word.at(0)!)) {
			// Responding with an embed indicating an incorrect language
			await interaction.reply({
				embeds: [initialEmbed.setDescription(client.getLocalization(userLocale, "commandWordWrongLanguage"))],
				ephemeral: true,
			});
			return;
		}

		//@ts-ignore
		// Checking if the word already exists in the dictionary
		const wordExists: boolean = client.words[language][word.at(0)].includes(word);

		// Creating button components for adding, removing, and deleting the word
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

		const deleteButton = new ButtonBuilder().setCustomId("delete").setEmoji("🗑️").setStyle(ButtonStyle.Secondary);

		// Creating an action row with the button components
		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(addButton, removeButton, deleteButton);

		// Creating an embed for reporting the word with details
		const wordReportEmbed = initialEmbed
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

		// Creating an embed to thank the user for reporting the word
		const thanksEmbed = new EmbedBuilder()
			.setTitle(client.getLocalization(userLocale, "commandWordTitle"))
			.setDescription(client.getLocalization(userLocale, "commandWordThanks"))
			.setColor(Colors.Green)
			.setFooter(userFooter);

		// Sending the word report embed with button components to the specified channel
		await client.words.wordReportChannel.send({
			embeds: [wordReportEmbed],
			components: [buttonRow],
		});

		// Responding to the interaction with the thanks embed as an ephemeral message
		await interaction.reply({
			embeds: [thanksEmbed],
			ephemeral: true,
		});
	},
};
