import { SlashCommandBuilder, InteractionContextType } from 'discord.js';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('urban')
    .setDescription('Get the Urban Dictionary definition for a word.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM)
    .addStringOption(option =>
      option.setName('term')
        .setDescription('Term to search')
        .setRequired(true)),

  async execute(interaction) {
    const term = interaction.options.getString('term');
    const res = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);
    if (!res.ok) return interaction.reply(`❌ No results found for **${term}**.`);

    const data = await res.json();
    if (!data.list.length) return interaction.reply(`❌ No results found for **${term}**.`);

    const def = data.list[0].definition.replace(/\[|\]/g, '');
    await interaction.reply(`📚 **${term}**: ${def}`);
  }
};
