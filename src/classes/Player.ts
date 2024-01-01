import { prisma } from "@/globals";
import { Player as PlayerModel } from "@prisma/client";

export class Player {
    id: string;
    score: number;
    wordGameId: string | null;

    constructor(player: PlayerModel){
        this.id = player.id;
        this.score = player.score;
        this.wordGameId = player.wordGameId;
    }

    async addScore(score: number){
        this.score += score;
        await this.save();
    }

    async save(){
        await prisma.player.update({
            where: {
                id: this.id
            },
            data: {
                score: this.score
            }
        })
    }
}