import { ButtonInteraction } from "discord.js";

export default {
    data: {
        id: "delete",
    },
    async execute(interaction: ButtonInteraction) {
        await interaction.message.delete().catch(() => {});
    },
};
