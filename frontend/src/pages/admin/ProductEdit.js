import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { productActions, categoryActions, brandActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import ProductForm from "../../components/Product/ProductForm"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"

const ProductEdit = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { item: product, loading, saving, error } = useSelector((state) => state.products)
    const { items: categories } = useSelector((state) => state.categories)
    const { items: brands } = useSelector((state) => state.brands)

    useEffect(() => {
        dispatch(productActions.fetchOne(id))
        dispatch(categoryActions.fetchAll())
        dispatch(brandActions.fetchAll())
    }, [dispatch, id])

    const handleSubmit = async (values) => {
        const updatedProduct = await dispatch(productActions.update(id, values))

        if (updatedProduct) {
            navigate("/admin/products")
        }
    }

    if (loading && !product) {
        return <Loader />
    }

    if (!product) {
        return (
            <div className="admin-page">
                <PageHeader title="Edit product" />
                <ErrorMessage message={error || "Product not found"} />
            </div>
        )
    }

    const initialValues = {
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock: product.stock ?? 0,
        category: product.category?._id || product.category || "",
        brand: product.brand?._id || product.brand || "",
        isActive: product.isActive !== false,
        imagePath: product.images?.[0]?.imagePath || ""
    }

    return (
        <div className="admin-page">
            <PageHeader title="Edit product" description={product.name} />

            <ProductForm
                initialValues={initialValues}
                categories={categories}
                brands={brands}
                onSubmit={handleSubmit}
                saving={saving}
                error={error}
                submitLabel="Save changes"
            />
        </div>
    )
}

export default ProductEdit
