import config from "@/config";
import { FormattedLocale, IEnglishWords, ITurkishWords, IWordleWords, WordleLengths } from "@/globals";
import { TextChannel } from "discord.js";
import fs from "fs";

export class Words {
	tr!: ITurkishWords;
	en!: IEnglishWords;
	wordleWords!: IWordleWords;
	wordReportChannel!: TextChannel;

	async init(wordReportChannel: TextChannel) {
		this.wordReportChannel = wordReportChannel;
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

	async addWord(word: string, language: FormattedLocale) {
		//@ts-ignore
		this[language][word.at(0)].push(word);

		if ([4, 5, 6].includes(word.length)) {
			this.wordleWords[language][word.length as WordleLengths].push(word);
		}

		await this.save();
	}

	async save() {
		await fs.promises.writeFile(config.turkishWordsPath, JSON.stringify(this.tr), { encoding: "utf-8" });
		await fs.promises.writeFile(config.englishWordsPath, JSON.stringify(this.en), { encoding: "utf-8" });
		await fs.promises.writeFile(config.wordleWordsPath, JSON.stringify(this.wordleWords), { encoding: "utf-8" });
	}
}
