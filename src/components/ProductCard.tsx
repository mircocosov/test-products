import type { KeyboardEventHandler } from 'react'
import type { Product } from '../types/product'

type ProductCardProps = {
  product: Product
  liked: boolean
  onToggleLike: () => void
  onDelete: () => void
  onOpen: () => void
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="icon" focusable="false">
    <path
      d="M12 20c-4-3.5-7.5-6.5-7.5-10A4.5 4.5 0 0 1 9 5c1.8 0 3 1.1 3 1.1S13.2 5 15 5a4.5 4.5 0 0 1 4.5 5c0 3.5-3.5 6.5-7.5 10Z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="icon">
    <g transform="translate(0 -0.6)">
      <path
        d="M4 7h16M9 7V5h6v2m4 0v11.5A2.5 2.5 0 0 1 16.5 21h-9A2.5 2.5 0 0 1 5 18.5V7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
)

const ProductCard = ({ product, liked, onToggleLike, onDelete, onOpen }: ProductCardProps) => {
  const handleCardClick = () => onOpen()
  const handleKeyUp: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen()
    }
  }

  return (
    <article className="product-card" role="button" tabIndex={0} onClick={handleCardClick} onKeyUp={handleKeyUp}>
      <div className="product-card__image-wrapper">
        <img src={product.thumbnail} alt={product.title} loading="lazy" className="product-card__image" />
        <div className="product-card__controls">
          <button
            type="button"
            className={`icon-button${liked ? ' icon-button--like' : ''}`}
            aria-label={liked ? 'Убрать из избранного' : 'Добавить в избранное'}
            onClick={(event) => {
              event.stopPropagation()
              onToggleLike()
            }}
          >
            <HeartIcon filled={liked} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="Удалить продукт"
            onClick={(event) => {
              event.stopPropagation()
              onDelete()
            }}
          >
            <TrashIcon />
          </button>
        </div>
        {product.isUserCreated && <span className="product-card__badge">NEW</span>}
      </div>
      <div className="product-card__body">
        <div className="product-card__heading">
          <h3>{product.title}</h3>
          <span className="product-card__price">${product.price.toFixed(2)}</span>
        </div>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__meta">
          <span>{product.category}</span>
          {product.rating !== undefined && (
            <span className="product-card__rating">★ {product.rating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
