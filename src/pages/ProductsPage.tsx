import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProductsStore } from '../store/products'

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40]

const ProductsPage = () => {
  const products = useProductsStore((state) => state.products)
  const favoriteIds = useProductsStore((state) => state.favoriteIds)
  const status = useProductsStore((state) => state.status)
  const error = useProductsStore((state) => state.error)
  const fetchProducts = useProductsStore((state) => state.fetchProducts)
  const toggleFavorite = useProductsStore((state) => state.toggleFavorite)
  const removeProduct = useProductsStore((state) => state.removeProduct)

  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const navigate = useNavigate()

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    setPage(1)
  }, [filterMode, search, category, pageSize])

  const searchValue = search.trim().toLowerCase()

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((product) => {
      if (product.category) {
        set.add(product.category)
      }
    })
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b, 'ru'))
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filterMode === 'favorites' && !favoriteIds.has(product.id)) {
        return false
      }
      if (category !== 'all' && product.category !== category) {
        return false
      }
      if (!searchValue) {
        return true
      }
      const haystack = `${product.title} ${product.description}`.toLowerCase()
      return haystack.includes(searchValue)
    })
  }, [products, favoriteIds, filterMode, category, searchValue])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [currentPage])

  const handleDelete = (id: number) => removeProduct(id)
  const handleToggleFavorite = (id: number) => toggleFavorite(id)
  const handleOpen = (id: number) => navigate(`/products/${id}`)

  const showLoader = status === 'loading' && products.length === 0
  const showEmptyState =
    !showLoader &&
    status !== 'error' &&
    filteredProducts.length === 0 &&
    (status === 'ready' || products.length > 0)

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Каталог</p>
          <h1>Продукты</h1>
        </div>
        <div className="stats">
          <span>Всего: {products.length}</span>
          <span>Избранные: {favoriteIds.size}</span>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filters-bar__cell filters-bar__cell--toggle filters-bar__cell--full">
          <span className="filters-bar__label">Отбор</span>
          <div className="segmented">
            <button
              type="button"
              className={
                filterMode === 'all' ? 'segmented__btn segmented__btn--active' : 'segmented__btn'
              }
              onClick={() => setFilterMode('all')}
            >
              Все
            </button>
            <button
              type="button"
              className={
                filterMode === 'favorites'
                  ? 'segmented__btn segmented__btn--active'
                  : 'segmented__btn'
              }
              onClick={() => setFilterMode('favorites')}
            >
              Избранные
            </button>
          </div>
        </div>

        <label className="filters-bar__cell filters-bar__cell--half">
          <span className="filters-bar__label">Категория</span>
          <select
            className="select-input"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">Все категории</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="filters-bar__cell filters-bar__cell--half">
          <span className="filters-bar__label">Карточек</span>
          <select
            className="select-input"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} на странице
              </option>
            ))}
          </select>
        </label>

        <label className="filters-bar__cell filters-bar__cell--full">
          <span className="filters-bar__label">Поиск</span>
          <input
            type="search"
            className="text-input"
            placeholder="Введите запрос…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {showLoader && <div className="state-card">Загружаем продукты…</div>}

      {status === 'error' && !showLoader && (
        <div className="state-card state-card--error">
          <p>{error ?? 'Не удалось загрузить список'}</p>
          <button type="button" className="primary-btn" onClick={() => fetchProducts()}>
            Попробовать ещё
          </button>
        </div>
      )}

      {showEmptyState && (
        <div className="state-card">
          Нет данных для отображения. Попробуйте изменить фильтры.
        </div>
      )}

      <div className="products-grid">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            liked={favoriteIds.has(product.id)}
            onToggleLike={() => handleToggleFavorite(product.id)}
            onDelete={() => handleDelete(product.id)}
            onOpen={() => handleOpen(product.id)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="ghost-btn"
            disabled={currentPage === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Назад
          </button>
          <span>
            Страница {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            className="ghost-btn"
            disabled={currentPage === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            Вперёд
          </button>
        </div>
      )}
    </section>
  )
}

export default ProductsPage
