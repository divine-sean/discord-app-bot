// commands/ping.js
import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong! (WORKING)'),
  async execute(interaction) {
    await interaction.reply('Pong!');
  }
};
