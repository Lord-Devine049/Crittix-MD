/*
 * EDUCATION-NEW2.JS - Crittix-MD
 * Created by: LORD DIVINE
 * Commands: chemcompound, worldfacts, spacefacts2
 */
const h = require('../../lib/helpers');
const axios = require('axios');

module.exports = [

  {
    command: 'chemcompound',
    aliases: ['chemical', 'chemformula'],
    category: 'soultools',
    description: 'Look up a chemical compound\'s formula and properties. Usage: chemcompound water',
    execute: async ({ args, reply }) => {
      const query = args.join(' ').toLowerCase().trim();
      if (!query) return reply(h.demonError('.chemcompound', '.chemcompound <compound name>'));
      const compounds = {
        water: { formula: 'H₂O', name: 'Water', molar: '18.015 g/mol', state: 'Liquid (at room temp)', bp: '100°C', mp: '0°C', notes: 'Universal solvent. Essential for life.' },
        salt: { formula: 'NaCl', name: 'Sodium Chloride (Table Salt)', molar: '58.44 g/mol', state: 'Solid', bp: '1413°C', mp: '801°C', notes: 'Ionic compound. Food seasoning and preservative.' },
        glucose: { formula: 'C₆H₁₂O₆', name: 'Glucose', molar: '180.16 g/mol', state: 'Solid', bp: 'Decomposes', mp: '146°C', notes: 'Simple sugar. Primary energy source for cells.' },
        'carbon dioxide': { formula: 'CO₂', name: 'Carbon Dioxide', molar: '44.01 g/mol', state: 'Gas', bp: '-78.5°C (sublimes)', mp: '-56.6°C', notes: 'Greenhouse gas. Produced by respiration and combustion.' },
        co2: { formula: 'CO₂', name: 'Carbon Dioxide', molar: '44.01 g/mol', state: 'Gas', bp: '-78.5°C (sublimes)', mp: '-56.6°C', notes: 'Greenhouse gas. Produced by respiration and combustion.' },
        'sulfuric acid': { formula: 'H₂SO₄', name: 'Sulfuric Acid', molar: '98.08 g/mol', state: 'Liquid', bp: '337°C', mp: '10°C', notes: 'Strong acid. Widely used in industrial processes.' },
        ammonia: { formula: 'NH₃', name: 'Ammonia', molar: '17.03 g/mol', state: 'Gas', bp: '-33.35°C', mp: '-77.73°C', notes: 'Used in fertilizers and cleaning products.' },
        ethanol: { formula: 'C₂H₅OH', name: 'Ethanol (Ethyl Alcohol)', molar: '46.07 g/mol', state: 'Liquid', bp: '78.37°C', mp: '-114.1°C', notes: 'Found in alcoholic beverages and used as fuel.' },
        methane: { formula: 'CH₄', name: 'Methane', molar: '16.04 g/mol', state: 'Gas', bp: '-161.5°C', mp: '-182.5°C', notes: 'Main component of natural gas. Greenhouse gas.' },
        'hydrogen peroxide': { formula: 'H₂O₂', name: 'Hydrogen Peroxide', molar: '34.01 g/mol', state: 'Liquid', bp: '150.2°C', mp: '-0.43°C', notes: 'Used as antiseptic and bleaching agent.' },
        'sodium hydroxide': { formula: 'NaOH', name: 'Sodium Hydroxide (Lye)', molar: '39.997 g/mol', state: 'Solid', bp: '1388°C', mp: '318°C', notes: 'Strong base. Used in soap making and drain cleaners.' },
        caffeine: { formula: 'C₈H₁₀N₄O₂', name: 'Caffeine', molar: '194.19 g/mol', state: 'Solid', bp: '178°C (sublimes)', mp: '235°C', notes: 'Stimulant found in coffee, tea, and energy drinks.' },
        aspirin: { formula: 'C₉H₈O₄', name: 'Aspirin (Acetylsalicylic Acid)', molar: '180.16 g/mol', state: 'Solid', bp: '140°C (decomposes)', mp: '136°C', notes: 'Pain reliever and anti-inflammatory drug.' },
        ozone: { formula: 'O₃', name: 'Ozone', molar: '47.998 g/mol', state: 'Gas', bp: '-112°C', mp: '-192.2°C', notes: 'Forms Earth\'s protective ozone layer. Toxic in high concentrations.' },
        'acetic acid': { formula: 'CH₃COOH', name: 'Acetic Acid (Vinegar)', molar: '60.052 g/mol', state: 'Liquid', bp: '118.1°C', mp: '16.6°C', notes: 'Main component of vinegar. Weak acid.' }
      };
      const compound = compounds[query] || Object.values(compounds).find(c => c.name.toLowerCase().includes(query));
      if (!compound) {
        try {
          const res = await axios.get(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularFormula,MolecularWeight,IUPACName/JSON`, { timeout: 8000 });
          const props = res.data?.PropertyTable?.Properties?.[0];
          if (!props) return reply(h.demonFail(`couldn't find info on "${query}". Try a more common compound name.`));
          return reply(`🧪 *CHEMICAL COMPOUND*\n\n🏷️ Name: *${props.IUPACName || query}*\n⚗️ Formula: *${props.MolecularFormula}*\n⚖️ Molar Mass: *${parseFloat(props.MolecularWeight).toFixed(3)} g/mol*\n\nData via PubChem.\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
        } catch { return reply(h.demonFail(`compound "${query}" not found. Try names like: water, salt, ethanol, caffeine`)); }
      }
      reply(
        `🧪 *CHEMICAL COMPOUND*\n\n` +
        `🏷️ Name: *${compound.name}*\n` +
        `⚗️ Formula: *${compound.formula}*\n` +
        `⚖️ Molar Mass: *${compound.molar}*\n` +
        `🌡️ State: *${compound.state}*\n` +
        `🔥 Boiling Point: *${compound.bp}*\n` +
        `❄️ Melting Point: *${compound.mp}*\n\n` +
        `📝 ${compound.notes}\n\n` +
        `_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`
      );
    }
  },

  {
    command: 'worldfacts',
    aliases: ['geofact', 'randomfact2'],
    category: 'soultools',
    description: 'Returns a random geography/world fact. Usage: worldfacts',
    execute: async ({ reply }) => {
      const facts = [
        'Russia is so wide it spans 11 time zones — you could be waking up in one end while the other end sleeps.',
        'Canada has more lakes than all other countries combined. Most of them have no name.',
        'The Sahara Desert is roughly the same size as the entire United States.',
        'Vatican City is the smallest country in the world at just 0.44 km². You can walk across it in 10 minutes.',
        'Australia is wider than the Moon. The Moon is about 3,474 km in diameter; Australia is ~4,000 km across.',
        'Mount Everest grows about 4mm taller every year due to tectonic plate movement.',
        'The Dead Sea is so salty that you can\'t sink in it even if you try.',
        'There are more trees on Earth than stars in the Milky Way galaxy.',
        'The Amazon River accounts for about 20% of all freshwater that flows into the world\'s oceans.',
        'Indonesia consists of over 17,000 islands — yet only about 6,000 are inhabited.',
        'The Pacific Ocean covers more area than all of Earth\'s landmasses combined.',
        'Iceland has no mosquitoes. Not a single one. Scientists still debate exactly why.',
        'Monaco has the highest population density of any country — about 19,000 people per km².',
        'The longest river in the world is disputed — the Nile (6,650 km) and Amazon (6,400 km) are neck and neck depending on measurement.',
        'Antarctica is technically a desert — it receives less than 200mm of precipitation per year.'
      ];
      const fact = facts[Math.floor(Math.random() * facts.length)];
      reply(`🌍 *WORLD FACT*\n\n${fact}\n\nKnowledge is power. Store it. 😤\n\n_𝗖𝗿𝗶𝘁𝘁𝗶𝘅 𝗠𝗗_`);
    }
  },


];
