import { create } from 'zustand'
import type { Product, ProductDraft, ProductUpdate } from '../types/product'

const API_URL = 'https://dummyjson.com/products?limit=100'

const placeholderImage = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/300`

const normalizeProduct = (product: any): Product => ({
  id: Number(product.id),
  title: String(product.title ?? 'Без названия'),
  description: String(product.description ?? ''),
  price: Number(product.price) || 0,
  category: product.category ?? 'misc',
  brand: product.brand,
  rating: typeof product.rating === 'number' ? product.rating : undefined,
  stock: typeof product.stock === 'number' ? product.stock : undefined,
  thumbnail: product.thumbnail || placeholderImage(String(product.id)),
  images:
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.thumbnail || placeholderImage(String(product.id))],
})

type ProductsState = {
  products: Product[]
  favoriteIds: Set<number>
  status: 'idle' | 'loading' | 'ready' | 'error'
  error: string | null
  nextCustomId: number
  fetchProducts: () => Promise<void>
  toggleFavorite: (id: number) => void
  removeProduct: (id: number) => void
  createProduct: (draft: ProductDraft) => Product
  updateProduct: (id: number, update: ProductUpdate) => Product | undefined
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  favoriteIds: new Set<number>(),
  status: 'idle',
  error: null,
  nextCustomId: 1000,
  async fetchProducts() {
    if (get().status === 'loading' || get().products.length > 0) {
      return
    }
    set({ status: 'loading', error: null })
    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Не удалось загрузить продукты')
      }
      const payload = await response.json()
      const items = Array.isArray(payload.products) ? payload.products : []
      const normalized = items.map(normalizeProduct)
      const currentMax = get().nextCustomId
      const fetchedMax = normalized.reduce(
        (acc: number, item: Product) => Math.max(acc, item.id),
        currentMax,
      )
      set({
        products: normalized,
        status: 'ready',
        nextCustomId: fetchedMax,
      })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Произошла ошибка',
      })
    }
  },
  toggleFavorite(id) {
    set((state) => {
      const favoriteIds = new Set(state.favoriteIds)
      if (favoriteIds.has(id)) {
        favoriteIds.delete(id)
      } else {
        favoriteIds.add(id)
      }
      return { favoriteIds }
    })
  },
  removeProduct(id) {
    set((state) => {
      const favoriteIds = new Set(state.favoriteIds)
      favoriteIds.delete(id)
      return {
        products: state.products.filter((product) => product.id !== id),
        favoriteIds,
      }
    })
  },
  createProduct(draft) {
    const nextId = get().nextCustomId + 1
    const preparedTitle = draft.title.trim()
    const preparedCategory = draft.category.trim() || 'user'
    const baseImage =
      draft.imageUrl?.trim() || placeholderImage(`${preparedTitle}-${nextId}`)
    const newProduct: Product = {
      id: nextId,
      title: preparedTitle,
      description: draft.description.trim(),
      price: Number(draft.price),
      category: preparedCategory,
      brand: 'Custom product',
      rating: 0,
      stock: 0,
      thumbnail: baseImage,
      images: [baseImage],
      isUserCreated: true,
    }
    set((state) => ({
      products: [newProduct, ...state.products],
      nextCustomId: nextId,
      status: state.status === 'idle' ? 'ready' : state.status,
    }))
    return newProduct
  },
  updateProduct(id, update) {
    const desiredImage = update.imageUrl?.trim()
    let updated: Product | undefined
    set((state) => {
      const products = state.products.map((product) => {
        if (product.id !== id) {
          return product
        }
        updated = {
          ...product,
          title: update.title?.trim() ?? product.title,
          description: update.description?.trim() ?? product.description,
          price: typeof update.price === 'number' ? Number(update.price) : product.price,
          category: update.category?.trim() ?? product.category,
          thumbnail: desiredImage || product.thumbnail,
          images: desiredImage
            ? [desiredImage, ...product.images.filter((img) => img !== desiredImage)]
            : product.images,
        }
        return updated!
      })
      return { products }
    })
    return updated
  },
}))
