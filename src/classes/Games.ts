import { WordGame as RawWordGame, CountingGame as RawCountingGame, Player as RawPlayer, GameType, Prisma } from "@prisma/client";
import { Collection, TextChannel } from "discord.js";
import { CountingGame, Players, Utils, WordGame, client, prisma } from "@/globals";

export class Games {
	private cache = new Collection<string, WordGame | CountingGame>();

	async init(wordGames: RawWordGame[], rawPlayers: RawPlayer[], countingGames: RawCountingGame[]) {
		wordGames.forEach(async (game) => {
			const players = new Players();
			await players.init(rawPlayers.filter((player) => player.wordGameId === game.id));
			const newGame = new WordGame({ ...game, players });

			this.cache.set(game.id, newGame);
		});

		countingGames.forEach(async (game) => {
			const newGame = new CountingGame(game);

			this.cache.set(game.id, newGame);
		});
	}

	async createWordGame(game: Prisma.WordGameCreateInput) {
		const newRawGame = await prisma.wordGame.create({
			data: game,
		});

		const newGame = new WordGame({ ...newRawGame, players: new Players() });

		this.cache.set(newGame.id, newGame);

        const gameChannel = client.channels.cache.get(newGame.id) as TextChannel;
        await gameChannel.send(client.getLocalization<true>(Utils.formatLocale(newGame.locale),"wordGameStarted")(newGame.letter));

		return newGame;
	}

	async createCountingGame(game: Prisma.CountingGameCreateInput) {
		const newRawGame = await prisma.countingGame.create({
			data: game,
		});

		const newGame = new CountingGame(newRawGame);

		this.cache.set(newGame.id, newGame);

        const gameChannel = client.channels.cache.get(newGame.id) as TextChannel;
        await gameChannel.send(client.getLocalization<true>(Utils.formatLocale(gameChannel.guild.preferredLocale),"countingGameStarted")(newGame.multiplier.toString()));

		return newGame;
	}

    count() {
        return this.cache.size;
    }

	async delete(gameId = "") {
		const game = this.cache.get(gameId);

		if (!game) {
			throw "Game not found with id: " + gameId;
		}

		if (game?.type === GameType.WordGame) {
			await prisma.wordGame.delete({ where: { id: gameId } });
		} else if (game?.type === GameType.CountingGame) {
			await prisma.countingGame.delete({ where: { id: gameId } });
		}

		this.cache.delete(gameId);
	}

	get(gameId: string) {
		return this.cache.get(gameId);
	}
}
