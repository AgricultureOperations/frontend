import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import styles from "../../../styles/features/products/components/ProductsTable.module.scss";
import { Product } from "../interfaces/product.interface";
import { formatPrice, PRODUCT_TYPE_LABEL, UNIT_SHORT_LABEL } from "../utils/product-options";
import { ProductStatusBadge } from "./ProductStatusBadge";

interface Props {
    data: Product[];
    // Omitted when the user lacks products:edit / products:delete: the button isn't rendered.
    onEdit?: (product: Product) => void;
    onDelete?: (product: Product) => void;
}

export const ProductsTable = ({ data, onEdit, onDelete }: Props) => {
    const hasActions = !!onEdit || !!onDelete;
    const columns: ColumnDef<Product>[] = [
        { header: "SKU", accessorKey: "sku", cell: ({ row }) => <span className={styles.sku}>{row.original.sku}</span> },
        {
            header: "Name",
            accessorKey: "name",
            cell: ({ row }) => (
                <div className={styles.nameCell}>
                    <span className={styles.name}>{row.original.name}</span>
                    {row.original.isHazardous && <span className={styles.hazard}>Peligroso</span>}
                </div>
            ),
        },
        { header: "Category", accessorKey: "category", cell: ({ row }) => <span className={styles.category}>{row.original.category}</span> },
        { header: "Type", accessorKey: "productType", cell: ({ row }) => PRODUCT_TYPE_LABEL[row.original.productType] },
        { header: "Unit", accessorKey: "unitOfMeasure", cell: ({ row }) => UNIT_SHORT_LABEL[row.original.unitOfMeasure] },
        {
            header: "Selling Price",
            accessorKey: "sellingPrice",
            meta: { numeric: true },
            cell: ({ row }) => formatPrice(row.original.sellingPrice),
        },
        { header: "Min Stock", accessorKey: "minStockLevel", meta: { numeric: true } },
        { header: "Status", accessorKey: "status", cell: ({ row }) => <ProductStatusBadge status={row.original.status} /> },
    ];
    if (hasActions) columns.push(
        {
            id: "actions",
            header: () => <span className={styles.srOnly}>Actions</span>,
            meta: { actions: true },
            cell: ({ row }) => (
                <div className={styles.actions}>
                    {onEdit && (
                        <button type="button" className={styles.iconButton} onClick={() => onEdit(row.original)} aria-label={`Editar ${row.original.sku}`} title="Editar">
                            <FiEdit2 aria-hidden />
                        </button>
                    )}
                    {onDelete && (
                        <button type="button" className={`${styles.iconButton} ${styles.danger}`} onClick={() => onDelete(row.original)} aria-label={`Eliminar ${row.original.sku}`} title="Eliminar">
                            <FiTrash2 aria-hidden />
                        </button>
                    )}
                </div>
            ),
        },
    );

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id });

    const cellClass = (meta: unknown) => {
        const m = meta as { numeric?: boolean; actions?: boolean } | undefined;
        return m?.numeric ? styles.numeric : m?.actions ? styles.actionsCell : undefined;
    };

    return (
        <div className={styles.scroll}>
            <table className={styles.table}>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} scope="col" className={cellClass(header.column.columnDef.meta)}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className={cellClass(cell.column.columnDef.meta)}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
