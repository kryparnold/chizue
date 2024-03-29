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
        const { userFooter, userLocale } = Utils.getUserMetadata(interaction.locale, interaction.user);

        // Check the game type and reply if not Word Game
        if (channel && channel.type !== GameType.WordGame) {
            await interaction.editReply(client.getLocalization<true>(userLocale, "commandGameAnother")(client.getLocalization(userLocale, channel.type)));
            return;
        }

        // Create an embed to display information about the Word Game
        const embed = new EmbedBuilder()
            .setTitle(`${interaction.guild?.name} - #${selectedChannel.name}`)
            .setDescription(client.getLocalization(userLocale, "commandGameDoesntExists"))
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
                .setDescription(client.getLocalization(userLocale, "commandWordGameLocaleTrDesc"))
                .setValue("Turkish"),
            new StringSelectMenuOptionBuilder()
                .setLabel(client.getLocalization(userLocale, "English"))
                .setDescription(client.getLocalization(userLocale, "commandWordGameLocaleEnDesc"))
                .setValue("English")
                .setDefault(true)
        );
        const selectMode = new StringSelectMenuBuilder().setCustomId("_mode").addOptions(
            // Options for different game modes
            new StringSelectMenuOptionBuilder()
                .setLabel("Normal")
                .setDescription(client.getLocalization(userLocale, "commandWordGameModeNormalDesc"))
                .setValue("Normal")
                .setDefault(true),
            new StringSelectMenuOptionBuilder()
                .setLabel(client.getLocalization(userLocale, "commandWordGameModeEndless"))
                .setDescription(client.getLocalization(userLocale, "commandWordGameModeEndlessDesc"))
                .setValue("Endless")
        );

        // Update components based on existing channel data
        if (channel) {
            // Update embed description and fields
            embed.data.description = client.getLocalization<true>(userLocale, "commandGameExists")(client.getLocalization(userLocale, channel.type));
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

        // Set a flag to wait for a user interaction with a message component
        let waitForComponent = true;

        // Continue looping until a component interaction or a timeout occurs
        while (waitForComponent) {
            try {
                // Wait for a message component interaction with a timeout of 90 seconds
                const componentInteraction = await reply.awaitMessageComponent({ time: 90000 });

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
                        if (channel) {
                            channel = await channel.setLocale(selectedOption);
                        }
                        await componentInteraction.editReply({
                            content: client.getLocalization<true>(userLocale, "commandWordGameLangChange")(localizedOption),
                        });
                    } else if (customId.endsWith("mode")) {
                        // Handle game mode change
                        channelPreferences.mode = selectedOption;
                        if (channel) {
                            channel = await channel.setMode(selectedOption);
                        }
                        await componentInteraction.editReply({
                            content: client.getLocalization<true>(userLocale, "commandWordGameModeChange")(localizedOption),
                        });
                    }

                    // Set default options for locale and mode select menus
                    selectLocale.options.forEach((item) => item.setDefault(item.data.value === channel?.locale));
                    selectMode.options.forEach((item) => item.setDefault(item.data.value === channel?.mode));

                    // Update channel data in the database if it exists
                    if (channel) {
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
                        const randomLetter = Utils.randomLetter(Utils.formatLocale(channelPreferences.locale));
                        const randomWords = channelPreferences.locale === Locales.English ? Utils.getRandomWords(3) : [];

                        channel = await client.games.createWordGame({
                            name: selectedChannel.name!,
                            id: selectedChannel.id,
                            letter: randomLetter,
                            locale: channelPreferences.locale,
                            guildId: interaction.guildId as string,
                            mode: channelPreferences.mode,
                            randomWords,
                        });

                        embed
                            .setDescription(client.getLocalization<true>(userLocale, "commandGameExists")(client.getLocalization(userLocale, channel.type)))
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

                        // Enable the remove button and disable the setup button
                        setupButton.data.disabled = true;
                        removeButton.data.disabled = false;

                        // Update the initial reply
                        await interaction.editReply({
                            embeds: [embed],
                            components: rows,
                        });

                        // Reply the interaction with a success message
                        await componentInteraction.editReply({
                            content: client.getLocalization(userLocale, "commandGameSetupSuccess"),
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

                                embed.data.description = client.getLocalization(userLocale, "commandGameDoesntExists");
                                embed.data.fields = [];

                                // Disable the remove button and enable the setup button
                                setupButton.data.disabled = false;
                                removeButton.data.disabled = true;

                                interaction.editReply({
                                    embeds: [embed],
                                    components: rows,
                                });

                                buttonInteraction.editReply({
                                    content: client.getLocalization(userLocale, "commandGameRemoveSuccess"),
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
            } catch (err) {
                waitForComponent = false;

                // Update the reply with a timeout message
                embed.setDescription(client.getLocalization<true>(userLocale, "commandTimeout")(this.data.name)).setFields([]);
                await interaction.editReply({
                    embeds: [embed],
                    components: [],
                });
            }
        }
    },
    // Helper function to generate fields for the embed
    async getFields(locale: any, props: { wordCount: number; letter: string; channelLocale: Locales; mode: GameMode }) {
        const { channelLocale, mode, wordCount, letter } = props;

        return [
            {
                name: client.getLocalization(locale, "commandWordGameWordCounter"),
                value: wordCount.toString(),
            },
            {
                name: client.getLocalization(locale, "commandWordGameLetter"),
                value: letter,
            },
            {
                name: client.getLocalization(locale, "commandWordGameLocale"),
                value: client.getLocalization(locale, channelLocale),
            },
            {
                name: client.getLocalization(locale, "commandWordGameMode"),
                value: client.getLocalization(locale, mode),
            },
        ];
    },
};
