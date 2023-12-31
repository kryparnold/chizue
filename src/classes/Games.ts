import { WordGame as WordGameModel, CountingGame as CountingGameModel, GameType } from "@prisma/client";
import { Collection } from "discord.js";
import { CountingGame, WordGame } from "@/globals";

export class Games {
	private cache = new Collection<string, WordGame | CountingGame>();

	async init(games: (WordGameModel | CountingGameModel)[]) {
		games.forEach(async (game) => {

			const newGame = game.type === GameType.WordGame ? new WordGame(game as WordGameModel) : new CountingGame(game as CountingGameModel);

			this.cache.set(game.id, newGame);
		});
	}

	get(gameId: string) {
		return this.cache.get(gameId);
	}
}
