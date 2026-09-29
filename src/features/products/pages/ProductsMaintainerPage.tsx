import { FiAlertTriangle, FiBox, FiPlus } from "react-icons/fi";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import styles from "../../../styles/features/products/pages/ProductsMaintainerPage.module.scss";
import { DeleteProductDialog } from "../components/DeleteProductDialog";
import { ProductFormModal } from "../components/ProductFormModal";
import { ProductsPagination } from "../components/ProductsPagination";
import { ProductsTable } from "../components/ProductsTable";
import { useProductsMaintainer } from "../hooks/useProductsMaintainer";

const ProductsMaintainerPage = () => {
    const m = useProductsMaintainer();
    const firstLoad = m.loading && m.products.length === 0;

    let content;
    if (m.error && m.products.length === 0) {
        content = (
            <EmptyState
                icon={<FiAlertTriangle aria-hidden />}
                title="No se pudieron cargar los productos"
                subtitle={m.error}
                action={<Button variant="outline" onClick={m.reload}>Reintentar</Button>}
            />
        );
    } else if (firstLoad) {
        content = (
            <div className={styles.loading} role="status">
                <span className={styles.spinner} aria-hidden />
                Cargando productos…
            </div>
        );
    } else if (m.products.length === 0) {
        content = (
            <EmptyState
                icon={<FiBox aria-hidden />}
                title="No products yet"
                subtitle="Registra tu primer insumo, cosecha o equipo con «Nuevo Producto»."
            />
        );
    } else {
        content = (
            <div className={styles.card} aria-busy={m.loading}>
                <ProductsTable data={m.products} onEdit={m.openEdit} onDelete={m.askDelete} />
                <ProductsPagination meta={m.meta} onPageChange={m.goToPage} />
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className={styles.headerRow}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Products</h1>
                    <p className={styles.subtitle}>Catálogo de insumos, cosechas y equipos</p>
                </div>
                <Button icon={<FiPlus aria-hidden />} onClick={m.openCreate}>Nuevo Producto</Button>
            </div>

            {content}

            {m.formTarget && (
                <ProductFormModal
                    // remount per target so the form starts from that product's values
                    key={m.formTarget.mode === "edit" ? m.formTarget.product.id : "create"}
                    product={m.formTarget.mode === "edit" ? m.formTarget.product : undefined}
                    saving={m.saving}
                    onSave={m.saveProduct}
                    onClose={m.closeForm}
                />
            )}
            {m.deleteTarget && (
                <DeleteProductDialog
                    product={m.deleteTarget}
                    loading={m.saving}
                    onConfirm={m.confirmDelete}
                    onCancel={m.cancelDelete}
                />
            )}
        </div>
    );
};
export default ProductsMaintainerPage;
