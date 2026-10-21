const DataTable = ({ columns, rows, emptyMessage = "Nothing to show yet" }) => {
    if (rows.length === 0) {
        return <p className="table-empty">{emptyMessage}</p>
    }

    return (
        <table className="data-table">
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.key} className="table-heading">{column.label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.id} className="table-row">
                        {columns.map((column) => (
                            <td key={column.key} className="table-cell">
                                {column.render ? column.render(row) : row[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default DataTable
