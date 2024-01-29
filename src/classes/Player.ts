// Importing the Prisma client instance from the global namespace
import { prisma } from "@/globals";

// Importing the Player model from Prisma generated client
import { Player as PlayerModel } from "@prisma/client";

// Defining an interface for scores with dynamic keys
interface IScores {
    [x: string]: {
        [x: string]: number;
    };
}

// Class representing a player with score tracking functionality
export class Player {
    // Properties for player ID, total score, and scores per guild and game
    id: string;
    score: number;
    scores: IScores;

    // Constructor to create a Player instance from a PlayerModel
    constructor(player: PlayerModel) {
        this.id = player.id;
        this.score = player.score;
        this.scores = (player.scores as IScores) ?? {};
    }

    // Method to add a score to the player's total and per-game scores
    async addScore(score: number, guildId: string, gameId: string) {
        const playerScore = this.score;
        const playerGameScore = this.scores[guildId][gameId];
        this.score = +(playerScore + score).toFixed(1);
        this.scores[guildId][gameId] = +(playerGameScore + score).toFixed(1);
        await this.save();
    }

    // Method to remove a score from the player's total score
    removeScore(score: number) {
        const playerScore = this.score;
        this.score = +(playerScore + score).toFixed(1);
    }

    // Method to initialize a new game entry for the player
    async addGame(guildId: string, gameId: string) {
        // Checking if the guild entry exists in scores, if not, creating it
        if (!this.scores[guildId]) {
            this.scores[guildId] = {};
        }

        // Initializing the game entry with a score of 0
        this.scores[guildId][gameId] = 0;

        // Saving the updated data to the database
        await this.save();
    }

    // Method to remove a game from the player
    async removeGame(guildId: string, gameId: string) {
        // Check if the guild entry exists in scores
        if (this.scores[guildId] && this.scores[guildId].hasOwnProperty(gameId)) {
            // Remove the score from total score
            this.removeScore(this.scores[guildId][gameId]);

            // Remove the game entry
            delete this.scores[guildId][gameId];

            // Check if there are no more games in the guild scores
            if (Object.keys(this.scores[guildId]).length === 0) {
                // If there are no more games, remove the guild entry
                delete this.scores[guildId];

                // Check if the player is associated with any other guilds
                const hasOtherGuilds = Object.keys(this.scores).length > 0;

                return !hasOtherGuilds && this.score === 0;
            }

            // Save the updated data to the database
            await this.save();
        }
    }

    // Method to save the current player data to the database
    async save() {
        await prisma.player.update({
            where: {
                id: this.id,
            },
            data: {
                score: this.score,
                scores: this.scores,
            },
        });
    }
}
