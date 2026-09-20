// src/firebase/firestoreService.js
// Modular Firestore query helpers

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, setDoc,
} from 'firebase/firestore';
import { db } from './config';
import { DEFAULT_PRICE_MATRIX } from '../data/repairPrices';

// ─── Collection References ───────────────────────────────────────────────────
const ACCESSORIES_COL    = 'accessories';
const TICKETS_COL        = 'repair_tickets';
const INQUIRIES_COL      = 'inquiries';
const STORE_SETTINGS_COL = 'store_settings';
const STORE_SETTINGS_DOC = 'main'; // singleton document ID
const PRICING_COL        = 'pricing';
const PRICING_DOC        = 'matrix'; // singleton document ID

// ─── Accessories ─────────────────────────────────────────────────────────────

/** Fetch all accessories, optionally filtered by category */
export async function getAccessories(category = null) {
  const colRef = collection(db, ACCESSORIES_COL);
  const q = category && category !== 'All'
    ? query(colRef, where('category', '==', category), orderBy('name'))
    : query(colRef, orderBy('name'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Real-time listener for accessories */
export function subscribeToAccessories(category, callback) {
  const colRef = collection(db, ACCESSORIES_COL);
  const q = category && category !== 'All'
    ? query(colRef, where('category', '==', category), orderBy('name'))
    : query(colRef, orderBy('name'));

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error('[Firestore] subscribeToAccessories error:', err.message);
    callback([]);
  });
}

/** Create or update an accessory */
export async function upsertAccessory(data, id = null) {
  if (id) {
    const ref = doc(db, ACCESSORIES_COL, id);
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    return id;
  }
  const ref = await addDoc(collection(db, ACCESSORIES_COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Delete an accessory */
export async function deleteAccessory(id) {
  await deleteDoc(doc(db, ACCESSORIES_COL, id));
}

// ─── Repair Tickets ───────────────────────────────────────────────────────────

/** One-time fetch of a single ticket by ticketId field */
export async function getRepairTicket(ticketId) {
  const formatted = ticketId?.trim().toUpperCase();
  const colRef = collection(db, TICKETS_COL);
  const q      = query(colRef, where('ticketId', '==', formatted));
  const snap   = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/** Real-time listener for a single ticket by ticketId field */
export function subscribeToTicket(ticketId, callback) {
  const formatted = ticketId?.trim().toUpperCase();
  const colRef = collection(db, TICKETS_COL);
  const q      = query(colRef, where('ticketId', '==', formatted));
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null);
      return;
    }
    const d = snap.docs[0];
    callback({ id: d.id, ...d.data() });
  }, (err) => {
    console.error('[Firestore] subscribeToTicket error:', err.message);
    callback(null);
  });
}

/** Fetch all tickets (admin) */
export async function getAllTickets() {
  const colRef = collection(db, TICKETS_COL);
  const q      = query(colRef, orderBy('createdAt', 'desc'));
  const snap   = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Real-time listener for all tickets (admin dashboard) */
export function subscribeToAllTickets(callback) {
  const colRef = collection(db, TICKETS_COL);
  const q      = query(colRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error('[Firestore] subscribeToAllTickets error:', err.message);
    callback([]);
  });
}

/** Update a repair ticket status */
export async function updateTicketStatus(id, status) {
  const ref = doc(db, TICKETS_COL, id);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

/** Create a new repair ticket */
export async function createRepairTicket(data) {
  const ticketId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
  const ref = await addDoc(collection(db, TICKETS_COL), {
    ...data,
    ticketId,
    status:    'Received',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: ref.id, ticketId };
}

/** Update any fields on a ticket (admin) */
export async function updateTicket(id, data) {
  const ref = doc(db, TICKETS_COL, id);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

/** Delete a ticket (admin) */
export async function deleteTicket(id) {
  await deleteDoc(doc(db, TICKETS_COL, id));
}

// ─── Inquiries ────────────────────────────────────────────────────────────────

/** Save an inquiry submitted from the accessories page */
export async function createInquiry(data) {
  const ref = await addDoc(collection(db, INQUIRIES_COL), {
    ...data,
    timestamp: serverTimestamp(),
  });
  return ref.id;
}

/** Fetch all inquiries (admin) */
export async function getAllInquiries() {
  const colRef = collection(db, INQUIRIES_COL);
  const q      = query(colRef, orderBy('timestamp', 'desc'));
  const snap   = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Store Settings ───────────────────────────────────────────────────────────

/** Fetch singleton store settings document */
export async function getStoreSettings() {
  const ref  = doc(db, STORE_SETTINGS_COL, STORE_SETTINGS_DOC);
  const snap = await getDoc(ref);
  if (!snap.exists()) return getDefaultStoreSettings();
  return { ...getDefaultStoreSettings(), id: snap.id, ...snap.data() };
}

/** Real-time listener for store settings — falls back to defaults for anything unset */
export function subscribeToStoreSettings(callback) {
  const ref = doc(db, STORE_SETTINGS_COL, STORE_SETTINGS_DOC);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? { ...getDefaultStoreSettings(), id: snap.id, ...snap.data() } : getDefaultStoreSettings());
  }, (err) => {
    console.error('[Firestore] subscribeToStoreSettings error:', err.message);
    callback(getDefaultStoreSettings());
  });
}

/** Update store settings (admin) */
export async function updateStoreSettings(data) {
  const ref = doc(db, STORE_SETTINGS_COL, STORE_SETTINGS_DOC);
  await setDoc(ref, data, { merge: true });
}

// ─── Repair Pricing Matrix ──────────────────────────────────────────────────

/** Merge Firestore pricing data over the seed defaults, per brand/issue, so partial edits are safe */
function mergePricingMatrix(firestoreData) {
  const merged = {};
  for (const brandId of Object.keys(DEFAULT_PRICE_MATRIX)) {
    merged[brandId] = { ...DEFAULT_PRICE_MATRIX[brandId], ...(firestoreData?.[brandId] || {}) };
  }
  return merged;
}

/** Fetch the live repair pricing matrix (falls back to seed defaults for anything unset) */
export async function getPricingMatrix() {
  const ref  = doc(db, PRICING_COL, PRICING_DOC);
  const snap = await getDoc(ref);
  return mergePricingMatrix(snap.exists() ? snap.data() : null);
}

/** Real-time listener for the repair pricing matrix */
export function subscribeToPricingMatrix(callback) {
  const ref = doc(db, PRICING_COL, PRICING_DOC);
  return onSnapshot(ref, (snap) => {
    callback(mergePricingMatrix(snap.exists() ? snap.data() : null));
  }, (err) => {
    console.error('[Firestore] subscribeToPricingMatrix error:', err.message);
    callback(mergePricingMatrix(null));
  });
}

/** Update repair pricing for one brand (admin) — merges into the shared pricing/matrix doc */
export async function updateBrandPricing(brandId, issuePrices) {
  const ref = doc(db, PRICING_COL, PRICING_DOC);
  await setDoc(ref, { [brandId]: issuePrices }, { merge: true });
}

/** Real shop defaults, used until the store_settings/main document is created in Firestore */
export function getDefaultStoreSettings() {
  return {
    shopName:        'Mobile Service Point',
    ownerName:       'Mohd Kashif',
    address:         'Shop No. 63, Community Center, Block A, New Friends Colony, New Delhi, Delhi 110025',
    contactWhatsApp: import.meta.env.VITE_WHATSAPP_NUMBER || '+91 75299 12815',
    phone:           import.meta.env.VITE_STORE_PHONE     || '+91 75299 12815',
    googleMapsUrl:   'https://maps.app.goo.gl/vTnFPKTpxnADYtz36',
    warrantyDays:    90,
    openingHours: {
      'Mon – Sat': '10:00 AM – 8:00 PM',
      'Sunday':    '11:00 AM – 6:00 PM',
    },
  };
}
