import { IEnglishWords, ITurkishWords, IWordleWords } from "@/globals";

export class Words {
    turkishWords!: ITurkishWords;
    englishWords!: IEnglishWords;
    wordleWords!: IWordleWords;

    constructor() {}

    async init(): Promise<{tr: number, en: number}> {
        const turkishWords = (await import("@/data/raw/tr_words.json")).default;
        const englishWords = (await import("@/data/raw/en_words.json")).default;
        const wordleWords = (await import("@/data/raw/wordle_words.json")).default;

        let trSum = 0;
        let enSum = 0;
        Object.values(turkishWords).forEach(
            (wordList) => (trSum += wordList.length)
        );
        Object.values(englishWords).forEach(
            (wordList) => (enSum += wordList.length)
        );

        this.turkishWords = turkishWords;
        this.englishWords = englishWords;
        this.wordleWords = wordleWords;

        return {tr: trSum, en: enSum};
    }
}
