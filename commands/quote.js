import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  AttachmentBuilder,
  InteractionContextType,
} from "discord.js";
import { createCanvas, loadImage, registerFont } from "canvas";
import fetch from "node-fetch";
import path from "path";

registerFont(path.join(process.cwd(), "fonts", "Georgia.ttf"), { family: "Georgia" });

const customEmojiRegex = /<a?:\w+:(\d+)>/g;

// Pre-measures the width of a line containing text + emojis
async function measureLineWidth(ctx, text, font, maxWidth, emojiSize) {
  ctx.font = font;
  let parts = [];
  let lastIndex = 0;
  let match;

  while ((match = customEmojiRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "emoji", id: match[1], raw: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  let width = 0;
  for (const part of parts) {
    if (part.type === "text") {
      width += ctx.measureText(part.content).width;
    } else {
      width += emojiSize + 2; // spacing after emoji
    }
  }
  return width;
}

// Draws one line (text + emojis) centered horizontally at given y
async function drawLineWithEmojis(ctx, text, x, y, maxWidth, font, emojiSize) {
  ctx.font = font;
  ctx.textBaseline = "top";
  ctx.fillStyle = "#eee";

  let parts = [];
  let lastIndex = 0;
  let match;

  while ((match = customEmojiRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "emoji", id: match[1], raw: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  // Measure total line width to center horizontally
  let lineWidth = 0;
  for (const part of parts) {
    if (part.type === "text") {
      lineWidth += ctx.measureText(part.content).width;
    } else {
      lineWidth += emojiSize + 2;
    }
  }
  let cursorX = x + (maxWidth - lineWidth) / 2;

  for (const part of parts) {
    if (part.type === "text") {
      ctx.fillText(part.content, cursorX, y);
      cursorX += ctx.measureText(part.content).width;
    } else {
      try {
        const emojiURL = `https://cdn.discordapp.com/emojis/${part.id}.png?v=1`;
        const res = await fetch(emojiURL);
        if (!res.ok) continue;
        const buffer = await res.buffer();
        const img = await loadImage(buffer);
        ctx.drawImage(img, cursorX, y, emojiSize, emojiSize);
        cursorX += emojiSize + 2;
      } catch {
        // ignore emoji errors
      }
    }
  }
}

export default {
  data: new ContextMenuCommandBuilder()
    .setName("Quote")
    .setType(ApplicationCommandType.Message)
    .setContexts(
      InteractionContextType.Guild,
      InteractionContextType.BotDM,
      InteractionContextType.PrivateChannel
    ),

  async execute(interaction) {
    const message = interaction.targetMessage;
    if (!message) {
      return interaction.reply({
        content: "Could not fetch the target message.",
        ephemeral: true,
      });
    }

    const author = message.author;
    const content = message.content || "";

    // Canvas setup
    const width = 900;
    const height = 300;
    const photoSize = height;
    const padding = 30;
    const rightAreaWidth = width - photoSize;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // White border frame (thick)
    const borderWidth = 6;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#111111";
    ctx.fillRect(borderWidth, borderWidth, width - 2 * borderWidth, height - 2 * borderWidth);

    // Load and draw avatar center-cropped
    const avatarURL = author.displayAvatarURL({ extension: "png", size: 512 });
    const avatarBuffer = await fetch(avatarURL).then((res) => res.buffer());
    const avatar = await loadImage(avatarBuffer);

    const size = Math.min(avatar.width, avatar.height);
    const sx = (avatar.width - size) / 2;
    const sy = (avatar.height - size) / 2;
    ctx.drawImage(avatar, sx, sy, size, size, 0, 0, photoSize, photoSize);

    // Right side background
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(photoSize, 0, rightAreaWidth, height);

    const textX = photoSize + padding;
    const textWidth = rightAreaWidth - 2 * padding;

    // Font scaling params
    let fontSize = 26;
    const minFontSize = 14;
    const lineHeightRatio = 1.3;

    // Wrap text lines
    ctx.font = `${fontSize}px Georgia, serif`;
    let lines = wrapText(ctx, content, textWidth);

    let lineHeight = fontSize * lineHeightRatio;
    let textBlockHeight = lines.length * lineHeight + 40; // + author name space

    // Scale font down if needed
    while (textBlockHeight > height - 2 * padding && fontSize > minFontSize) {
      fontSize--;
      ctx.font = `${fontSize}px Georgia, serif`;
      lines = wrapText(ctx, content, textWidth);
      lineHeight = fontSize * lineHeightRatio;
      textBlockHeight = lines.length * lineHeight + 40;
    }

    const emojiSize = lineHeight * 0.9;
    const startY = height / 2 - textBlockHeight / 2 + padding;

    if (!content.trim() && message.stickers && message.stickers.size === 1) {
      // Only one sticker, no text — center sticker
      const sticker = message.stickers.first();
      try {
        const stickerImg = await loadImage(sticker.url);
        const maxStickerSize = rightAreaWidth - 2 * padding;
        const scale = Math.min(
          maxStickerSize / stickerImg.width,
          (height - 2 * padding - 40) / stickerImg.height, // leave space for author name below
          1
        );
        const w = stickerImg.width * scale;
        const h = stickerImg.height * scale;
        const centerX = photoSize + (rightAreaWidth - w) / 2;
        const centerY = (height - h - 40) / 2; // shifted up for author name
        ctx.drawImage(stickerImg, centerX, centerY, w, h);

        // Draw author name below sticker, centered horizontally
        ctx.fillStyle = "#aaa";
        ctx.font = `italic ${Math.floor(fontSize * 0.75)}px Georgia, serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(`— ${author.username}`, photoSize + rightAreaWidth / 2, centerY + h + 10);
      } catch {
        // ignore errors
      }
    } else {
      // Text present or multiple stickers
      let currentY = startY;
      for (const line of lines) {
        // eslint-disable-next-line no-await-in-loop
        await drawLineWithEmojis(
          ctx,
          line,
          textX,
          currentY,
          textWidth,
          `${fontSize}px Georgia, serif`,
          emojiSize
        );
        currentY += lineHeight;
      }

      // Draw author name below text
      ctx.fillStyle = "#aaa";
      ctx.font = `italic ${Math.floor(fontSize * 0.75)}px Georgia, serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`— ${author.username}`, textX + textWidth / 2, currentY + 10);

      // Multiple stickers bottom-right, shifted up if needed to avoid overlap
      if (message.stickers && message.stickers.size > 1) {
        const stickerSize = 64;
        let offsetX = width - stickerSize - padding;
        const bottomMargin = 10;
        const authorNameHeight = Math.floor(fontSize * 0.75) + 10;
        const stickersBottomY = height - stickerSize - padding;
        const stickersY = stickersBottomY - authorNameHeight - bottomMargin;
        for (const sticker of message.stickers.values()) {
          try {
            // eslint-disable-next-line no-await-in-loop
            const stickerImg = await loadImage(sticker.url);
            ctx.drawImage(stickerImg, offsetX, stickersY, stickerSize, stickerSize);
            offsetX -= stickerSize + 10;
          } catch {
            // ignore errors
          }
        }
      }
    }

    const buffer = canvas.toBuffer("image/png");
    const attachment = new AttachmentBuilder(buffer, { name: "quote.png" });
    await interaction.reply({ files: [attachment] });
  },
};

function wrapText(ctx, text, maxWidth) {
  const lines = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    let words = paragraph.split(" ");
    let currentLine = "";

    for (let word of words) {
      const testLine = currentLine ? currentLine + " " + word : word;
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
  }

  return lines;
}
