import SimpleCatalogPage from "../../components/Catalog/SimpleCatalogPage"
import { categoryActions } from "../../actions/resourceActions"

const Categories = () => {
    return (
        <SimpleCatalogPage
            title="Categories"
            description="Group products for browsing and filters"
            stateKey="categories"
            actions={categoryActions}
            imageField="imagePath"
            imageLabel="Image path"
            singularLabel="category"
        />
    )
}

export default Categories
