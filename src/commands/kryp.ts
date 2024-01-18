// Importing necessary types and modules from the project's global scope and Discord.js library
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

// Exporting a default command object
export default {
    // Command data including name, description, permissions, and subcommands
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
        )
        .addSubcommand((statusCommand) =>
            statusCommand
                .setName("status")
                .setNameLocalization("tr", "durum")
                .setDescription("To set the bot status.")
                .setDescriptionLocalization("tr", "Bot durumunu ayarlamak için.")
                .addStringOption((option) =>
                    option
                        .setName("status")
                        .setNameLocalization("tr", "durum")
                        .setDescription("Status of the bot.")
                        .setDescriptionLocalization("tr", "Bot durumu.")
                        .setRequired(true)
                )
        )
        .addSubcommand((acceptEmoteCommand) =>
            acceptEmoteCommand
                .setName("accept-emote")
                .setNameLocalization("tr", "kabul-emoji")
                .setDescription("To set the accept emote of bot.")
                .setDescriptionLocalization("tr", "Botun kabul emojisini ayarlamak için.")
                .addStringOption((option) =>
                    option
                        .setName("emote")
                        .setNameLocalization("tr", "emoji")
                        .setDescription("Accept emote of the bot")
                        .setDescriptionLocalization("tr", "Botun kabul emojisi")
                        .setRequired(true)
                )
        )
        .addSubcommand((quitCommand) =>
            quitCommand
                .setName("quit")
                .setNameLocalization("tr", "çıkış")
                .setDescription("To quit the bot safely")
                .setDescriptionLocalization("tr", "Botu güvenli bir şekilde kapatmak için.")
        ),
    // Guild ID from the configuration
    guildId: client.config.guildId,

    // Execution function for the command
    async execute(interaction: ChatInputCommandInteraction) {
        // Getting the subcommand from the interaction options
        const subCommand = interaction.options.getSubcommand(true);

        // Extracting user metadata for footer information
        const { userFooter } = Utils.getUserMetadata(interaction.locale, interaction.user);

        // Handling the "word" subcommand
        if (subCommand === "word") {
            // Retrieving word and language options from the interaction
            const word = interaction.options.getString("word", true);
            const language = interaction.options.getString("language", true) as FormattedLocale;

            // Checking if the word exists in the specified language's word list
            //@ts-ignore
            const wordExists: boolean = client.words[language][word.at(0)].includes(word);

            // Creating buttons for adding and removing the word
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

            // Creating an action row containing the buttons
            const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(addButton, removeButton);

            // Creating an embed with word information
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

            // Responding to the interaction with the embed and buttons
            await interaction.reply({
                embeds: [wordReportEmbed],
                components: [buttonRow],
                ephemeral: true,
            });
        } else if (subCommand === "status") {
            // Getting status option from the interaction options
            const statusOption = interaction.options.getString("status", true);

            // Setting the client status with given status option
            client.setStatus(statusOption);

            // Responding to the interaction with success message
            await interaction.reply({
                content: `Status successfully changed to: **${statusOption}**`,
                ephemeral: true,
            });
        } else if (subCommand === "accept-emote") {
            // Getting emote option from the interaction options
            const emote = interaction.options.getString("emote", true);

            // Setting the client accept emote with given emote option
            await client.setAcceptEmote(emote);

            // Responding to the interaction with success message
            await interaction.reply({
                content: `Accept emote successfully set to: ${emote}`,
                ephemeral: true,
            });
        } else if (subCommand === "announcement") {
            // Defer the reply as soon as possible
            await interaction.deferReply({
                ephemeral: true,
            });

            // Getting announcement option from the interaction options
            const announcementOption = interaction.options.getString("announcement", true);

            // Calling the announcement method from client that returns how many announcements made
            const announcementCounter = await client.makeAnnouncement(announcementOption);

            // Responding to the interaction with success message and announcement
            await interaction.editReply({
                content: `**${announcementCounter}** announcements made successfully.`,
            });
        } else if (subCommand === "quit") {
            await interaction.reply({
                content: "Quitting the bot safely.",
                ephemeral: true
            });

            client.quit();
        }
    },
};
