import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kill')
    .setDescription('From the makers of Kill Cosmic')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The user who died')
        .setRequired(true)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    await interaction.reply(`I killed ${targetUser} so they died\nhttps://tenor.com/view/die-spongebob-meme-gif-754776035690869996`);
  }
};
