import { prisma } from "@/globals";
import { Player as PlayerModel } from "@prisma/client";

interface IScores {
    [x: string]: {
        [x: string]: number
    }
}

export class Player {
	id: string;
	score: number;
    scores: IScores;

	constructor(player: PlayerModel) {
		this.id = player.id;
		this.score = player.score;
        this.scores = JSON.parse(player.scores?.toString() as string);
	}

	async addScore(score: number, guildId: string, gameId: string) {
		this.score += score;
		this.scores[guildId][gameId] += score;
		await this.save();
	}

    async addGame(guildId: string, gameId: string) {
        if(!this.scores[guildId]) {
            this.scores[guildId] = {}
        }

        this.scores[guildId][gameId] = 0;

        await this.save();
    }

	async save() {
		await prisma.player.update({
			where: {
				id: this.id,
			},
			data: {
				score: this.score,
                scores: this.scores
			},
		});
	}
}