// Importing the Player class from the global namespace and the Collection class from discord.js
import { Player } from "@/globals";
import { Collection } from "discord.js";

// Class definition for managing players within a guild
export class GuildPlayers {
    // Private property to store player data using a Collection
    private cache = new Collection<string, Player>();
    get = this.cache.get;

    // Asynchronous method to initialize the GuildPlayers instance with an array of players
    async init(players: Player[]) {
        // Iterating through the array of players and adding them to the cache using their IDs as keys
        players.forEach((player) => {
            this.cache.set(player.id, player);
        });
    }
}
