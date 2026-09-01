import { create } from 'zustand';
import { KEYS, getJson, setJson } from './storage';
import { generateId } from '../utils/ids';
import { deleteImage } from '../utils/imageOptimizer';
import { parseSalesImportPayload } from '../utils/importExport';

const todayISO = () => new Date().toISOString().slice(0, 10);

const useSalesStore = create((set, get) => ({
  hydrated: false,
  sales: [],
  selectedDate: todayISO(),

  hydrate: async () => {
    const [sales, selectedDate] = await Promise.all([
      getJson(KEYS.sales, []),
      getJson(KEYS.selectedDate, todayISO()),
    ]);

    set({
      sales: Array.isArray(sales) ? sales : [],
      selectedDate: selectedDate || todayISO(),
      hydrated: true,
    });
  },

  persistSales: async (sales) => {
    await setJson(KEYS.sales, sales);
  },

  setSelectedDate: async (date) => {
    const iso = date || todayISO();
    set({ selectedDate: iso });
    await setJson(KEYS.selectedDate, iso);
  },

  moveSelectedDate: async (offset) => {
    const current = new Date(`${get().selectedDate}T12:00:00`);
    current.setDate(current.getDate() + offset);
    await get().setSelectedDate(current.toISOString().slice(0, 10));
  },

  setSales: async (sales) => {
    set({ sales });
    await get().persistSales(sales);
  },

  createSale: async ({ name, price, imageUri }) => {
    const sale = {
      _id: generateId('sale'),
      name: name.trim(),
      price: Number(price),
      imageUri: imageUri || null,
      createdAt: new Date().toISOString(),
    };

    const sales = [sale, ...get().sales];
    set({ sales });
    await get().persistSales(sales);
    return sale;
  },

  updateSale: async (id, { name, price, imageUri, removeImage }) => {
    const existing = get().sales.find((sale) => sale._id === id);
    if (!existing) return null;

    let nextImageUri = existing.imageUri;
    if (removeImage) {
      if (nextImageUri) {
        await deleteImage(nextImageUri).catch(() => {});
      }
      nextImageUri = null;
    } else if (imageUri) {
      if (nextImageUri) {
        await deleteImage(nextImageUri).catch(() => {});
      }
      nextImageUri = imageUri;
    }

    const updated = {
      ...existing,
      name: name.trim(),
      price: Number(price),
      imageUri: nextImageUri,
      updatedAt: new Date().toISOString(),
    };

    const sales = get().sales.map((sale) => (sale._id === id ? updated : sale));
    set({ sales });
    await get().persistSales(sales);
    return updated;
  },

  deleteSale: async (id) => {
    const sale = get().sales.find((item) => item._id === id);
    if (sale?.imageUri) {
      await deleteImage(sale.imageUri).catch(() => {});
    }

    const sales = get().sales.filter((item) => item._id !== id);
    set({ sales });
    await get().persistSales(sales);
  },

  importSales: async (payload) => {
    const sales = await parseSalesImportPayload(payload);
    await get().setSales(sales);
    return sales;
  },
}));

export default useSalesStore;
