// Import necessary modules and components from discord.js
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	ChatInputCommandInteraction,
	Colors,
	ComponentType,
	EmbedBuilder,
	EmbedFooterOptions,
	PermissionFlagsBits,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";

// Import global variables and classes from project files
import { Utils, client, WordGame } from "@/globals";
import { GameMode, GameType, Locales } from "@prisma/client";

// Export a default object with data and execute properties
export default {
	// Define the slash command properties using SlashCommandBuilder
	data: new SlashCommandBuilder()
		.setName("word-game")
		// Localization support for name and description
		.setNameLocalization("tr", "kelime-oyunu")
		.setDescription("You can set up, delete, or modify Word Games with this command.")
		.setDescriptionLocalization("tr", "Bu komutla Kelime Oyunu kurabilir, kaldırabilir ya da düzenleyebilirsin.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		// Add a required channel option
		.addChannelOption((input) =>
			input
				.setName("channel")
				.setNameLocalization("tr", "kanal")
				.addChannelTypes(ChannelType.GuildText)
				.setDescription("Game Channel")
				.setDescriptionLocalization("tr", "Oyun Kanalı")
				.setRequired(true)
		),
	// Execute function handling the command logic
	async execute(interaction: ChatInputCommandInteraction) {
		// Defer the reply as soon as possible
		await interaction.deferReply({
			ephemeral: true,
		});

		// Retrieve the specified channel from the options
		const selectedChannel = interaction.options.getChannel("channel", true);

		// Fetch the Word Game data from the database based on the channel ID
		let channel = client.games.get(selectedChannel.id) as WordGame | undefined;

		// Set default channel preferences or use existing values if available
		const channelPreferences = {
			locale: channel?.locale ?? Locales.English,
			mode: channel?.mode ?? GameMode.Normal,
		};

		// Get the user's locale and prepare user-specific footer for embeds
		const userLocale = Utils.formatLocale(interaction.locale);
		const userFooter: EmbedFooterOptions = {
			text: interaction.user.username,
			iconURL: Utils.getAvatarURL(interaction.user.id, interaction.user.avatar),
		};

		// Check the game type and reply if not Word Game
		if (channel && channel.type !== GameType.WordGame) {
			await interaction.editReply(client.getLocalization<true>(userLocale, "gameAnother")(client.getLocalization(userLocale, channel.type)));
			return;
		}

		// Create an embed to display information about the Word Game
		const embed = new EmbedBuilder()
			.setTitle(`${interaction.guild?.name} - #${selectedChannel.name}`)
			.setDescription(client.getLocalization(userLocale, "gameDoesntExists"))
			.setColor(Colors.Blue)
			.setFooter(userFooter);

		// Create buttons, select menus, and rows for interaction components
		const setupButton = new ButtonBuilder().setCustomId("_setup").setLabel(client.getLocalization(userLocale, "buttonSetup")).setStyle(ButtonStyle.Primary);
		const removeButton = new ButtonBuilder()
			.setCustomId("_remove")
			.setLabel(client.getLocalization(userLocale, "buttonRemove"))
			.setStyle(ButtonStyle.Danger)
			.setDisabled(true);
		const selectLocale = new StringSelectMenuBuilder().setCustomId("_locale").addOptions(
			// Options for different locales
			new StringSelectMenuOptionBuilder()
				.setLabel(client.getLocalization(userLocale, "Turkish"))
				.setDescription(client.getLocalization(userLocale, "gameLocaleTrDesc"))
				.setValue("Turkish"),
			new StringSelectMenuOptionBuilder()
				.setLabel(client.getLocalization(userLocale, "English"))
				.setDescription(client.getLocalization(userLocale, "gameLocaleEnDesc"))
				.setValue("English")
				.setDefault(true)
		);
		const selectMode = new StringSelectMenuBuilder().setCustomId("_mode").addOptions(
			// Options for different game modes
			new StringSelectMenuOptionBuilder()
				.setLabel("Normal")
				.setDescription(client.getLocalization(userLocale, "gameModeNormalDesc"))
				.setValue("Normal")
				.setDefault(true),
			new StringSelectMenuOptionBuilder()
				.setLabel(client.getLocalization(userLocale, "gameModeEndless"))
				.setDescription(client.getLocalization(userLocale, "gameModeEndlessDesc"))
				.setValue("Endless")
		);

		// Update components based on existing channel data
		if (channel) {
			// Update embed description and fields
			embed.data.description = client.getLocalization<true>(userLocale, "gameExists")(client.getLocalization(userLocale, channel.type));
			embed.data.fields = await this.getFields(userLocale, {
				wordCount: channel.words.length,
                letter: channel.letter,
				channelLocale: channel.locale,
				mode: channel.mode,
			});

			// Set default options for locale and mode select menus
			selectLocale.options.forEach((item) => item.setDefault(item.data.value === channel?.locale));
			selectMode.options.forEach((item) => item.setDefault(item.data.value === channel?.mode));

			// Disable and enable buttons based on channel existence
			setupButton.setDisabled(true);
			removeButton.setDisabled(false);
		}

		// Create rows for interaction components
		const localeRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectLocale);
		const modeRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMode);
		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(setupButton, removeButton);
		const rows = [localeRow, modeRow, buttonRow];

		// Edit the initial reply with the updated embed and components
		const reply = await interaction.editReply({
			embeds: [embed],
			components: rows,
		});

		// Create a message component collector for button and select menu interactions
		const componentCollector = reply.createMessageComponentCollector({ time: 90000 });

		componentCollector
			// Handle interactions within the collector
			.on("collect", async (componentInteraction) => {
				const customId = componentInteraction.customId;
				await componentInteraction.deferReply({ ephemeral: true });
				if (componentInteraction.isStringSelectMenu()) {
					// Handle interactions for string select menus
					const selectedOption: any = componentInteraction.values[0];

					const options = componentInteraction.component.options;

					const localizedOption = options.find((option) => option.value === selectedOption)?.label as string;

					if (customId.endsWith("locale")) {
						// Handle locale change
						channelPreferences.locale = selectedOption;
						channel = await channel?.setLocale(selectedOption);
						await componentInteraction.editReply({
							content: client.getLocalization<true>(userLocale, "gameLangChange")(localizedOption),
						});
					} else if (customId.endsWith("mode")) {
						// Handle game mode change
						channelPreferences.mode = selectedOption;
						channel = await channel?.setMode(selectedOption);
						await componentInteraction.editReply({
							content: client.getLocalization<true>(userLocale, "gameModeChange")(localizedOption),
						});
					}

					// Update channel data in the database if it exists
					if (channel) {
						// Set default options for locale and mode select menus
						selectLocale.options.forEach((item) => item.setDefault(item.data.value === channel?.locale));
						selectMode.options.forEach((item) => item.setDefault(item.data.value === channel?.mode));

						await interaction.editReply({
							embeds: [
								embed.setFields(
									await this.getFields(userLocale, {
										channelLocale: channel.locale,
                                        letter: channel.letter,
										mode: channel.mode,
										wordCount: channel.words.length,
									})
								),
							],
							components: rows,
						});
					}
				} else if (componentInteraction.isButton()) {
					// Handle interactions for buttons
					if (customId.endsWith("setup")) {
						// Handle setup button click
						const randomLetter = Utils.random(Array.from(Utils.Letters["en"]));

						const randomWords = channelPreferences.locale === Locales.English ? Utils.getRandomWords(3) : [];

						channel = await client.games.createWordGame({
							id: selectedChannel.id,
							letter: randomLetter,
							locale: channelPreferences.locale,
                            guildId: interaction.guildId as string,
							mode: channelPreferences.mode,
							randomWords,
						});

						embed
							.setDescription(client.getLocalization<true>(userLocale, "gameExists")(client.getLocalization(userLocale, channel.type)))
							.addFields(
								await this.getFields(userLocale, {
									channelLocale: channel.locale,
                                    letter: channel.letter,
									mode: channel.mode,
									wordCount: channel.words.length,
								})
							);

						// Set default options for locale and mode select menus
						selectLocale.options.forEach((item) => item.setDefault(item.data.value === channel?.locale));
						selectMode.options.forEach((item) => item.setDefault(item.data.value === channel?.mode));

						await interaction.editReply({
							embeds: [embed],
							components: rows.map((item, index) => {
								if (index === rows.length - 1) {
									item.components[0].setDisabled(true);
									item.components[1].setDisabled(false);
								}

								return item;
							}),
						});
						await componentInteraction.editReply({
							content: client.getLocalization(userLocale, "gameSetupSuccess"),
						});
					} else if (customId.endsWith("remove")) {
						// Handle remove button click
						const confirmEmbed = new EmbedBuilder()
							.setTitle(client.getLocalization(userLocale, "confirmRemove"))
							.setDescription(client.getLocalization(userLocale, "confirmRemoveDesc"))
							.setColor(Colors.Red)
							.setFooter(userFooter);

						const confirmButton = new ButtonBuilder()
							.setCustomId("_confirm")
							.setLabel(client.getLocalization(userLocale, "buttonConfirm"))
							.setStyle(ButtonStyle.Primary);

						const row = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton);

						// Display a confirmation message and button
						const componentReply = await componentInteraction.editReply({
							embeds: [confirmEmbed],
							components: [row],
						});
						// Await user confirmation or timeout
						componentReply
							.awaitMessageComponent({ time: 15000, componentType: ComponentType.Button })
							.then(async (buttonInteraction) => {
								await buttonInteraction.deferReply({ ephemeral: true });

								// Delete the Word Game from the database upon confirmation
								await client.games.delete(channel?.id);
								channel = undefined;

								embed.data.description = client.getLocalization(userLocale, "gameDoesntExists");
								embed.data.fields = [];

								interaction.editReply({
									embeds: [embed],
									components: rows.map((item, index) => {
										if (index === rows.length - 1) {
											item.components[1].setDisabled(true);
											item.components[0].setDisabled(false);
										}

										return item;
									}),
								});

								buttonInteraction.editReply({
									content: client.getLocalization(userLocale, "gameRemoveSuccess"),
								});

								componentInteraction.editReply({
									embeds: [confirmEmbed.setDescription(client.getLocalization(userLocale, "confirmUsed"))],
									components: [],
								});
							})
							.catch(() => {
								componentInteraction.editReply({
									embeds: [confirmEmbed.setDescription(client.getLocalization(userLocale, "confirmRemoveExpire"))],
									components: [],
								});
							});
					}
				}
			})

			// Handle the end of the collector by updating the embed and components
			.on("end", async () => {
				embed.setDescription(client.getLocalization<true>(userLocale, "commandTimeout")(this.data.name)).setFields([]);
				await interaction.editReply({
					embeds: [embed],
					components: [],
				});
			});
	},
	// Helper function to generate fields for the embed
	async getFields(locale: any, props: { wordCount: number; letter: string, channelLocale: Locales; mode: GameMode }) {
		const { channelLocale, mode, wordCount, letter } = props;

		return [
			{
				name: client.getLocalization(locale, "gameWordCounter"),
				value: wordCount.toString(),
			},
			{
                name: client.getLocalization(locale, "gameLetter"),
                value: letter,
            },
			{
				name: client.getLocalization(locale, "gameLocale"),
				value: client.getLocalization(locale, channelLocale),
			},
			{
				name: client.getLocalization(locale, "gameMode"),
				value: client.getLocalization(locale, mode),
			},
		];
	},
};
