import { SlashCommandBuilder, InteractionContextType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('cmds')
    .setDescription('List all available commands and their descriptions.')
    .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),

  async execute(interaction) {
    // Get commands collection from client
    const commands = interaction.client.commands;

    // Build a string listing commands and their descriptions
    let replyText = '**Available commands:**\n\n';

    for (const [name, command] of commands) {
      const description = command.data?.description ?? 'No description';
      replyText += `**/${name}** - ${description}\n`;
    }

    // Discord messages max 2000 chars — slice if needed
    if (replyText.length > 1900) {
      replyText = replyText.slice(0, 1900) + '\n...and more';
    }

    await interaction.reply({ content: replyText, ephemeral: true });
  }
};
