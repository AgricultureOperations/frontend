import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { Product } from "../interfaces/product.interface";

interface Props {
    product: Product;
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteProductDialog = ({ product, loading, onConfirm, onCancel }: Props) => (
    <ConfirmDialog
        title="¿Está seguro de eliminar este producto?"
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message={
            <>
                <p>
                    Se eliminará <strong>{product.name}</strong> ({product.sku}) de forma permanente.
                </p>
                <p>Si solo desea retirarlo del catálogo y conservar su historial, edítelo y cambie su estado a Descontinuado.</p>
            </>
        }
    />
);
