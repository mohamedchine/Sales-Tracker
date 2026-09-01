import { create } from 'zustand';
import { KEYS, getJson, setJson } from '../utils/storage';
import { generateId } from '../utils/ids';
import { deleteImage } from '../utils/imageOptimizer';
import { parseImportPayload } from '../utils/importExport';

const useDataStore = create((set, get) => ({
  hydrated: false,
  categories: [],
  products: [],

  hydrate: async () => {
    const [categories, products] = await Promise.all([
      getJson(KEYS.categories, []),
      getJson(KEYS.products, []),
    ]);
    set({ categories, products, hydrated: true });
  },

  persistCategories: async (categories) => {
    await setJson(KEYS.categories, categories);
  },

  persistProducts: async (products) => {
    await setJson(KEYS.products, products);
  },

  setAllData: async (categories, products) => {
    set({ categories, products });
    await Promise.all([
      get().persistCategories(categories),
      get().persistProducts(products),
    ]);
  },

  importData: async (payload) => {
    const { categories, products } = await parseImportPayload(payload);
    await get().setAllData(categories, products);
    return { categories, products };
  },

  createCategory: async (name) => {
    const item = { _id: generateId('cat'), name: name.trim() };
    const categories = [item, ...get().categories];
    set({ categories });
    await get().persistCategories(categories);
    return item;
  },

  updateCategory: async (id, name) => {
    const trimmed = name.trim();
    const categories = get().categories.map((c) =>
      c._id === id ? { ...c, name: trimmed } : c
    );
    const products = get().products.map((p) =>
      p.category && p.category._id === id
        ? { ...p, category: { ...p.category, name: trimmed } }
        : p
    );
    set({ categories, products });
    await get().persistCategories(categories);
    await get().persistProducts(products);
  },

  deleteCategory: async (id) => {
    const categories = get().categories.filter((c) => c._id !== id);
    const products = get().products.map((p) =>
      p.category && p.category._id === id ? { ...p, category: null } : p
    );
    set({ categories, products });
    await get().persistCategories(categories);
    await get().persistProducts(products);
  },

  createProduct: async ({ name, price, categoryName, imageUri, removeImage }) => {
    const id = generateId('prod');
    let category = null;
    if (categoryName) {
      let cat = get().categories.find((c) => c.name === categoryName);
      if (!cat) {
        cat = await get().createCategory(categoryName);
      }
      category = { _id: cat._id, name: cat.name };
    }

    let storedImageUri = null;
    if (imageUri && !removeImage) {
      storedImageUri = imageUri;
    }

    const product = {
      _id: id,
      name: name.trim(),
      price: Number(price),
      category,
      imageUri: storedImageUri,
    };
    const products = [product, ...get().products];
    set({ products });
    await get().persistProducts(products);
    return product;
  },

  updateProduct: async (id, { name, price, categoryName, imageUri: newImageUri, removeImage }) => {
    const existing = get().products.find((p) => p._id === id);
    if (!existing) return null;

    let category = existing.category;
    if (categoryName !== undefined) {
      if (!categoryName) {
        category = null;
      } else {
        let cat = get().categories.find((c) => c.name === categoryName);
        if (!cat) {
          cat = await get().createCategory(categoryName);
        }
        category = { _id: cat._id, name: cat.name };
      }
    }

    let imageUri = existing.imageUri;
    if (removeImage) {
      if (imageUri) {
        await deleteImage(imageUri).catch(() => {});
      }
      imageUri = null;
    } else if (newImageUri) {
      if (imageUri) {
        await deleteImage(imageUri).catch(() => {});
      }
      imageUri = newImageUri;
    }

    const updated = {
      ...existing,
      name: name.trim(),
      price: Number(price),
      category,
      imageUri,
    };
    const products = get().products.map((p) => (p._id === id ? updated : p));
    set({ products });
    await get().persistProducts(products);
    return updated;
  },

  deleteProduct: async (id) => {
    const product = get().products.find((p) => p._id === id);

    if (product?.imageUri) {
      await deleteImage(product.imageUri).catch(() => {});
    }

    const products = get().products.filter((p) => p._id !== id);
    set({ products });
    await get().persistProducts(products);
  },
}));

export default useDataStore;
