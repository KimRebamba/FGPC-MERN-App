const PageHeader = ({ title, description, children }) => {
    return (
        <header className="page-header">
            <div className="page-heading">
                <h1 className="page-title">{title}</h1>
                {description && <p className="page-description">{description}</p>}
            </div>
            {children && <div className="page-actions">{children}</div>}
        </header>
    )
}

export default PageHeader
