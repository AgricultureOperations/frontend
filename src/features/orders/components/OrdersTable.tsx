import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { FiInbox } from "react-icons/fi";
import styles from "../../../styles/features/orders/components/OrdersTable.module.scss";
import { Order } from "../interfaces/order.interface";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { EmptyState } from "../../../shared/components/EmptyState";

interface Props {
    data: Order[]
}
export const OrdersTable = ({ data }:Props) => {
    const columns = [
        {
            header: 'Order ID',
            accessorKey: 'id'
        },
        {
            header: 'Customer ID',
            accessorKey: 'customerId'
        },
        {
            header: 'Date',
            accessorKey: 'createdAt'
        },
        {
            header: 'Status',
            accessorKey: 'status.name',
            cell: ({ row }: { row: { original: Order } }) => (
                <OrderStatusBadge statusName={row.original.status.name} />
            )
        },
        {
            header: 'Total',
            accessorKey: 'total'
        },
    ];

    const table =useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    if (data.length === 0) {
        return (
            <EmptyState
                icon={<FiInbox />}
                title="No orders found"
                subtitle="Orders will show up here once they're created."
            />
        );
    }

    return (
        <table className={styles.ordersTable}>
            <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id}>
                                {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(
                                    cell.column.columnDef.cell ,//?? cell.column.columnDef.,
                                    cell.getContext()
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
