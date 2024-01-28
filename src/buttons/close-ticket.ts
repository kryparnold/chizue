import { ButtonInteraction } from "discord.js";

export default {
    data: {
        id: "close-ticket",
    },
    async execute(interaction: ButtonInteraction) {
        await interaction.channel?.delete();
    },
};
