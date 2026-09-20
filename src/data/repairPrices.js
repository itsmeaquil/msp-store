// src/data/repairPrices.js
// Static price matrix: Brand → Model → Issue → { price, turnaround }
// Prices in INR (₹). Update as needed.

export const BRANDS = [
  { id: 'apple',   label: 'Apple',   emoji: '🍎' },
  { id: 'samsung', label: 'Samsung', emoji: '📱' },
  { id: 'xiaomi',  label: 'Xiaomi',  emoji: '🔴' },
  { id: 'oneplus', label: 'OnePlus', emoji: '🟥' },
  { id: 'vivo',    label: 'Vivo',    emoji: '🔵' },
  { id: 'oppo',    label: 'OPPO',    emoji: '🟢' },
  { id: 'realme',  label: 'Realme',  emoji: '⚡' },
  { id: 'other',   label: 'Other',   emoji: '📲' },
];

export const MODELS = {
  apple: [
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
    'iPhone SE (2022)', 'iPhone SE (2020)', 'Other iPhone',
  ],
  samsung: [
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy A55', 'Galaxy A54', 'Galaxy A35', 'Galaxy A34',
    'Galaxy A25', 'Galaxy A24', 'Galaxy A15', 'Galaxy A14',
    'Galaxy M55', 'Galaxy M34', 'Galaxy M14', 'Other Samsung',
  ],
  xiaomi: [
    'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
    'Xiaomi 13 Pro', 'Xiaomi 13',
    'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
    'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12',
    'Redmi 13C', 'Redmi 12', 'POCO X6 Pro', 'POCO X6', 'POCO M6 Pro',
    'Other Xiaomi / Redmi / POCO',
  ],
  oneplus: [
    'OnePlus 12 Pro', 'OnePlus 12', 'OnePlus 11 Pro', 'OnePlus 11',
    'OnePlus Nord 4', 'OnePlus Nord CE 4', 'OnePlus Nord CE 3', 'OnePlus Nord CE 2',
    'OnePlus Nord 3', 'OnePlus 10 Pro', 'OnePlus 10T', 'Other OnePlus',
  ],
  vivo: [
    'Vivo X100 Pro', 'Vivo X100', 'Vivo X90 Pro', 'Vivo V30 Pro', 'Vivo V30',
    'Vivo V29 Pro', 'Vivo V29', 'Vivo V27 Pro', 'Vivo Y100', 'Vivo Y78',
    'Vivo Y56', 'Other Vivo',
  ],
  oppo: [
    'OPPO Find X7 Pro', 'OPPO Find X7', 'OPPO Reno 11 Pro', 'OPPO Reno 11',
    'OPPO Reno 10 Pro', 'OPPO Reno 10', 'OPPO A79', 'OPPO A58', 'OPPO A38',
    'Other OPPO',
  ],
  realme: [
    'Realme GT 6', 'Realme GT 5 Pro', 'Realme 12 Pro+', 'Realme 12 Pro',
    'Realme Narzo 70 Pro', 'Realme Narzo 70', 'Realme C65', 'Realme C55',
    'Other Realme',
  ],
  other: ['Other / Not Listed'],
};

export const ISSUES = [
  { id: 'screen',        label: 'Screen Replacement',  emoji: '🖥️', turnaround: '1-2 hours' },
  { id: 'battery',       label: 'Battery Replacement', emoji: '🔋', turnaround: '30-60 mins' },
  { id: 'charging_port', label: 'Charging Port Repair',emoji: '⚡', turnaround: '1-3 hours' },
  { id: 'water_damage',  label: 'Water Damage Repair', emoji: '💧', turnaround: '1-3 days' },
  { id: 'speaker',       label: 'Speaker / Mic Fix',   emoji: '🔊', turnaround: '1-2 hours' },
  { id: 'back_glass',    label: 'Back Glass Repair',   emoji: '🪟', turnaround: '2-4 hours' },
  { id: 'camera',        label: 'Camera Repair',       emoji: '📷', turnaround: '2-4 hours' },
  { id: 'software',      label: 'Software / Flashing', emoji: '💾', turnaround: '1-2 hours' },
];

