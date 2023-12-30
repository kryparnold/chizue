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
	Locale,
	PermissionFlagsBits,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from "discord.js";
import { client } from "..";
import { Utils, prisma } from "@/globals";
import { GameMode, GameType, Locales } from "@prisma/client";

export default {
	data: new SlashCommandBuilder()
		.setName("word-game")
		.setNameLocalization("tr", "kelime-oyunu")
		.setDescription("You can setup, delete or modify Word Game with this command.")
		.setDescriptionLocalization("tr", "Bu komutla Kelime Oyunu'nu kurabilir, kaldırabilir ya da düzenleyebilirsin.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		.addChannelOption((input) =>
			input
				.setName("channel")
				.setNameLocalization("tr", "kanal")
				.addChannelTypes(ChannelType.GuildText)
				.setDescription("Game Channel")
				.setDescriptionLocalization("tr", "Oyun Kanalı")
				.setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({
			ephemeral: true,
		});
		const channelOption = interaction.options.getChannel("channel", true);
		let channel = await prisma.games.findUnique({
			where: {
				id: channelOption.id,
			},
		});
		const channelPreferences = {
			locale: channel?.locale ?? Locales.English,
			mode: channel?.mode ?? GameMode.Normal,
		};
		const userLocale = interaction.locale;
		const userFooter: EmbedFooterOptions = {
			text: interaction.user.username,
			iconURL: Utils.getAvatarURL(interaction.user.id, interaction.user.avatar),
		};

		const embed = new EmbedBuilder()
			.setTitle(`${interaction.guild?.name} - #${channelOption.name}`)
			.setDescription(client.getLocalization(userLocale, "gameDoesntExists"))
			.setColor(Colors.Blue)
			.setFooter(userFooter);

		const setupButton = new ButtonBuilder().setCustomId("_setup").setLabel(client.getLocalization(userLocale, "buttonSetup")).setStyle(ButtonStyle.Primary);

		const removeButton = new ButtonBuilder()
			.setCustomId("_remove")
			.setLabel(client.getLocalization(userLocale, "buttonRemove"))
			.setStyle(ButtonStyle.Danger)
			.setDisabled(true);

		const selectLocale = new StringSelectMenuBuilder()
			.setCustomId("_locale")
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(client.getLocalization(userLocale, "channelLocaleTr"))
					.setDescription(client.getLocalization(userLocale, "channelLocaleTrDesc"))
					.setValue("Turkish"),
				new StringSelectMenuOptionBuilder()
					.setLabel(client.getLocalization(userLocale, "channelLocaleEn"))
					.setDescription(client.getLocalization(userLocale, "channelLocaleEnDesc"))
					.setValue("English")
					.setDefault(true)
			);

		const selectMode = new StringSelectMenuBuilder()
			.setCustomId("_mode")
			.addOptions(
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

		if (channel) {
			embed.setDescription(client.getLocalization<true>(userLocale, "gameExists")(client.getLocalization(userLocale, channel.type))).addFields(
				await this.getFields(userLocale, {
					wordCount: channel.words.length,
					channelLocale: channel.locale,
					mode: channel.mode,
				})
			);

			selectLocale.options.forEach((item) => {
				if (item.data.value === channel?.locale) {
					item.setDefault(true);
				} else {
					item.setDefault(false);
				}
			});

			selectMode.options.forEach((item) => {
				if (item.data.value === channel?.mode) {
					item.setDefault(true);
				} else {
					item.setDefault(false);
				}
			});
			setupButton.setDisabled(true);
			removeButton.setDisabled(false);
		}

		const localeRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectLocale);

		const modeRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMode);

		const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(setupButton, removeButton);

		const rows = [localeRow, modeRow, buttonRow];
		interaction
			.editReply({
				embeds: [embed],
				components: rows,
			})
			.then(async (reply) => {
				const componentCollector = reply.createMessageComponentCollector({ time: 90000 });

				componentCollector.on("collect", async (componentInteraction) => {
					const customId = componentInteraction.customId;
					await componentInteraction.deferReply({ ephemeral: true });
					if (componentInteraction.isStringSelectMenu()) {
						const selectedOption: any = componentInteraction.values[0];

						const options = componentInteraction.component.options;

						const localizedOption = options.find((option) => option.value === selectedOption)?.label as string;

						if (customId.endsWith("locale")) {
							channelPreferences.locale = selectedOption;
							await componentInteraction.editReply({
								content: client.getLocalization<true>(userLocale, "gameLangChange")(localizedOption),
							});
						} else if (customId.endsWith("mode")) {
							channelPreferences.mode = selectedOption;
							await componentInteraction.editReply({
								content: client.getLocalization<true>(userLocale, "gameModeChange")(localizedOption),
							});
						}

						if (channel) {
							const newChannel = await prisma.games.update({
								where: {
									id: channel.id,
								},
								data: {
									mode: channelPreferences.mode,
									locale: channelPreferences.locale,
								},
							});

							if (newChannel) {
								channel = newChannel;

								selectLocale.options.forEach((item) => {
									if (item.data.value === channel?.locale) {
										item.setDefault(true);
									} else {
										item.setDefault(false);
									}
								});

								selectMode.options.forEach((item) => {
									if (item.data.value === channel?.mode) {
										item.setDefault(true);
									} else {
										item.setDefault(false);
									}
								});

								await interaction.editReply({
									embeds: [
										embed.setFields(
											await this.getFields(userLocale, {
												channelLocale: channel.locale,
												mode: channel.mode,
												wordCount: channel.words.length,
											})
										),
									],
									components: rows,
								});
							}
						}
					} else if (componentInteraction.isButton()) {
						if (customId.endsWith("setup")) {
							const randomLetter = Utils.random(Array.from(Utils.Letters["en"]));

							const newChannel = await prisma.games.create({
								data: {
									id: channelOption.id,
									letter: randomLetter,
									type: GameType.WordGame,
									locale: channelPreferences.locale,
									mode: channelPreferences.mode,
								},
							});

							if (newChannel) {
								channel = newChannel;

								embed
									.setDescription(client.getLocalization<true>(userLocale, "gameExists")(client.getLocalization(userLocale, channel.type)))
									.addFields(
										await this.getFields(userLocale, {
											channelLocale: channel.locale,
											mode: channel.mode,
											wordCount: channel.words.length,
										})
									);

								selectLocale.options.forEach((item) => {
									if (item.data.value === channel?.locale) {
										item.setDefault(true);
									} else {
										item.setDefault(false);
									}
								});

								selectMode.options.forEach((item) => {
									if (item.data.value === channel?.mode) {
										item.setDefault(true);
									} else {
										item.setDefault(false);
									}
								});

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
							} else {
								await componentInteraction.editReply({
									content: client.getLocalization(userLocale, "anErrorOccured"),
								});
							}
						} else if (customId.endsWith("remove")) {
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

							await componentInteraction
								.editReply({
									embeds: [confirmEmbed],
									components: [row],
								})
								.then((followUpReply) => {
									followUpReply
										.awaitMessageComponent({ time: 15000, componentType: ComponentType.Button })
										.then(async (buttonInteraction) => {
											await buttonInteraction.deferReply({ephemeral: true});

											const oldChannel = await prisma.games.delete({
											    where: {
											        id: channelOption.id
											    }
											});

											if (oldChannel) {
                                                embed.data.description = client.getLocalization(userLocale,"gameDoesntExists");
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
                                                    content: client.getLocalization(userLocale,"gameRemoveSuccess")
                                                });

                                                componentInteraction.editReply({
                                                    components: []
                                                });
											} else {
												buttonInteraction.editReply({
													embeds: [confirmEmbed.setDescription(client.getLocalization(userLocale, "anErrorOccured"))],
												});
											}
										})
										.catch(() => {
											componentInteraction.editReply({
												embeds: [confirmEmbed.setDescription(client.getLocalization(userLocale, "confirmRemoveExpire"))],
												components: [],
											});
										});
								});
						}
					}
				});

				componentCollector.on("end", async () => {
					embed.setDescription(client.getLocalization<true>(userLocale, "commandTimeout")(this.data.name)).setFields([]);
					await interaction.editReply({
						embeds: [embed],
						components: [],
					});
				});
			});
	},
	async getFields(locale: Locale, props: { wordCount: number; channelLocale: Locales; mode: GameMode }) {
		const { channelLocale, mode, wordCount } = props;

		return [
			{
				name: client.getLocalization(locale, "channelWordCount"),
				value: wordCount.toString(),
			},
			{
				name: client.getLocalization(locale, "channelLocale"),
				value: client.getLocalization(locale, channelLocale),
			},
			{
				name: client.getLocalization(locale, "gameMode"),
				value: client.getLocalization(locale, mode),
			},
		];
	}
};
