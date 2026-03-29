import { OrdersTable } from "../components/OrdersTable";
import { useOrdersTable } from "../hooks/useOrdersTable";

const OrdersPage = () => {
  const { data } = useOrdersTable();
  return (
    <div>
      <h1>Orders</h1>
      <OrdersTable data={data}/>
    </div>
  )
};
export default OrdersPage;
