import { OrdersTable } from "../components/OrdersTable";
import { useOrdersTable } from "../hooks/useOrdersTable";
import styles from "../../../styles/features/orders/pages/OrdersPage.module.scss";

const OrdersPage = () => {
  const { orders } = useOrdersTable();
  return (
    <div className={styles.page}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Orders</h1>
        <p className={styles.subtitle}>Listado de órdenes</p>
      </div>
      <OrdersTable data={orders}/>
    </div>
  )
};
export default OrdersPage;
