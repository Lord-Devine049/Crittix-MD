/*
 * RECIPE.JS - Crittix-MD
 * Created by: LORD DEVINE
 */
const axios = require('axios');
const h = require('../../lib/helpers');

module.exports = {
  command: ['recipe'],
  aliases: ['cook'],
  category: 'soultools',
  description: 'Search for recipes',
  execute: async ({ sock, msg, args, text, sender, chatId, isOwner, isSudo, prefix, reply }) => {
    if (!text) return reply(h.demonError('.recipe', '.recipe <food name>'));

    try {
      const res = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(text)}`,
        { timeout: 10000 }
      );

      if (!res.data.meals)
        return reply(h.demonFail(`No recipe found for "${text}"`));

      const meal = res.data.meals[0];

      const ingredients = Array.from({ length: 20 })
        .map((_, i) => {
          const ing = meal[`strIngredient${i + 1}`];
          const meas = meal[`strMeasure${i + 1}`];
          return ing && ing.trim() ? `• ${ing.trim()} — ${(meas || '').trim()}` : null;
        })
        .filter(Boolean)
        .join('\n');

      const instructions = meal.strInstructions
        ? meal.strInstructions.substring(0, 400) + '...'
        : 'No instructions';

      const caption =
        `🍽️ *${meal.strMeal}*\n` +
        `🌍 ${meal.strArea} • 🏷️ ${meal.strCategory}\n\n` +
        `*Ingredients:*\n${ingredients}\n\n` +
        `*Steps:*\n${instructions}`;

      if (meal.strMealThumb) {
        await sock.sendMessage(chatId, {
          image: { url: meal.strMealThumb },
          caption
        }, { quoted: msg });
      } else {
        reply(caption);
      }
    } catch {
      reply(h.demonFail('Recipe search failed. Kitchen is closed.'));
    }
  }
};
