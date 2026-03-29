import { useEffect, useState } from "react";
import { mockOrders } from "../data/dataMock";
import { Order } from "../interfaces/order.interface";

export const useOrdersTable = () => {
    const [data, setData] = useState<Order[]>([]);
    useEffect(() => {
        //const loadOrders = async() => {
        //  const res = await fetchOrders({page, limit, search, status});
        //  setData(res.data)
        //  setData(res.total)
        //}
        //loadOrders()
        //[page, search, status]
        const data = mockOrders;
        setData(data);
    }, [])
    
    return {data};
}
