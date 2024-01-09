import { Player, prisma } from "@/globals";
import { Collection } from "discord.js";
import { Player as RawPlayer } from "@prisma/client";

export class Players {
	private cache = new Collection<string, Player>();

	async init(players: RawPlayer[]) {
		players.forEach((player) => this.cache.set(player.id, new Player(player)));
	}

	getAll() {
		return this.cache.map((player) => player);
	}

	get(id: string) {
		return this.cache.get(id);
	}

	async create(playerId: string, guildId: string, gameId: string) {
		const newRawPlayer = await prisma.player.create({
			data: {
				id: playerId,
				scores: {
					[guildId]: {
						[gameId]: 0,
					},
				},
			},
		});

		const player = new Player(newRawPlayer);

		this.cache.set(playerId, player);

		player.addGame(guildId, gameId);

        return player;
	}
}
