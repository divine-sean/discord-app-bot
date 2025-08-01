import {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  AttachmentBuilder,
  InteractionContextType,
} from "discord.js";

// Helper: parse custom emoji string, returns { animated, name, id } or null
function parseCustomEmoji(emoji) {
  const regex = /^<(a)?:([\w]+):(\d+)>$/;
  const match = emoji.match(regex);
  if (!match) return null;
  return {
    animated: !!match[1],
    name: match[2],
    id: match[3],
  };
}

export default [
  {
    // Slash command /emoji
    data: new SlashCommandBuilder()
      .setName("emoji")
      .setDescription("Download a custom Discord emoji")
      .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
      
      .addStringOption((opt) =>
        opt
          .setName("emoji")
          .setDescription("Custom emoji to download")
          .setRequired(true)
      ),

    async execute(interaction) {
      const emojiInput = interaction.options.getString("emoji");
      const parsed = parseCustomEmoji(emojiInput);

      if (!parsed) {
        await interaction.reply({
          content: "Please provide a valid custom emoji (like <:name:id> or <a:name:id>).",
          ephemeral: true,
        });
        return;
      }

      const ext = parsed.animated ? "gif" : "png";
      const url = `https://cdn.discordapp.com/emojis/${parsed.id}.${ext}`;

      const attachment = new AttachmentBuilder(url).setName(`${parsed.name}.${ext}`);

      await interaction.reply({ files: [attachment] });
    },
  },

  {
    // Message context menu "Download Emoji"
    data: new ContextMenuCommandBuilder()
      .setName("Download Emoji")
      .setType(ApplicationCommandType.Message)
      .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel),
      

    async execute(interaction) {
      const msg = interaction.targetMessage;

      // Check if the message content is exactly one custom emoji
      const parsed = parseCustomEmoji(msg.content.trim());

      if (!parsed) {
        await interaction.reply({
          content: "Message does not contain exactly one custom emoji.",
          ephemeral: true,
        });
        return;
      }

      const ext = parsed.animated ? "gif" : "png";
      const url = `https://cdn.discordapp.com/emojis/${parsed.id}.${ext}`;

      const attachment = new AttachmentBuilder(url).setName(`${parsed.name}.${ext}`);

      await interaction.reply({ files: [attachment] });
    },
  },
];
