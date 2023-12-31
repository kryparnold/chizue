import { WordGame as WordGameModel, CountingGame as CountingGameModel, GameType } from "@prisma/client";
import { Collection } from "discord.js";
import { CountingGame, WordGame } from "@/globals";

export class Games {
	private cache = new Collection<string, WordGame | CountingGame>();

	async init(wordGames: WordGameModel[],countingGames: CountingGameModel[]) {
        wordGames.forEach(async (game) => {
            const newGame = new WordGame(game);

            this.cache.set(game.id, newGame);
        });

        countingGames.forEach(async (game) => {
            const newGame = new CountingGame(game);

            this.cache.set(game.id, newGame);
        });
	}

	get(gameId: string) {
		return this.cache.get(gameId);
	}
}
