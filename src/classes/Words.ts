import { IEnglishWords, ITurkishWords, IWordleWords } from "@/globals";

export class Words {
	tr!: ITurkishWords;
	en!: IEnglishWords;
	wordleWords!: IWordleWords;

	async init() {
		const turkishWords = (await import("@/database/json/tr_words.json")).default;
		const englishWords = (await import("@/database/json/en_words.json")).default;
		const wordleWords = (await import("@/database/json/wordle_words.json")).default;

		let trSum = 0;
		let enSum = 0;
		Object.values(turkishWords).forEach((wordList) => (trSum += wordList.length));
		Object.values(englishWords).forEach((wordList) => (enSum += wordList.length));

		this.tr = turkishWords;
		this.en = englishWords;
		this.wordleWords = wordleWords;

		return { tr: trSum, en: enSum };
	}
}
