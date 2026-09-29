import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { showToast } from "../../../shared/states/toast.slice";
import { Product } from "../interfaces/product.interface";
import { CreateProductRequest } from "../interfaces/product.request";
import {
    createProductThunk,
    deleteProductThunk,
    fetchProductsThunk,
    PRODUCTS_PAGE_SIZE,
    updateProductThunk,
} from "../states/product.slice";

export type ProductFormTarget = { mode: "create" } | { mode: "edit"; product: Product };

// Page state for the Products maintainer: list + paging, the create/edit modal and the delete dialog.
export const useProductsMaintainer = () => {
    const dispatch = useAppDispatch();
    const { products, meta, loading, saving, error } = useAppSelector((state) => state.products);
    const [page, setPage] = useState(1);
    const [formTarget, setFormTarget] = useState<ProductFormTarget | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

    const loadProducts = useCallback(() => {
        dispatch(fetchProductsThunk({ page, limit: PRODUCTS_PAGE_SIZE }));
    }, [dispatch, page]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const goToPage = (next: number) => {
        // page 1 already loaded: re-fetch explicitly, since setPage(1) wouldn't trigger the effect
        if (next === page) loadProducts();
        else setPage(next);
    };

    // Returns the server's message on failure so the modal can show it; null on success.
    const saveProduct = async (body: CreateProductRequest): Promise<string | null> => {
        if (!formTarget) return null;
        const isCreate = formTarget.mode === "create";
        const action = isCreate
            ? await dispatch(createProductThunk(body))
            : await dispatch(updateProductThunk({ id: formTarget.product.id, changes: body }));

        if (createProductThunk.rejected.match(action) || updateProductThunk.rejected.match(action)) {
            const message = action.payload ?? "No se pudo guardar el producto";
            dispatch(showToast("error", message));
            return message;
        }

        dispatch(showToast("success", isCreate ? `Producto ${body.sku.toUpperCase()} creado` : "Producto actualizado"));
        setFormTarget(null);
        // New products are sorted newest first, so show page 1 after a create.
        goToPage(isCreate ? 1 : page);
        return null;
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const action = await dispatch(deleteProductThunk(deleteTarget.id));
        if (deleteProductThunk.rejected.match(action)) {
            dispatch(showToast("error", action.payload ?? "No se pudo eliminar el producto"));
            return;
        }
        dispatch(showToast("success", `Producto ${deleteTarget.sku} eliminado`));
        setDeleteTarget(null);
        // Step back when the last row of a later page was removed.
        goToPage(products.length === 1 && page > 1 ? page - 1 : page);
    };

    return {
        products,
        meta,
        loading,
        saving,
        error,
        page,
        goToPage,
        reload: loadProducts,
        formTarget,
        openCreate: () => setFormTarget({ mode: "create" }),
        openEdit: (product: Product) => setFormTarget({ mode: "edit", product }),
        closeForm: () => setFormTarget(null),
        saveProduct,
        deleteTarget,
        askDelete: (product: Product) => setDeleteTarget(product),
        cancelDelete: () => setDeleteTarget(null),
        confirmDelete,
    };
};
