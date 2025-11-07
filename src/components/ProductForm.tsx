import type { ChangeEvent, FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'

export type ProductFormValues = {
  title: string
  description: string
  price: number
  category: string
  imageUrl: string
}

type ProductFormProps = {
  initialValues?: Partial<ProductFormValues>
  submitLabel: string
  loading?: boolean
  onSubmit: (values: ProductFormValues) => void | Promise<void>
  onCancel?: () => void
}

const defaultValues: ProductFormValues = {
  title: '',
  description: '',
  price: 0,
  category: '',
  imageUrl: '',
}

const ProductForm = ({
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const [values, setValues] = useState<ProductFormValues>({
    ...defaultValues,
    ...initialValues,
  })
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValues })
  }, [initialValues])

  const handleChange =
    (field: keyof ProductFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setValues((prev) => ({
        ...prev,
        [field]: field === 'price' ? Number(value) || 0 : value,
      }))
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category.trim(),
      imageUrl: values.imageUrl.trim(),
      price: values.price,
    }
    if (!trimmed.title || !trimmed.description || !trimmed.category) {
      setError('Заполните обязательные поля')
      return
    }
    if (Number.isNaN(trimmed.price) || trimmed.price <= 0) {
      setError('Цена должна быть положительной')
      return
    }
    setError(null)
    await onSubmit(trimmed)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Выберите файл изображения')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5 МБ')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setValues((prev) => ({ ...prev, imageUrl: reader.result as string }))
        setError(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setValues((prev) => ({ ...prev, imageUrl: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit} noValidate>
      <label className="form-field">
        <span>Название*</span>
        <input type="text" value={values.title} onChange={handleChange('title')} required />
      </label>

      <label className="form-field">
        <span>Описание*</span>
        <textarea
          value={values.description}
          onChange={handleChange('description')}
          minLength={20}
          required
        />
      </label>

      <div className="form-grid">
        <label className="form-field">
          <span>Цена*</span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={values.price ? String(values.price) : ''}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, price: Number(event.target.value) || 0 }))
            }
            required
          />
        </label>
        <label className="form-field">
          <span>Категория*</span>
          <input type="text" value={values.category} onChange={handleChange('category')} required />
        </label>
      </div>

      <div className="image-input">
        <label className="form-field">
          <span>URL изображения</span>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={values.imageUrl.startsWith('data:') ? '' : values.imageUrl}
            onChange={handleChange('imageUrl')}
          />
        </label>
        <div className="image-input__actions">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            Загрузить с компьютера
          </button>
          {values.imageUrl && (
            <button type="button" className="ghost-btn ghost-btn--danger" onClick={clearImage}>
              Очистить изображение
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={handleFileChange}
          />
        </div>
        {values.imageUrl && (
          <div className="image-preview">
            <img src={values.imageUrl} alt="Предпросмотр изображения" />
          </div>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="ghost-btn" onClick={onCancel} disabled={loading}>
            Отменить
          </button>
        )}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Сохраняем…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default ProductForm
