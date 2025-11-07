import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProductForm, { type ProductFormValues } from '../components/ProductForm'
import { useProductsStore } from '../store/products'

const CreateProductPage = () => {
  const createProduct = useProductsStore((state) => state.createProduct)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const created = createProduct({
        title: values.title,
        description: values.description,
        price: values.price,
        category: values.category,
        imageUrl: values.imageUrl,
      })
      navigate(`/products/${created.id}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Новая карточка</p>
          <h1>Создание продукта</h1>
        </div>
        <Link to="/products" className="ghost-btn">
          Назад к списку
        </Link>
      </div>

      <ProductForm submitLabel="Создать продукт" loading={isSubmitting} onSubmit={handleSubmit} />
    </section>
  )
}

export default CreateProductPage
