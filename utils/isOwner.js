const OWNER_IDS = [process.env.BOT_OWNER_ID]; // Add your Discord user ID(s)

export function isOwner(userId) {
  return OWNER_IDS.includes(userId);
}
