import { SlashCommandBuilder } from 'discord.js';
import { isOwner } from '../utils/isOwner.js';

export default {
  data: new SlashCommandBuilder()
    .setName('guilds')
    .setDescription('List all servers the bot is in'),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
    }

    const guilds = interaction.client.guilds.cache.map(g => `• ${g.name} (${g.id})`);
    const output = guilds.join('\n').slice(0, 1900);
    return interaction.reply({ content: `\`\`\`\n${output || 'No guilds found.'}\n\`\`\`` });
  }
};
