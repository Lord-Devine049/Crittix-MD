/*
 * ============================================
 * PREMIUM EMOJI MAP
 * Add a real custom_emoji_id here and every
 * message using px('key') upgrades automatically.
 * Leave id: null to keep the plain fallback emoji.
 *
 * NOTE: Inline keyboard BUTTON text can never use
 * custom emoji (Telegram platform limit — buttons
 * don't go through parse_mode). This file only
 * affects emoji inside message text/captions.
 * ============================================
 */
const EMOJI = {
  // brand accents
  heart:      { fallback: '💜', id: '5400220783949657002' },
  heartBlack: { fallback: '🖤', id: '5400130443607551791' },

  // menu sections
  shield:     { fallback: '🛡️', id: '6122834518807157701' },   // Admin
  bolt:       { fallback: '⚡',  id: '6165913289894140111' },   // Help
  scroll:     { fallback: '📜', id: '6323096332579899122' },   // Terms & Conditions
  book:       { fallback: '📖', id: '5974560986344983722' },   // Help header / Usage lines
  tools:      { fallback: '🛠️', id: '5462911117423384478' },   // Creator field
  back:       { fallback: '🔙', id: '5253997076169115797' },   // Back (text only, not buttons)
  check:      { fallback: '✅', id: '6122664859009031604' },   // Understood / success (text only)
  cross:      { fallback: '❌', id: '6122712498786276439' },   // errors / missing / still-missing

  // stats fields
  user:       { fallback: '👤', id: '5350778980158956492' },   // single user
  robot:      { fallback: '🤖', id: '6300683629861280494' },   // bot count
  clock:      { fallback: '⏰', id: '5319272710688226013' },   // uptime / expires

  // pairing instructions step badges
  step1:      { fallback: '1️⃣', id: '6123022479460932232' },
  step2:      { fallback: '2️⃣', id: '6122912996449591253' },
  step3:      { fallback: '3️⃣', id: '6122763385558801623' },
  step4:      { fallback: '4️⃣', id: '5188675391010645868' },
  step5:      { fallback: '5️⃣', id: '5776027703635349399' },

  // ── newly added — still plain, fill these in ──
  pencil:     { fallback: '📝', id: '5253451288905006321' },   // "Example:" lines
  hourglass:  { fallback: '⏳', id: '5296482716567495148' },   // "Starting bot..."
  hash:       { fallback: '🔢', id: '5226929552319594190' },   // pairing "Code:" label
  point:      { fallback: '☝️', id: '5193084595846795612' },   // "Tap to copy"
  mobile:     { fallback: '📱', id: '5334998226636390258' },   // "Instructions:" header
  users:      { fallback: '👥', id: '5244933196230972438' },   // "Total users" (plural, stats)
  banned:     { fallback: '🚫', id: '5776064103483184336' },   // "Banned users"
  chart:      { fallback: '📊', id: '5028746137645876535' },   // "Bot Statistics" header
  stop:       { fallback: '⛔', id: '5852487725051023314' },   // banned/blocked notices
  warning:    { fallback: '⚠️', id: '6136702555889084621' },   // warnings
  wave:       { fallback: '👋', id: '5440431182602842059' },   // greetings
  refresh:    { fallback: '🔄', id: '5452002073606384268' },   // reconnecting / retry
  online:     { fallback: '🟢', id: '5832572966721818453' },   // status: connected
  offline:    { fallback: '🔴', id: '5372930759319379174' },   // status: disconnected
  lock:       { fallback: '🔒', id: '5296369303661067030' },   // channel join list
  siren:      { fallback: '🚨', id: '5427347926240221093' },   // join required header
};

/**
 * px('key') → returns the emoji ready to drop into an HTML (parse_mode: 'HTML') string.
 * If a real custom_emoji_id is set, wraps it in <tg-emoji>; otherwise returns the plain fallback.
 * NOTE: the message must be sent with { parse_mode: 'HTML' } for the tag to render.
 * NOTE: never use px() inside inline_keyboard button "text" fields — it will not render there.
 */
function px(key) {
  const e = EMOJI[key];
  if (!e) return '';
  if (!e.id) return e.fallback;
  return `<tg-emoji emoji-id="${e.id}">${e.fallback}</tg-emoji>`;
}

module.exports = { EMOJI, px };
