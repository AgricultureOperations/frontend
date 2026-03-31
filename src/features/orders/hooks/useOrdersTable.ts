import { useEffect, useState } from "react";
import { mockOrders } from "../data/dataMock";
import { Order } from "../interfaces/order.interface";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { orderThunk } from "../states/order.slice";

export const useOrdersTable = () => {
    const dispatch = useAppDispatch();
    const { orders, loading, error } = useAppSelector(
        (state) => state.orders
    );
    //const [data, setData] = useState<Order[]>([]);

    useEffect(() => {
        const loadOrders = async () => {
            const response = await dispatch(orderThunk(undefined))
            //setData(response.payload)
        }
        loadOrders();
        //dispatch(orderThunk(undefined));
    }
    ,[])
    /*useEffect(() => {
        //const loadOrders = async() => {
        //  const res = await fetchOrders({page, limit, search, status});
        //  setData(res.data)
        //  setData(res.total)
        //}
        //loadOrders()
        //[page, search, status]
        const data = mockOrders;
        setData(data);
    }, [])*/
    
    return {orders};
}
