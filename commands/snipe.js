// store last deleted message globally
let lastDeleted = null;

export function trackDeleted(message) {
  if (message.partial) return;
  lastDeleted = {
    content: message.content,
    author: message.author?.tag,
    time: message.createdTimestamp
  };
}

import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Retrieves the last deleted message.')
    .setContexts(InteractionContextType.Guild),

  async execute(interaction) {
    if (!lastDeleted) {
      return interaction.reply({ content: 'There’s nothing to snipe.', ephemeral: true });
    }

    await interaction.reply({
      embeds: [{
        title: `Sniped Message`,
        description: lastDeleted.content || '*No content*',
        fields: [{ name: 'Author', value: lastDeleted.author }],
        footer: { text: `Sent <t:${Math.floor(lastDeleted.time / 1000)}:R>` },
        color: 0x5865F2
      }]
    });
  }
};
