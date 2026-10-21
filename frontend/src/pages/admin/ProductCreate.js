import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { productActions, categoryActions, brandActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import ProductForm from "../../components/Product/ProductForm"

const ProductCreate = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { saving, error } = useSelector((state) => state.products)
    const { items: categories } = useSelector((state) => state.categories)
    const { items: brands } = useSelector((state) => state.brands)

    useEffect(() => {
        dispatch(categoryActions.fetchAll())
        dispatch(brandActions.fetchAll())
    }, [dispatch])

    const handleSubmit = async (values) => {
        const product = await dispatch(productActions.create(values))

        if (product) {
            navigate("/admin/products")
        }
    }

    return (
        <div className="admin-page">
            <PageHeader title="New product" description="Add a product to the catalog" />

            <ProductForm
                categories={categories}
                brands={brands}
                onSubmit={handleSubmit}
                saving={saving}
                error={error}
                submitLabel="Create product"
            />
        </div>
    )
}

export default ProductCreate
