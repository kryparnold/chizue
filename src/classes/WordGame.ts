import { prisma } from "@/globals";
import { GameMode, GameType, Locales, WordGame as WordGameModel } from "@prisma/client";
import { Message } from "discord.js";

export class WordGame {
	private id: string;
	private player: string;
	private letter: string;
	private limit: number;
	private randomWords: string[];
	private mode: GameMode;
	private locale: Locales;
    public type: GameType;
	private words: string[];

	constructor(game: WordGameModel) {
		this.id = game.id;
		this.player = game.player;
		this.letter = game.letter;
		this.limit = game.limit;
		this.randomWords = game.randomWords;
		this.mode = game.mode;
		this.locale = game.locale;
        this.type = game.type;
		this.words = game.words;
	}

    async handleWord(message: Message){
        // TODO - Add word handling
    }

    async save(){
        await prisma.wordGame.update({
            where: {
                id: this.id
            },
            data: {
                letter: this.letter,
                limit: this.limit,
                locale: this.locale,
                mode: this.mode,
                player: this.player,
                randomWords: this.randomWords,
                words: this.words
            }
        })
    }
}