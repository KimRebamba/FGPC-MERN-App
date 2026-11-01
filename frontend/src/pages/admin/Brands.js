import SimpleCatalogPage from "../../components/Catalog/SimpleCatalogPage"
import { brandActions } from "../../actions/resourceActions"

const Brands = () => {
    return (
        <SimpleCatalogPage
            title="Brands"
            description="Manufacturers and labels carried by the store"
            stateKey="brands"
            actions={brandActions}
            imageField="logoPath"
            uploadField="logo"
            imageLabel="Brand logo"
            singularLabel="brand"
        />
    )
}

export default Brands
