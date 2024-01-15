import config from "@/config";
import { FormattedLocale, IEnglishWords, ITurkishWords, IWordleWords, Utils, WordleLengths, client } from "@/globals";
import { Colors, EmbedBuilder, TextChannel, User } from "discord.js";
import fs from "fs";

export class Words {
	tr!: ITurkishWords;
	en!: IEnglishWords;
	wordleWords!: IWordleWords;
	wordReportChannel!: TextChannel;
	wordLogChannel!: TextChannel;

	async init(wordReportChannel: TextChannel, wordLogChannel: TextChannel) {
		this.wordReportChannel = wordReportChannel;
		this.wordLogChannel = wordLogChannel;
		const turkishWords = (await import(config.turkishWordsPath)).default as ITurkishWords;
		const englishWords = (await import(config.englishWordsPath)).default as IEnglishWords;
		const wordleWords = (await import(config.wordleWordsPath)).default as IWordleWords;

		let trSum = 0;
		let enSum = 0;
		Object.values(turkishWords).forEach((wordList) => (trSum += wordList.length));
		Object.values(englishWords).forEach((wordList) => (enSum += wordList.length));

		this.tr = turkishWords;
		this.en = englishWords;
		this.wordleWords = wordleWords;

		return { tr: trSum, en: enSum };
	}

	async addWord(word: string, language: FormattedLocale, user: User) {
		//@ts-ignore
		this[language][word.at(0)].push(word);

		if ([4, 5, 6].includes(word.length)) {
			this.wordleWords[language][word.length as WordleLengths].push(word);
		}

		await this.save();

		await this.wordLogChannel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle("Word")
					.setDescription(`Added **${word}** to ${client.getLocalization("en", language)}`)
					.setColor(Colors.Green)
					.setAuthor({
						name: user.username,
						iconURL: user.avatarURL() as string,
					}),
			],
		});
	}

	async removeWord(word: string, language: FormattedLocale, user: User) {
		//@ts-ignore
		this[language][word.at(0)].splice(this[language][word.at(0)].indexOf(word), 1);

		if ([4, 5, 6].includes(word.length)) {
			this.wordleWords[language][word.length as WordleLengths].splice(this.wordleWords[language][word.length as WordleLengths].indexOf(word), 1);
		}

		await this.save();

		await this.wordLogChannel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle("Word")
					.setDescription(`Removed **${word}** from ${client.getLocalization("en", language)}`)
					.setColor(Colors.Red)
					.setAuthor({
						name: user.username,
						iconURL: user.avatarURL() as string,
					}),
			],
		});
	}

	async save() {
		await fs.promises.writeFile(config.turkishWordsPath, JSON.stringify(this.tr), { encoding: "utf-8" });
		await fs.promises.writeFile(config.englishWordsPath, JSON.stringify(this.en), { encoding: "utf-8" });
		await fs.promises.writeFile(config.wordleWordsPath, JSON.stringify(this.wordleWords), { encoding: "utf-8" });
	}
}
