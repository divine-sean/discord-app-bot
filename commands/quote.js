import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  AttachmentBuilder
} from 'discord.js';

import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

export default {
  data: new ContextMenuCommandBuilder()
    .setName('Quote')
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const message = await interaction.channel.messages.fetch(interaction.targetId);
    const author = message.author;
    const content = message.content || '[No text content]';

    // Canvas settings
    const width = 800;
    const height = 200;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#2f3136'; // Discord dark theme background
    ctx.fillRect(0, 0, width, height);

    // Load avatar
    const avatarURL = author.displayAvatarURL({ extension: 'png', size: 128 });
    const avatar = await loadImage(await fetch(avatarURL).then(res => res.buffer()));
    ctx.drawImage(avatar, 25, 25, 64, 64);

    // Username
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px sans-serif';
    ctx.fillText(author.tag, 100, 50);

    // Message content (wrap if long)
    ctx.font = '18px sans-serif';
    wrapText(ctx, content, 100, 80, width - 120, 24);

    // Convert to attachment and send
    const buffer = canvas.toBuffer('image/png');
    const attachment = new AttachmentBuilder(buffer, { name: 'quote.png' });

    await interaction.reply({ files: [attachment] });
  }
};

// Helper: wrap long messages
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const { width } = ctx.measureText(testLine);

    if (width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
