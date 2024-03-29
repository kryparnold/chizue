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
} from "discord.js";

// Import global variables and classes from project files
import { Utils, client, CountingGame } from "@/globals";
import { GameType } from "@prisma/client";
import { NumberSelectMenuBuilder } from "@/classes/NumberSelectMenuBuilder";

// Export a default object with data and execute properties
export default {
    // Define the slash command properties using SlashCommandBuilder
    data: new SlashCommandBuilder()
        .setName("counting-game")
        // Localization support for name and description
        .setNameLocalization("tr", "sayı-sayma")
        .setDescription("You can set up, delete, or modify Counting Games with this command.")
        .setDescriptionLocalization("tr", "Bu komutla Sayı Sayma Oyunu kurabilir, kaldırabilir ya da düzenleyebilirsin.")
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

        // Fetch the Counting Game data from the database based on the channel ID
        let channel = client.games.get(selectedChannel.id) as CountingGame | undefined;

        // Set default channel preferences or use existing values if available
        let selectedMultiplier = channel?.multiplier ?? 1;

        // Get the user's locale and prepare user-specific footer for embeds
        const { userFooter, userLocale } = Utils.getUserMetadata(interaction.locale, interaction.user);

        // Check the game type and reply if not Counting Game
        if (channel && channel.type !== GameType.CountingGame) {
            await interaction.editReply(client.getLocalization<true>(userLocale, "commandGameAnother")(client.getLocalization(userLocale, channel.type)));
            return;
        }

        // Create an embed to display information about the Counting Game
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
        const selectMultiplier = new NumberSelectMenuBuilder()
            .setCustomId("_multiplier")
            .setRange(1, 25, client.getLocalization(userLocale, "commandCountingGameMultiplier"), channel?.multiplier);

        // Update components based on existing channel data
        if (channel) {
            // Update embed description and fields
            embed.data.description = client.getLocalization<true>(userLocale, "commandGameExists")(client.getLocalization(userLocale, channel.type));
            embed.data.fields = await this.getFields(userLocale, {
                multiplier: selectedMultiplier,
                numberCount: channel.recentNumber / selectedMultiplier,
            });

            // Set default option for multiplier select menu
            selectMultiplier.options.forEach((item) => item.setDefault(item.data.value === channel?.multiplier));

            // Disable and enable buttons based on channel existence
            setupButton.setDisabled(true);
            removeButton.setDisabled(false);
        }

        // Create rows for interaction components
        const multiplierRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMultiplier);
        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(setupButton, removeButton);
        const rows = [multiplierRow, buttonRow];

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

                // Extract custom ID from the interaction
                const customId = componentInteraction.customId;

                // Defer the reply for ephemeral interactions
                await componentInteraction.deferReply({ ephemeral: true });

                if (componentInteraction.isStringSelectMenu()) {
                    // Handle interactions for string select menus
                    const selectedOption: any = componentInteraction.values[0];
                    selectedMultiplier = +selectedOption;

                    // Set default option for multiplier select menu
                    selectMultiplier.options.forEach((item) => item.setDefault(item.data.value === channel?.multiplier));

                    // Update the reply with a message indicating the multiplier change
                    await componentInteraction.editReply({
                        content: client.getLocalization<true>(userLocale, "commandCountingGameMultiplierChange")(selectedOption),
                    });

                    // Update channel data in the database if it exists
                    if (channel) {

                        // Set the channel mutliplier with selected mutliplier
                        channel = await channel.setMultiplier(selectedMultiplier);

                        // Update the reply with new embed and components
                        await interaction.editReply({
                            embeds: [
                                embed.setFields(
                                    await this.getFields(userLocale, {
                                        multiplier: channel.multiplier,
                                        numberCount: channel.recentNumber / channel.multiplier,
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

                        // Create a counting game and update the reply with relevant information
                        channel = await client.games.createCountingGame({
                            name: selectedChannel.name!,
                            id: selectedChannel.id,
                            multiplier: selectedMultiplier,
                            guildId: interaction.guildId as string,
                            recentNumber: selectedMultiplier,
                        });

                        // Enable the remove button and disable the setup button
                        setupButton.data.disabled = true;
                        removeButton.data.disabled = false;

                        // Update the initial reply with modified components
                        interaction.editReply({
                            embeds: [embed],
                            components: rows,
                        });

                        // Reply with success message
                        await componentInteraction.editReply({
                            content: client.getLocalization(userLocale, "commandGameSetupSuccess"),
                        });
                    } else if (customId.endsWith("remove")) {
                        // Handle remove button click

                        // Create a confirmation embed
                        const confirmEmbed = new EmbedBuilder()
                            .setTitle(client.getLocalization(userLocale, "confirmRemove"))
                            .setDescription(client.getLocalization(userLocale, "confirmRemoveDesc"))
                            .setColor(Colors.Red)
                            .setFooter(userFooter);

                        // Create a confirmation button
                        const confirmButton = new ButtonBuilder()
                            .setCustomId("_confirm")
                            .setLabel(client.getLocalization(userLocale, "buttonConfirm"))
                            .setStyle(ButtonStyle.Primary);

                        // Create an action row with the confirmation button
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
                                // Handle user confirmation
                                await buttonInteraction.deferReply({ ephemeral: true });

                                // Delete the Counting Game from the database upon confirmation
                                await client.games.delete(channel?.id);
                                channel = undefined;

                                // Disable the remove button and enable the setup button
                                setupButton.data.disabled = false;
                                removeButton.data.disabled = true;

                                // Update the reply with a success message
                                interaction.editReply({
                                    embeds: [embed],
                                    components: rows,
                                });

                                // Update the confirmation reply to indicate successful removal
                                buttonInteraction.editReply({
                                    content: client.getLocalization(userLocale, "commandGameRemoveSuccess"),
                                });

                                // Update the original interaction reply to indicate removal
                                componentInteraction.editReply({
                                    embeds: [confirmEmbed.setDescription(client.getLocalization(userLocale, "confirmUsed"))],
                                    components: [],
                                });
                            })
                            .catch(() => {
                                // Handle timeout for confirmation

                                // Update the confirmation reply to indicate timeout
                                componentInteraction.editReply({
                                    embeds: [confirmEmbed.setDescription(client.getLocalization(userLocale, "confirmRemoveExpire"))],
                                    components: [],
                                });
                            });
                    }
                }
            } catch (err) {
                // Exit the loop
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
    async getFields(locale: any, props: { numberCount: number; multiplier: number }) {
        const { multiplier, numberCount } = props;

        return [
            {
                name: client.getLocalization(locale, "commandCountingGameNumberCounter"),
                value: numberCount.toString(),
            },
            {
                name: client.getLocalization(locale, "commandCountingGameMultiplier"),
                value: multiplier.toString(),
            },
        ];
    },
};
