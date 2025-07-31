import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Displays information about this server.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    const { guild } = interaction;

    await interaction.reply({
      embeds: [{
        title: `Server Info: ${guild.name}`,
        thumbnail: { url: guild.iconURL({ dynamic: true }) },
        fields: [
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
          { name: 'Members', value: `${guild.memberCount}`, inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: false },
        ],
        color: 0x5865F2
      }]
    });
  }
};
