import { prisma } from "@/globals";
import { Player as PlayerModel } from "@prisma/client";

export class Player {
	key: string;
	id: string;
	score: number;
	wordGameId: string | null;

	constructor(player: PlayerModel) {
		this.key = player.key;
		this.id = player.id;
		this.score = player.score;
		this.wordGameId = player.wordGameId;
	}

	async addScore(score: number) {
		this.score += score;
		this.score = +this.score.toFixed(1);
		await this.save();
	}

	async save() {
		await prisma.player.update({
			where: {
				key: this.key,
			},
			data: {
				score: this.score,
			},
		});
	}
}