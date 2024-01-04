import { Locales } from "@prisma/client";
import { Locale } from "discord.js";
import { client } from "@/globals";

export class Utils {
	static Letters = {
		tr: "abcçdefghıijklmnoöprsştuüvyz",
		en: "abcdefghijklmnopqrstuvwxyz",
	};
	static random<T>(array: T[]) {
		return array[Math.floor(Math.random() * array.length)];
	}
	static randomInt(min: number = 0, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	static randomLetter(locale: "tr" | "en") {
		return this.random(Array.from(this.Letters[locale]));
	}
	static getRandomWords(roll: number) {
		const randomWords: string[] = [];
		for (let i = 0; i < roll; i++) {
			Array.from(this.Letters.en).forEach((letter) => {
				//@ts-ignore
				randomWords.push(this.random(client.words.en[letter]));
			});
		}

		return randomWords;
	}
	static avatarBaseURL = "https://cdn.discordapp.com/";
	static getAvatarURL(userId: string, avatarHash: string | null) {
		return `${this.avatarBaseURL}avatars/${userId}/${avatarHash}.png?size=64`;
	}
	static invalidCharacters = /[^a-zA-ZğüşıöçĞÜŞİÖÇ]/;
	static formatLocale(locale: Locales | Locale) {
		if (["Turkish", Locale.Turkish].includes(locale)) {
			return "tr";
		} else {
			return "en";
		}
	}
}
