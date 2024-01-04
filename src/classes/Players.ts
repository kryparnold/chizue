import { Player } from "@/globals";
import { Player as RawPlayer } from "@prisma/client";
import { Collection } from "discord.js";

export class Players {
    private cache = new Collection<string,Player>();

    async init(players: RawPlayer[]){
        players.forEach((player) => {
            const newPlayer = new Player(player);
            this.cache.set(player.id, newPlayer);
        });
    }

    getPlayer(id: string){
        return this.cache.get(id);
    }

    async add(player: RawPlayer){
        const newPlayer = new Player(player);
        this.cache.set(player.id,newPlayer);
        return newPlayer;
    }

    async count() {
        return this.cache.size;
    }
}