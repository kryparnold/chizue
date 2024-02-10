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
    apiUrls = {
        tr: "https://sozluk.gov.tr/gts?ara=",
        en: "https://api.dictionaryapi.dev/api/v2/entries/en/",
    };

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

    // Method to find a word from the specified language's word list or check its existence via an API
    async find(word: string, language: FormattedLocale, length?: number) {
        //@ts-ignore
        // Retrieve the word list based on the language and optional length parameter
        const wordList: string[] = length ? this.wordleWords[language][length as WordleLengths] : this[language][word.charAt(0)!];

        // Check if the word exists in the retrieved word list
        const wordExists = wordList.includes(word);

        // If the word exists in the word list, return true
        if (wordExists) return true;

        // If the word is not found in the word list, check its existence via an API
        // Determine which API to use based on the specified language
        const wordExistsInAPI = language === "en" ? await this.checkEnglishAPI(word) : await this.checkTurkishAPI(word);

        // Return the result of API check (true if the word exists, false otherwise)
        return wordExistsInAPI;
    }

    // Method to check the availability of a word in the Turkish Language Association (TDK) API
    async checkTurkishAPI(word: string) {
        // Construct the URL for the TDK API using the provided word
        const url = this.apiUrls.tr + word;

        // Send a request to the TDK API endpoint
        const response = await fetch(url, {
            // Provide a user-agent header to identify the request source
            headers: {
                "User-Agent": "APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)",
            },
        });

        // Parse the response as JSON
        const data: any = await response.json();

        // Check if there's an error in the response or if the status code is not 200 (OK)
        if (data.error || response.status !== 200) return false;

        // If no errors and status is OK, return true indicating the word is available
        return true;
    }

    // Method to check the availability of a word in the English API
    async checkEnglishAPI(word: string) {
        // Construct the URL for the English API using the provided word
        const url = this.apiUrls.en + word;

        // Send a request to the English API endpoint
        const response = await fetch(url);

        // Parse the response as JSON
        const data: any = await response.json();

        // Check if the response contains a title (indicating the word doesn't exists) or if the status code is not 200 (OK)
        if (data.title || response.status !== 200) return false;

        // If no title found and status is OK, return true indicating the word is available
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
