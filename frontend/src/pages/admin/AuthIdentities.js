import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { authIdentityActions } from "../../actions/resourceActions"
import PageHeader from "../../components/Layout/PageHeader"
import Loader from "../../components/Layout/Loader"
import ErrorMessage from "../../components/Layout/ErrorMessage"
import DataTable from "../../components/Table/DataTable"
import { formatDate } from "../../utils/formatDate"

const AuthIdentities = () => {
    const dispatch = useDispatch()
    const { items: authIdentities, count, loading, error } = useSelector((state) => state.authIdentities)

    useEffect(() => {
        dispatch(authIdentityActions.fetchAll())
    }, [dispatch])

    const rows = authIdentities.map((identity) => ({
        id: identity._id,
        customer: identity.user ? identity.user.firstName + " " + identity.user.lastName : "—",
        email: identity.user?.email || "—",
        provider: identity.provider,
        providerEmail: identity.providerEmail || "—",
        linkedAt: formatDate(identity.linkedAt)
    }))

    const columns = [
        { key: "customer", label: "Customer" },
        { key: "email", label: "Account email" },
        { key: "provider", label: "Provider" },
        { key: "providerEmail", label: "Provider email" },
        { key: "linkedAt", label: "Linked" }
    ]

    return (
        <div className="admin-page">
            <PageHeader title="Auth identities" description={count + " linked sign-in provider(s)"} />

            <ErrorMessage message={error} />

            {loading ? (
                <Loader />
            ) : (
                <DataTable columns={columns} rows={rows} emptyMessage="No linked providers yet" />
            )}
        </div>
    )
}

export default AuthIdentities
