// Importing necessary types and modules from the project's global scope and Discord.js library
import { FormattedLocale, IEnglishWords, ITurkishWords, IWordleWords, WordleLengths, client } from "@/globals";
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
    tdkBaseUrl = "https://sozluk.gov.tr/gts?ara=";

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

    // Method to find a word from the specified language's word list
    async find(word: string, language: FormattedLocale, length?: number) {
        if (language === "en") {
            //@ts-ignore
            // Check the word and return
            return (length ? this.wordleWords.en[length] : this.en[word.at(0)]).includes(word) as boolean;
        }
        //@ts-ignore
        // Check if the word exists in data
        let wordExists: boolean = (length ? this.wordleWords.tr[length] : this.tr[word.at(0)]).includes(word);

        // Return if word already exists
        if (wordExists) return wordExists;

        // If word doesn't exists in data check api
        const isWordValid = await this.checkApi(word);

        // If word is in the api add the word to the data and return true
        if (isWordValid) {
            await this.addWord(word, language);
            return true;
        }

        return false;
    }

    // Method to get a word from the TDK api
    async checkApi(word: string) {
        // Getting the fetch url with combining word and base url
        const url = this.tdkBaseUrl + word;

        // Fetching the response using Google API user agent
        const response = await fetch(url, {
            headers: {
                "User-Agent": "APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)",
            },
        });

        // Getting the json data from the response
        const data: any = await response.json();

        // Returning if data has error or response status is not 200 (OK)
        if (data.error || response.status !== 200) return false;

        // Returning true means the word exists in api
        return true;
    }

    // Method to add a word to the specified language's word list
    async addWord(word: string, language: FormattedLocale, user?: User) {
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
                        name: (user ?? client.user)?.username!,
                        iconURL: (user ?? client.user)?.avatarURL()!,
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
        await fs.promises.writeFile(client.config.turkishWordsPath, JSON.stringify(this.tr, null, 4), { encoding: "utf-8" });
        await fs.promises.writeFile(client.config.englishWordsPath, JSON.stringify(this.en, null, 4), { encoding: "utf-8" });
        await fs.promises.writeFile(client.config.wordleWordsPath, JSON.stringify(this.wordleWords, null, 4), { encoding: "utf-8" });
    }
}
