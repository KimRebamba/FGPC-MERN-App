import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { productActions } from "../../actions/resourceActions"
import ProductCard from "../../components/Product/ProductCard"
import { fgpcLogo } from "../../assets"

const Storefront = () => {
    const dispatch = useDispatch()
    const { items: products, loading } = useSelector((state) => state.products)
    const [page, setPage] = useState(1)
    const itemsPerPage = 4

    useEffect(() => {
        dispatch(productActions.fetchAll({ isActive: true }))
    }, [dispatch])

    // Products list sorted with in-stock items first
    const sortedProducts = [...products].sort((a, b) => {
        const aIn = (a.stock || 0) > 0 ? 1 : 0
        const bIn = (b.stock || 0) > 0 ? 1 : 0
        if (aIn !== bIn) return bIn - aIn
        return 0
    })

    const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage))
    const paginatedProducts = sortedProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    return (
        <div className="storefront">
            {/* ---- Hero ---- */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Safe is the new<br />
                        <em>attractive.</em>
                    </h1>
                    <p className="hero-subtitle">
                        The Best Motorcycle Gear Shop is finally in the Philippines! <br />
                        Located at 775 Aurora Blvd. corner Balete Drive, Quezon City. <br />
                        Open from 7:00 AM to 6:00 PM.
                    </p>
                    <div className="hero-actions">
                        <a href="/products" className="secondary-button" style={{ padding: "12px 28px", fontSize: "16px" }}>
                            Browse gears
                        </a>
                    </div>
                </div>
            </section>

            {/* ---- Best Sellers / Featured with Pagination by 4s ---- */}
            {!loading && sortedProducts.length > 0 && (
                <section className="storefront-section" style={{ padding: "60px 40px", maxWidth: "1250px", margin: "0 auto" }}>
                    <div className="storefront-section-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
                        <div>
                            <h2 className="storefront-section-title" style={{ fontSize: "28px", margin: "0 0 6px 0" }}>
                                Featured Gear
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "15px", margin: 0 }}>
                                Showing {((page - 1) * itemsPerPage) + 1}–{Math.min(page * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} items (Page {page} of {totalPages})
                            </p>
                        </div>
                        <a href="/products" className="secondary-button" style={{ padding: "10px 22px", fontSize: "14px" }}>
                            View full catalog →
                        </a>
                    </div>

                    <div className="product-grid" style={{ marginBottom: "32px" }}>
                        {paginatedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {/* Homepage Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "24px" }}>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                style={{ padding: "8px 18px", fontSize: "14px" }}
                            >
                                ← Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    type="button"
                                    className={page === pageNum ? "primary-button" : "secondary-button"}
                                    onClick={() => setPage(pageNum)}
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        padding: 0,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "14px",
                                        fontWeight: page === pageNum ? 700 : 400
                                    }}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                                style={{ padding: "8px 18px", fontSize: "14px" }}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </section>
            )}

            {/* ---- About Us / Origin Story Section ---- */}
            <section className="about-us-section">
                <div className="about-logo-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
                    <img src={fgpcLogo} alt="FGP Moto" className="about-logo" />

                </div>

                <div className="about-content">
                    <p className="about-eyebrow">About Us</p>
                    <h2 className="about-title">The Road Is Not Our Friend</h2>
                    <div className="about-text">
                        <p>
                            I founded FGP because I was tired of the stigma that wearing gear
                            was "uncool", then read about the horror stories of fellow riders getting
                            their fingers turned into bloody crayons on the road. That there must be a way
                            to make riders, especially beginners, have a change of heart.
                            That gear shouldn't be an afterthought. Plus, I think wearing gear is, for lack of a better term,
                            sexy as hell.
                        </p>
                        <p>
                            Started off in 2026 where I used my first motorcycle, gifted from my dad, to commute from home to
                            university. Saved up every peso that I had for a good motorcycle riding jacket, pants, and a pair of boots
                            from Marikina. I felt like a badass going to class with it, and you should too.
                        </p>
                        <p style={{ textAlign: "right" }}>- Founder of FGPC, Kim Fernandez (2026)</p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Storefront
