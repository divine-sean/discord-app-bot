import { SlashCommandBuilder, InteractionContextType } from 'discord.js';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Get the definition of a word.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addStringOption(option =>
      option.setName('word')
        .setDescription('The word to define')
        .setRequired(true)),

  async execute(interaction) {
    const word = interaction.options.getString('word');
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return interaction.reply(`❌ No definition found for **${word}**.`);

    const data = await res.json();
    const definition = data[0]?.meanings[0]?.definitions[0]?.definition;
    if (!definition) return interaction.reply(`❌ No definition found for **${word}**.`);

    await interaction.reply(`📖 **${word}**: ${definition}`);
  }
};
