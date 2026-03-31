import { OrdersTable } from "../components/OrdersTable";
import { useOrdersTable } from "../hooks/useOrdersTable";

const OrdersPage = () => {
  const { orders } = useOrdersTable();
  return (
    <div>
      <h1>Orders</h1>
      <OrdersTable data={orders}/>
    </div>
  )
};
export default OrdersPage;
