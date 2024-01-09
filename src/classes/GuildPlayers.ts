import { Player } from "@/globals";
import { Player as RawPlayer } from "@prisma/client";
import { Collection } from "discord.js";

export class GuildPlayers {
	private cache = new Collection<string, Player>();

	async init(players: Player[]) {
		players.forEach((player) => {
			this.cache.set(player.id, player);
		});
	}

    getPlayer(id: string) {
        return this.cache.get(id);
    }
}
