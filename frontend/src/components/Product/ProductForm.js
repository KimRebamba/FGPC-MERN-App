import { useState } from "react"
import FormField from "../Form/FormField"
import ErrorMessage from "../Layout/ErrorMessage"

const emptyProduct = {
    name: "",
    description: "",
    price: "",
    stock: 0,
    category: "",
    brand: "",
    isActive: true,
    imagePath: ""
}

const ProductForm = ({ initialValues = emptyProduct, categories, brands, onSubmit, saving, error, submitLabel = "Save product" }) => {
    const [form, setForm] = useState(initialValues)

    const categoryOptions = categories.map((category) => ({
        value: category._id,
        label: category.name
    }))

    const brandOptions = brands.map((brand) => ({
        value: brand._id,
        label: brand.name
    }))

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        onSubmit({
            name: form.name,
            description: form.description,
            price: form.price,
            stock: Number(form.stock),
            category: form.category,
            brand: form.brand || null,
            isActive: form.isActive,
            images: form.imagePath
                ? [{ imagePath: form.imagePath, isPrimary: true, sortOrder: 0 }]
                : []
        })
    }

    return (
        <form className="admin-form" onSubmit={handleSubmit}>
            <ErrorMessage message={error} />

            <FormField label="Name" name="name" value={form.name} onChange={handleChange} required />

            <FormField label="Description" name="description" type="textarea" value={form.description} onChange={handleChange} />

            <FormField label="Price" name="price" type="number" value={form.price} onChange={handleChange} required />

            <FormField label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} />

            <FormField
                label="Category"
                name="category"
                type="select"
                value={form.category}
                onChange={handleChange}
                options={categoryOptions}
                required
            />

            <FormField
                label="Brand"
                name="brand"
                type="select"
                value={form.brand}
                onChange={handleChange}
                options={brandOptions}
            />

            <FormField
                label="Main image path"
                name="imagePath"
                value={form.imagePath}
                onChange={handleChange}
                placeholder="/images/products/keyboard.png"
            />

            <FormField label="Active in store" name="isActive" type="checkbox" value={form.isActive} onChange={handleChange} />

            <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving..." : submitLabel}
            </button>
        </form>
    )
}

export default ProductForm
