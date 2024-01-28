import { Utils, client } from "@/globals";
import { ButtonInteraction, Colors, EmbedBuilder } from "discord.js";

export default {
    data: {
        id: "ticket",
    },
    async execute(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const currentTickets = await client.tickets.getCurrentTickets();

        const { userFooter, userLocale } = Utils.getUserMetadata(interaction.locale, interaction.user);

        const initialEmbed = new EmbedBuilder().setTitle("Ticket Sistemi").setFooter(userFooter);

        if (currentTickets.includes(interaction.user.id)) {
            const errorEmbed = initialEmbed.setDescription(client.getLocalization(userLocale, "buttonTicketUserHasTicket")).setColor(Colors.Red);

            await interaction.editReply({
                embeds: [errorEmbed],
            });
            return;
        }

        const everyoneId = interaction.guild?.roles.cache.find((role) => role.name === "@everyone")?.id!;

        const ticketChannelId = await client.tickets.add(interaction.user.id, everyoneId);

        const successEmbed = initialEmbed
            .setDescription(client.getLocalization<true>(userLocale, "buttonTicketSuccess")(ticketChannelId))
            .setColor(Colors.Green);

        await interaction.editReply({
            embeds: [successEmbed],
        });
    },
};
