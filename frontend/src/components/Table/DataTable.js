import { DataGrid } from "@mui/x-data-grid"

const DataTable = ({ columns, rows, emptyMessage = "Nothing to show yet" }) => {
    if (rows.length === 0) {
        return <p className="table-empty">{emptyMessage}</p>
    }

    const dataGridColumns = columns.map((column) => {
        const isActions = column.key === "actions"
        return {
            field: column.key,
            headerName: column.label,
            flex: column.flex !== undefined ? column.flex : (isActions ? undefined : 1),
            width: column.width || (isActions ? 240 : undefined),
            minWidth: column.minWidth || (isActions ? 220 : 130),
            sortable: !isActions && column.sortable !== false,
            filterable: !isActions && column.filterable !== false,
            renderCell: column.render
                ? (params) => column.render(params.row)
                : (params) => params.value
        }
    })

    return (
        <div className="data-table-container" style={{ width: "100%", overflowX: "auto" }}>
            <DataGrid
                rows={rows}
                columns={dataGridColumns}
                getRowId={(row) => row.id}
                disableRowSelectionOnClick
                showToolbar
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10, page: 0 }
                    }
                }}
                slots={{
                    noRowsOverlay: () => <p className="table-empty">{emptyMessage}</p>
                }}
                autoHeight
                sx={{
                    minWidth: "100%",
                    "& .MuiDataGrid-virtualScroller": {
                        overflowX: "auto"
                    },
                    "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center"
                    }
                }}
            />
        </div>
    )
}

export default DataTable
