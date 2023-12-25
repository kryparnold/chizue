import { prisma } from "@/globals";
import { ButtonInteraction } from "discord.js";

export default {
    data: {
        id: "ping",
    },
    async execute(interaction: ButtonInteraction){
        await interaction.reply({
            content:"Pong!",
            ephemeral: true
        });
    }
}