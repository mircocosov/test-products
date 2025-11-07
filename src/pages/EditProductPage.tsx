import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductForm, { type ProductFormValues } from '../components/ProductForm'
import { useProductsStore } from '../store/products'

const EditProductPage = () => {
  const { id } = useParams()
  const numericId = Number(id)
  const products = useProductsStore((state) => state.products)
  const product = products.find((item) => item.id === numericId)
  const status = useProductsStore((state) => state.status)
  const error = useProductsStore((state) => state.error)
  const fetchProducts = useProductsStore((state) => state.fetchProducts)
  const updateProduct = useProductsStore((state) => state.updateProduct)

  const [isSaving, setIsSaving] = useState(false)
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

  const initialValues: ProductFormValues = {
    title: product.title,
    description: product.description,
    price: product.price,
    category: product.category,
    imageUrl: product.thumbnail,
  }

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSaving(true)
    try {
      updateProduct(product.id, values)
      navigate(`/products/${product.id}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Редактирование</p>
          <h1>{product.title}</h1>
        </div>
        <div className="detail-actions">
          <Link className="ghost-btn" to={`/products/${product.id}`}>
            К продукту
          </Link>
          <Link className="ghost-btn" to="/products">
            К списку
          </Link>
        </div>
      </div>

      <ProductForm
        initialValues={initialValues}
        submitLabel="Сохранить изменения"
        loading={isSaving}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </section>
  )
}

export default EditProductPage
