import { client } from "@/globals";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CategoryChannel, ChannelType, Colors, EmbedBuilder, User } from "discord.js";

export class Tickets {
    private ticketCategory!: CategoryChannel;
    private ticketPrefix = "ticket-";

    async init(ticketCategory: CategoryChannel) {
        this.ticketCategory = ticketCategory;
    }

    async getCurrentTickets() {
        const ticketChannels = this.ticketCategory.children.cache.map((channel) => channel.name);

        return ticketChannels.map((channelName) => channelName.split("-")[1]);
    }

    async add(userId: string, everyoneId: string) {
        const newTicket = await this.ticketCategory.children.create({
            name: this.ticketPrefix + userId,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: userId,
                    allow: ["SendMessages", "ViewChannel"],
                },
                {
                    id: everyoneId,
                    deny: ["ViewChannel"],
                },
            ],
        });

        const closeTicketButton = new ButtonBuilder().setCustomId("close-ticket").setStyle(ButtonStyle.Danger).setLabel("Ticket'ı Kapat");

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(closeTicketButton);

        const ticketEmbed = new EmbedBuilder()
            .setTitle("Ticket Sistemi")
            .setDescription(
                "Ticket'ınıza hoş geldiniz, en kısa sürede yetkililer sizinle ilgilenecektir. Sorununuz çözüme kavuştuğunda alttaki butondan ticket'ı kapatabilirsiniz."
            )
            .setColor(Colors.Green)
            .setFooter({ text: "Chizue Ticket Sistemi" });

        await newTicket.send({
            embeds: [ticketEmbed],
            components: [buttonRow],
        });

        return newTicket.id;
    }
}
