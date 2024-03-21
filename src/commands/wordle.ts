// Importing necessary modules and components from Discord.js and custom files
import { FormattedLocale, Utils, WordleLengths, client } from "@/globals";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    EmbedFooterData,
    ModalBuilder,
    SlashCommandBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";

// Exporting the Wordle command as a default module
export default {
    // Slash command data definition
    data: new SlashCommandBuilder()
        .setName("wordle")
        .setDescription("You can play Wordle with this command.")
        .setDescriptionLocalization("tr", "Bu komutla Wordle oynayabilirsiniz.")
        .setDMPermission(false)
        .addStringOption((option) =>
            option
                .setName("locale")
                .setNameLocalization("tr", "dil")
                .setDescription("Locale of the word.")
                .setDescriptionLocalization("tr", "Kelime dili.")
                .addChoices(
                    { name: "English", value: "en", name_localizations: { tr: "İngilizce" } },
                    { name: "Turkish", value: "tr", name_localizations: { tr: "Türkçe" } }
                )
        )
        .addIntegerOption((option) =>
            option
                .setName("length")
                .setNameLocalization("tr", "uzunluk")
                .setDescription("Length of the word.")
                .setDescriptionLocalization("tr", "Kelime uzunluğu.")
                .addChoices({ name: "4", value: 4 }, { name: "5", value: 5 }, { name: "6", value: 6 })
        ),
    // Execution function for the Wordle command
    async execute(interaction: ChatInputCommandInteraction) {
        // Defer the reply as soon as possible
        await interaction.deferReply({ ephemeral: true });

        // Extracting user locale using utility function
        const userLocale = Utils.formatLocale(interaction.locale);

        // Checking if the user is already playing a Wordle game
        if (client.activeWordles.includes(interaction.user.id)) {
            // Sending a private message to the user if they are already playing
            await interaction.editReply({
                content: client.getLocalization(userLocale, "wordleGameExists"),
            });
            return;
        }

        // Adding the user to the active Wordles list
        client.activeWordles.push(interaction.user.id);

        // Retrieving game options from user input
        const gameLocale = (interaction.options.getString("locale") ?? "en") as FormattedLocale;
        const gameLength = (interaction.options.getInteger("length") ?? 5) as WordleLengths;

        // Selecting a random word based on game options
        const randomWord = Utils.random(client.words.wordleWords[gameLocale][gameLength]);

        // Initialization of variables for game progress tracking
        let submitCounter = 0;
        let emoteString = client.getLocalization(userLocale, "wordleYourGuesses") + "\n";

        // Generating user footer for the game embed
        const userFooter = await this.getUserFooter(userLocale, interaction.user.avatarURL() as string, interaction.user.username, gameLocale, gameLength);

        // Setting up buttons for user interaction
        const guessButton = new ButtonBuilder().setCustomId("_guess").setLabel(client.getLocalization(userLocale, "buttonGuess")).setStyle(ButtonStyle.Success);

        const howToPlayButton = new ButtonBuilder()
            .setCustomId("_htp")
            .setLabel(client.getLocalization(userLocale, "buttonHowToPlay"))
            .setStyle(ButtonStyle.Secondary);

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(guessButton, howToPlayButton);

        // Setting up the initial game embed
        const wordleEmbed = new EmbedBuilder().setColor(Colors.Blue).setTitle("Wordle").setFooter(userFooter);

        // Sending the initial reply with the game embed and buttons
        const initialReply = await interaction.editReply({
            embeds: [wordleEmbed.setDescription(client.getLocalization(userLocale, "wordleStarted"))],
            components: [buttonRow],
        });

        // Creating a collector to handle button interactions
        const collector = initialReply.createMessageComponentCollector({
            time: 840000, // 14-minute timeout for the game
        });

        // Handling button interactions
        collector.on("collect", async (componentInteraction) => {
            const customId = componentInteraction.customId;

            if (componentInteraction.isButton()) {
                if (customId === "_guess") {
                    // Creating a text input for user to submit their guess
                    const wordInput = new TextInputBuilder()
                        .setCustomId("word")
                        .setLabel(client.getLocalization(userLocale, "wordleGuessWord"))
                        .setPlaceholder(client.getLocalization(userLocale, "Word"))
                        .setStyle(TextInputStyle.Short);

                    const inputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(wordInput);

                    // Creating a modal for user to submit their guess
                    const submitModal = new ModalBuilder()
                        .setCustomId("_submit")
                        .setTitle(client.getLocalization(userLocale, "buttonGuess"))
                        .addComponents(inputRow);

                    // Showing the modal to the user
                    componentInteraction.showModal(submitModal);
                } else if (customId === "_htp") {
                    // Handling the "How to Play" button
                    const howToPlayEmbed = new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setTitle(client.getLocalization(userLocale, "wordleHowToPlayTitle"))
                        .setDescription(client.getLocalization(userLocale, "wordleHowToPlayDescription"))
                        .setFooter(userFooter);

                    // Sending the "How to Play" information as a reply to the button click
                    await componentInteraction.reply({
                        embeds: [howToPlayEmbed],
                        ephemeral: true,
                    });
                }
            }
        });

        // Handling the end of the collector (game timeout)
        collector.on("end", () => {
            interaction.editReply({
                embeds: [wordleEmbed.setDescription(client.getLocalization<true>(userLocale, "commandTimeout")(this.data.name))],
                components: [],
            });
        });

        // Main game loop for collecting user guesses
        while (submitCounter < 6) {
            try {
                // Waiting for user to submit their guess through a modal
                const modalInteraction = await interaction.awaitModalSubmit({ time: 150000 }); // 2-minute timeout for each guess

                // Retrieving user's guess from the modal
                const word = modalInteraction.fields.getTextInputValue("word");

                // Checking the validity of the user's guess
                const reason = await this.checkWord(word, gameLength, gameLocale);

                // Handling invalid guesses
                if (reason) {
                    modalInteraction.reply({
                        content: reason,
                        ephemeral: true,
                    });
                    continue;
                }

                // Processing the user's guess and providing feedback
                const colors = "0".repeat(gameLength).split("");
                const letterCounts = randomWord.split("").reduce((output: { [key: string]: number }, char: string) => {
                    output[char] = (output[char] || 0) + 1;
                    return output;
                }, {});

                for (let i = 0; i < gameLength; i++) {
                    const randomChar = randomWord[i];
                    const char = word[i];

                    if (char === randomChar) {
                        letterCounts[randomChar] -= 1;
                        colors[i] = "2";
                    }
                }

                for (let i = 0; i < gameLength; i++) {
                    const char = word[i];

                    if (randomWord.includes(char) && letterCounts[char] !== 0 && colors[i] === "0") {
                        letterCounts[char] -= 1;
                        colors[i] = "1";
                    }
                    //@ts-ignore
                    emoteString += Utils.wordleEmotes[colors[i]][char];
                }
                emoteString += "\n";

                // Handling the case where the user correctly guesses the word
                if (randomWord === word) {
                    guessButton.data.disabled = true;

                    await interaction.editReply({
                        embeds: [wordleEmbed.setColor(Colors.Green).setDescription(emoteString + client.getLocalization(userLocale, "wordleYouWin"))],
                        components: [buttonRow],
                    });

                    await modalInteraction.reply({
                        content: client.getLocalization(userLocale, "wordleYouWin"),
                        ephemeral: true,
                    });

                    submitCounter = 6;
                    continue;
                }

                // Incrementing the submit counter for the next guess
                submitCounter++;

                // Handling the case where the user reaches the maximum number of guesses
                if (submitCounter === 6) {
                    guessButton.data.disabled = true;

                    await interaction.editReply({
                        embeds: [wordleEmbed.setColor(Colors.Red).setDescription(emoteString)],
                    });

                    await modalInteraction.reply({
                        content: client.getLocalization<true>(userLocale, "wordleYouLose")(randomWord),
                        ephemeral: true,
                    });

                    continue;
                }

                // Updating the game embed with the current state
                await interaction.editReply({
                    embeds: [wordleEmbed.setDescription(emoteString)],
                });

                // Providing feedback to the user about their guess
                await modalInteraction.reply({
                    content: client.getLocalization<true>(userLocale, "wordleYourGuess")(word),
                    ephemeral: true,
                });
            } catch (err) {
                // Finishing the game by setting submitCounter to 6
                submitCounter = 6;

                // Handling errors and notifying the user about the timeout
                await interaction.followUp({
                    content: client.getLocalization(userLocale, "wordleGuessTimedOut"),
                    ephemeral: true,
                });
            }
        }

        // Removing the user from the active Wordles list after the game ends
        client.activeWordles.splice(client.activeWordles.indexOf(interaction.user.id), 1);
    },

    // Utility function to generate the user footer for the game embed
    async getUserFooter(
        locale: FormattedLocale,
        userAvatar: string,
        username: string,
        gameLocale: FormattedLocale,
        gameLength: number
    ): Promise<EmbedFooterData> {
        return {
            text: `${username}  |  ${client.getLocalization(locale, "Locale")}: ${client.getLocalization(locale, gameLocale)}  |  ${client.getLocalization(
                locale,
                "Length"
            )}: ${gameLength}`,
            iconURL: userAvatar,
        };
    },

    // Utility function to check the validity of user-submitted words
    async checkWord(word: string, gameLength: WordleLengths, gameLocale: FormattedLocale) {
        if (Utils.invalidCharacters.test(word)) {
            return client.getLocalization(gameLocale, "wordleInvalidWord");
        } else if (word.length !== gameLength) {
            return client.getLocalization(gameLocale, "wordleInvalidLength");
        } else if (!await client.words.find(word, gameLocale, gameLength)) {
            return client.getLocalization(gameLocale, "wordGameInvalidWord");
        }
    },
};
