import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProductsStore } from '../store/products'

const ProductDetailPage = () => {
  const { id } = useParams()
  const numericId = Number(id)
  const products = useProductsStore((state) => state.products)
  const product = products.find((item) => item.id === numericId)
  const status = useProductsStore((state) => state.status)
  const error = useProductsStore((state) => state.error)
  const fetchProducts = useProductsStore((state) => state.fetchProducts)
  const toggleFavorite = useProductsStore((state) => state.toggleFavorite)
  const favoriteIds = useProductsStore((state) => state.favoriteIds)
  const removeProduct = useProductsStore((state) => state.removeProduct)

  const navigate = useNavigate()

  useEffect(() => {
    if (status === 'idle') {
      void fetchProducts()
    }
  }, [status, fetchProducts])

  if (!product && status === 'loading') {
    return <div className="state-card">Загружаем продукт…</div>
  }

  if (!product && status === 'error') {
    return (
      <div className="state-card state-card--error">
        <p>{error ?? 'Не удалось загрузить продукт'}</p>
        <div className="detail-actions">
          <button type="button" className="primary-btn" onClick={() => fetchProducts()}>
            Повторить запрос
          </button>
          <Link className="ghost-btn" to="/products">
            Назад к списку
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="state-card">
        <p>Продукт не найден или уже удалён.</p>
        <Link className="primary-btn" to="/products">
          Назад к списку
        </Link>
      </div>
    )
  }

  const handleRemove = () => {
    removeProduct(product.id)
    navigate('/products')
  }

  const liked = favoriteIds.has(product.id)

  return (
    <section className="page product-detail">
      <div className="detail-actions detail-actions--top">
        <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>
          Назад
        </button>
        <Link className="ghost-btn" to={`/products/${product.id}/edit`}>
          Редактировать
        </Link>
      </div>

      <div className="product-detail__hero">
        <img src={product.thumbnail} alt={product.title} className="product-detail__image" />
        <div>
          <p className="eyebrow">#{product.id}</p>
          <h1>{product.title}</h1>
          <p className="product-detail__description">{product.description}</p>
          <div className="product-detail__meta">
            <span className="product-card__price">${product.price.toFixed(2)}</span>
            <span className="badge">{product.category}</span>
            {product.brand && <span className="badge">{product.brand}</span>}
            {product.rating !== undefined && (
              <span className="badge">★ {product.rating.toFixed(1)}</span>
            )}
          </div>
          <div className="detail-actions">
            <button
              type="button"
              className={`primary-btn${liked ? ' primary-btn--accent' : ''}`}
              onClick={() => toggleFavorite(product.id)}
            >
              {liked ? 'В избранном' : 'Добавить в избранное'}
            </button>
            <Link className="ghost-btn" to={`/products/${product.id}/edit`}>
              Изменить
            </Link>
            <button type="button" className="ghost-btn ghost-btn--danger" onClick={handleRemove}>
              Удалить
            </button>
          </div>
        </div>
      </div>

      {product.images.length > 1 && (
        <div className="detail-gallery">
          {product.images.map((src, index) => (
            <img key={`${src}-${index}`} src={src} alt="" className="detail-gallery__image" />
          ))}
        </div>
      )}
    </section>
  )
}

export default ProductDetailPage
