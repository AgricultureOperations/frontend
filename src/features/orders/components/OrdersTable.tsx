import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Order } from "../interfaces/order.interface";
interface Props {
    data: Order[]
}
export const OrdersTable = ({ data }:Props) => {
    const columns = [
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
            accessorKey: 'status.name'
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
    return (
        <table>
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
