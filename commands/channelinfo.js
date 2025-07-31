import { SlashCommandBuilder, InteractionContextType, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Displays information about this channel.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel),

  async execute(interaction) {
    const channel = interaction.channel;

    await interaction.reply({
      embeds: [{
        title: `Channel Info: #${channel.name || 'DM'}`,
        fields: [
          { name: 'ID', value: channel.id, inline: true },
          { name: 'Type', value: ChannelType[channel.type] ?? 'Unknown', inline: true },
          { name: 'NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true },
          ...(channel.topic ? [{ name: 'Topic', value: channel.topic }] : []),
        ],
        color: 0x5865F2
      }]
    });
  }
};
