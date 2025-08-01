import { SlashCommandBuilder, InteractionContextType } from 'discord.js';
import fetch from 'node-fetch';

export default {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Tell a random joke.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),

  async execute(interaction) {
    try {
      const res = await fetch('https://official-joke-api.appspot.com/jokes/random');
      const data = await res.json();
      await interaction.reply(`${data.setup}\n\n${data.punchline}`);
    } catch {
      await interaction.reply('Failed to fetch a joke. Try again later.');
    }
  }
};
