import { WordGame as RawWordGame, CountingGame as RawCountingGame, Player as RawPlayer } from "@prisma/client";
import { Collection } from "discord.js";
import { CountingGame, Players, WordGame } from "@/globals";

export class Games {
	private cache = new Collection<string, WordGame | CountingGame>();

	async init(wordGames: RawWordGame[],rawPlayers: RawPlayer[],countingGames: RawCountingGame[]) {
        wordGames.forEach(async (game) => {
            const players = new Players();
            await players.init(rawPlayers.filter((player) => player.wordGameId === game.id));
            const newGame = new WordGame({...game,players});
            
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
