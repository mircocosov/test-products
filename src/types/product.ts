export type Product = {
  id: number
  title: string
  description: string
  price: number
  category: string
  brand?: string
  rating?: number
  stock?: number
  thumbnail: string
  images: string[]
  isUserCreated?: boolean
}

export type ProductDraft = {
  title: string
  description: string
  price: number
  category: string
  imageUrl?: string
}

export type ProductUpdate = Partial<Omit<ProductDraft, 'price'>> & {
  price?: number
  imageUrl?: string
}
