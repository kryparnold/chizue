// Importing necessary types and modules from the project's global scope and Discord.js library
import { FormattedLocale, IEnglishWords, ITurkishWords, IWordleWords, Utils, WordleLengths, client } from "@/globals";
import { Colors, EmbedBuilder, TextChannel, User } from "discord.js";
import fs from "fs";

// Words class definition
export class Words {
    // Properties to store word lists and Discord TextChannels
    tr!: ITurkishWords;
    en!: IEnglishWords;
    wordleWords!: IWordleWords;
    wordReportChannel!: TextChannel;
    wordLogChannel!: TextChannel;

    // Initialization method for the Words class
    async init(wordReportChannel: TextChannel, wordLogChannel: TextChannel) {
        // Assigning provided TextChannels to class properties
        this.wordReportChannel = wordReportChannel;
        this.wordLogChannel = wordLogChannel;

        // Importing word lists from their respective paths in the configuration
        const turkishWords = (await import(client.config.turkishWordsPath)).default as ITurkishWords;
        const englishWords = (await import(client.config.englishWordsPath)).default as IEnglishWords;
        const wordleWords = (await import(client.config.wordleWordsPath)).default as IWordleWords;

        // Calculating the total number of words in each language
        let trSum = 0;
        let enSum = 0;
        Object.values(turkishWords).forEach((wordList) => (trSum += wordList.length));
        Object.values(englishWords).forEach((wordList) => (enSum += wordList.length));

        // Assigning imported word lists to class properties
        this.tr = turkishWords;
        this.en = englishWords;
        this.wordleWords = wordleWords;

        // Returning an object containing the total number of words in each language
        return { tr: trSum, en: enSum };
    }

    // Method to add a word to the specified language's word list
    async addWord(word: string, language: FormattedLocale, user: User) {
        // Adding the word to the appropriate starting letter category in the language's word list
        //@ts-ignore
        this[language][word.at(0)].push(word);

        // Checking if the word length is in the range [4, 5, 6], and adding it to the Wordle words list
        if ([4, 5, 6].includes(word.length)) {
            this.wordleWords[language][word.length as WordleLengths].push(word);
        }

        // Saving the updated word lists to their respective files
        await this.save();

        // Sending an embed to the word log channel to record the addition of the word
        await this.wordLogChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Word")
                    .setDescription(`Added **${word}** to ${client.getLocalization("en", language)} Words`)
                    .setColor(Colors.Green)
                    .setAuthor({
                        name: user.username,
                        iconURL: user.avatarURL() as string,
                    }),
            ],
        });
    }

    // Method to remove a word from the specified language's word list
    async removeWord(word: string, language: FormattedLocale, user: User) {
        // Removing the word from the appropriate starting letter category in the language's word list
        //@ts-ignore
        this[language][word.at(0)].splice(this[language][word.at(0)].indexOf(word), 1);

        // Checking if the word length is in the range [4, 5, 6], and removing it from the Wordle words list
        if ([4, 5, 6].includes(word.length)) {
            this.wordleWords[language][word.length as WordleLengths].splice(this.wordleWords[language][word.length as WordleLengths].indexOf(word), 1);
        }

        // Saving the updated word lists to their respective files
        await this.save();

        // Sending an embed to the word log channel to record the removal of the word
        await this.wordLogChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Word")
                    .setDescription(`Removed **${word}** from ${client.getLocalization("en", language)} Words`)
                    .setColor(Colors.Red)
                    .setAuthor({
                        name: user.username,
                        iconURL: user.avatarURL() as string,
                    }),
            ],
        });
    }

    // Method to save the current state of word lists to their respective files
    async save() {
        // Writing the word lists to their respective files in JSON format
        await fs.promises.writeFile(client.config.turkishWordsPath, JSON.stringify(this.tr), { encoding: "utf-8" });
        await fs.promises.writeFile(client.config.englishWordsPath, JSON.stringify(this.en), { encoding: "utf-8" });
        await fs.promises.writeFile(client.config.wordleWordsPath, JSON.stringify(this.wordleWords), { encoding: "utf-8" });
    }
}
