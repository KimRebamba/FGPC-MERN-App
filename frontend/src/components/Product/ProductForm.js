import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import FormField from "../Form/FormField"
import ErrorMessage from "../Layout/ErrorMessage"

const emptyProduct = {
    name: "",
    description: "",
    price: "",
    stock: 0,
    category: "",
    brand: "",
    isActive: true
}

const productValidationSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .min(2, "Product name must be at least 2 characters")
        .max(120, "Product name is too long")
        .required("Product name is required"),
    description: Yup.string()
        .trim()
        .min(5, "Description must be at least 5 characters")
        .required("Product description is required"),
    price: Yup.number()
        .typeError("Price must be a valid number")
        .positive("Price must be greater than zero")
        .required("Price is required"),
    stock: Yup.number()
        .typeError("Stock must be a valid number")
        .integer("Stock must be a whole number")
        .min(0, "Stock cannot be negative")
        .required("Stock quantity is required"),
    category: Yup.string()
        .required("Please select a category"),
    brand: Yup.string().nullable(),
    isActive: Yup.boolean()
})

const ProductForm = ({
    initialValues = emptyProduct,
    existingImages = [],
    categories = [],
    brands = [],
    onSubmit,
    saving,
    error,
    submitLabel = "Save product"
}) => {
    const [files, setFiles] = useState([])

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: productValidationSchema,
        onSubmit: (values) => {
            const formData = new FormData()

            formData.append("name", values.name)
            formData.append("description", values.description)
            formData.append("price", values.price)
            formData.append("stock", Number(values.stock))
            formData.append("category", values.category)
            formData.append("brand", values.brand || "")
            formData.append("isActive", values.isActive ? "true" : "false")

            files.forEach((file) => formData.append("images", file))

            onSubmit(formData)
        }
    })

    const categoryOptions = categories.map((category) => ({
        value: category._id,
        label: category.name
    }))

    const brandOptions = brands.map((brand) => ({
        value: brand._id,
        label: brand.name
    }))

    const handleFiles = (event) => {
        setFiles(Array.from(event.target.files))
    }

    return (
        <form className="admin-form" onSubmit={formik.handleSubmit} noValidate>
            <ErrorMessage message={error} />

            <FormField
                label="Product Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && formik.errors.name}
                placeholder="e.g. LS2 Rapid III Helmet"
                required
            />

            <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && formik.errors.description}
                placeholder="Enter detailed specifications, safety certifications, and materials..."
                required
            />

            <FormField
                label="Price (PHP)"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && formik.errors.price}
                placeholder="0.00"
                required
            />

            <FormField
                label="Stock Quantity"
                name="stock"
                type="number"
                value={formik.values.stock}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.stock && formik.errors.stock}
                placeholder="0"
                required
            />

            <FormField
                label="Category"
                name="category"
                type="select"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && formik.errors.category}
                options={categoryOptions}
                required
            />

            <FormField
                label="Brand"
                name="brand"
                type="select"
                value={formik.values.brand}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.brand && formik.errors.brand}
                options={brandOptions}
            />

            {existingImages.length > 0 && (
                <div className="form-field">
                    <p className="form-label" style={{ fontSize: "15px" }}>Current images</p>
                    <ul className="image-list">
                        {existingImages.map((image) => (
                            <li key={image} className="image-list-item">{image}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="form-field">
                <label htmlFor="images" className="form-label" style={{ fontSize: "15px" }}>Product images (up to 5)</label>
                <input
                    id="images"
                    name="images"
                    type="file"
                    className="form-input"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                />
                {files.length > 0 && <p className="form-hint">{files.length} file(s) selected</p>}
            </div>

            <FormField
                label="Active in store (visible to customers)"
                name="isActive"
                type="checkbox"
                value={formik.values.isActive}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
            />

            <button type="submit" className="primary-button" disabled={saving} style={{ marginTop: "12px", padding: "12px 28px", fontSize: "15px", fontWeight: 700 }}>
                {saving ? "Saving..." : submitLabel}
            </button>
        </form>
    )
}

export default ProductForm
