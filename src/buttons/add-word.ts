import { ButtonParams, FormattedLocale, client } from "@/globals";
import { ButtonInteraction } from "discord.js";

export default {
    data: {
        id: "add-word",
        params: ["word", "language"],
    },
    async execute(interaction: ButtonInteraction, params: ButtonParams) {
        const word = params["word"];
        const language = params["language"] as FormattedLocale;

        await client.words.addWord(word, language, interaction.user);

        interaction.message
            .edit({
                components: [],
            })
            .catch(() => {});

        await interaction.reply({
            content: `The word **${word}** added to ${client.getLocalization("en", language)} Words.`,
            ephemeral: true,
        });
    },
};
