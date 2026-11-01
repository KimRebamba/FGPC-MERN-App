import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { cartListActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import { formatDate } from "../../utils/formatDate"
import { formatPrice } from "../../utils/formatPrice"

const Carts = () => {
    const dispatch = useDispatch()
    const { items: carts, count, loading, error } = useSelector((state) => state.carts)

    useEffect(() => {
        dispatch(cartListActions.fetchAll())
    }, [dispatch])

    const rows = carts.map((cart) => {
        const total = cart.items.reduce((sum, item) => {
            return sum + Number(item.product?.price || 0) * item.quantity
        }, 0)

        return {
            id: cart._id,
            customer: cart.user ? cart.user.firstName + " " + cart.user.lastName : "—",
            email: cart.user?.email || "—",
            items: cart.items.length,
            total: formatPrice(total),
            updated: formatDate(cart.updatedAt)
        }
    })

    const columns = [
        { key: "customer", label: "Customer" },
        { key: "email", label: "Email" },
        { key: "items", label: "Items" },
        { key: "total", label: "Cart value" },
        { key: "updated", label: "Last updated" }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Carts" description={count + " open cart(s)"} />

            <ErrorMessage message={error} />

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No carts yet" />
            )}
        </div>
    )
}

export default Carts