// Price matrix: [brandId][issueId] = { min, max }
// Models within same brand tier share similar pricing.
// This is only the SEED/DEFAULT data — the live, admin-editable matrix lives in
// Firestore (`pricing/matrix`, see firestoreService.js) and falls back to these
// values for any brand/issue the admin hasn't customized yet.
export const DEFAULT_PRICE_MATRIX = {
  apple: {
    screen:        { min: 2500, max: 18000 },
    battery:       { min: 1200, max: 3500  },
    charging_port: { min: 800,  max: 2500  },
    water_damage:  { min: 2000, max: 8000  },
    speaker:       { min: 600,  max: 2000  },
    back_glass:    { min: 1500, max: 6000  },
    camera:        { min: 1500, max: 8000  },
    software:      { min: 500,  max: 1500  },
  },
  samsung: {
    screen:        { min: 1800, max: 14000 },
    battery:       { min: 700,  max: 2500  },
    charging_port: { min: 500,  max: 1800  },
    water_damage:  { min: 1500, max: 6000  },
    speaker:       { min: 400,  max: 1500  },
    back_glass:    { min: 800,  max: 4000  },
    camera:        { min: 1000, max: 6000  },
    software:      { min: 400,  max: 1200  },
  },
  xiaomi: {
    screen:        { min: 900,  max: 8000  },
    battery:       { min: 400,  max: 1500  },
    charging_port: { min: 300,  max: 1000  },
    water_damage:  { min: 1000, max: 4000  },
    speaker:       { min: 300,  max: 1000  },
    back_glass:    { min: 500,  max: 2000  },
    camera:        { min: 600,  max: 3000  },
    software:      { min: 300,  max: 800   },
  },
  oneplus: {
    screen:        { min: 1200, max: 10000 },
    battery:       { min: 600,  max: 2000  },
    charging_port: { min: 400,  max: 1500  },
    water_damage:  { min: 1500, max: 5000  },
    speaker:       { min: 400,  max: 1200  },
    back_glass:    { min: 700,  max: 3000  },
    camera:        { min: 800,  max: 4000  },
    software:      { min: 400,  max: 1000  },
  },
  vivo: {
    screen:        { min: 800,  max: 7000  },
    battery:       { min: 400,  max: 1500  },
    charging_port: { min: 300,  max: 1000  },
    water_damage:  { min: 1000, max: 4000  },
    speaker:       { min: 300,  max: 1000  },
    back_glass:    { min: 500,  max: 2000  },
    camera:        { min: 600,  max: 3000  },
    software:      { min: 300,  max: 800   },
  },
  oppo: {
    screen:        { min: 800,  max: 7000  },
    battery:       { min: 400,  max: 1500  },
    charging_port: { min: 300,  max: 1000  },
    water_damage:  { min: 1000, max: 4000  },
    speaker:       { min: 300,  max: 1000  },
    back_glass:    { min: 500,  max: 2000  },
    camera:        { min: 600,  max: 3000  },
    software:      { min: 300,  max: 800   },
  },
  realme: {
    screen:        { min: 700,  max: 6000  },
    battery:       { min: 350,  max: 1200  },
    charging_port: { min: 300,  max: 900   },
    water_damage:  { min: 900,  max: 3500  },
    speaker:       { min: 300,  max: 900   },
    back_glass:    { min: 400,  max: 1500  },
    camera:        { min: 500,  max: 2500  },
    software:      { min: 300,  max: 700   },
  },
  other: {
    screen:        { min: 700,  max: 10000 },
    battery:       { min: 350,  max: 2000  },
    charging_port: { min: 300,  max: 1200  },
    water_damage:  { min: 900,  max: 5000  },
    speaker:       { min: 300,  max: 1200  },
    back_glass:    { min: 400,  max: 2500  },
    camera:        { min: 500,  max: 3500  },
    software:      { min: 300,  max: 1000  },
  },
};

/**
 * Get price estimate for a given brand and issue.
 * @param {string} brandId
 * @param {string} issueId
 * @param {object} [priceMatrix] Live pricing matrix (from Firestore); defaults to the seed data.
 * @returns {{ min: number, max: number, display: string } | null}
 */
export function getPriceEstimate(brandId, issueId, priceMatrix = DEFAULT_PRICE_MATRIX) {
  const matrix = priceMatrix[brandId] || priceMatrix.other;
  const range  = matrix?.[issueId];
  if (!range) return null;
  return {
    ...range,
    display: `₹${range.min.toLocaleString('en-IN')} – ₹${range.max.toLocaleString('en-IN')}`,
  };
}

/**
 * Build a WhatsApp message text from the estimator selection.
 */
export function buildWhatsAppText({ brand, model, issue, priceRange, turnaround, shopName = 'Mobile Service Point' }) {
  return encodeURIComponent(
    `Hi ${shopName}! 👋\n\nI'd like to book a repair:\n` +
    `📱 Device: ${brand} ${model}\n` +
    `🔧 Issue: ${issue}\n` +
    `💰 Estimated Cost: ${priceRange}\n` +
    `⏱️ Expected Turnaround: ${turnaround}\n\n` +
    `Please confirm availability. Thank you!`
  );
}
