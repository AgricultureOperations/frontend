import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../../shared/components/Button";
import { Modal } from "../../../shared/components/Modal";
import { FormField } from "../../../shared/components/form/FormField";
import { fieldA11y } from "../../../shared/components/form/fieldA11y";
import { FormSection } from "../../../shared/components/form/FormSection";
import { SegmentedControl } from "../../../shared/components/form/SegmentedControl";
import { Switch } from "../../../shared/components/form/Switch";
import styles from "../../../styles/features/products/components/ProductFormModal.module.scss";
import { useProductForm } from "../hooks/useProductForm";
import { Product } from "../interfaces/product.interface";
import { CreateProductRequest } from "../interfaces/product.request";
import { EMPTY_PRODUCT_FORM, productToFormValues } from "../utils/product-form.mapper";
import {
    CATEGORY_SUGGESTIONS,
    PRODUCT_STATUS_OPTIONS,
    PRODUCT_TYPE_OPTIONS,
    UNIT_OPTIONS,
} from "../utils/product-options";

interface Props {
    // undefined = create
    product?: Product;
    saving: boolean;
    onSave: (body: CreateProductRequest) => Promise<string | null>;
    onClose: () => void;
}

const FORM_ID = "product-form";
const REQUIRED = new Set(["name", "sku", "category", "unitOfMeasure", "costPrice", "sellingPrice", "taxRate", "minStockLevel", "reorderPoint"]);

export const ProductFormModal = ({ product, saving, onSave, onClose }: Props) => {
    const isEdit = product !== undefined;
    const { values, errors, submitError, setField, handleSubmit } = useProductForm(
        isEdit ? productToFormValues(product) : EMPTY_PRODUCT_FORM,
        onSave,
    );

    const text = (field: "name" | "sku" | "category" | "scientificName" | "activeIngredient") => ({
        ...fieldA11y(field, errors[field], REQUIRED.has(field)),
        value: values[field],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setField(field, e.target.value),
    });

    const numeric = (
        field: "safetyPeriodDays" | "presentationSize" | "costPrice" | "sellingPrice" | "taxRate" | "minStockLevel" | "maxStockLevel" | "reorderPoint",
        step: string,
    ) => ({
        ...fieldA11y(field, errors[field], REQUIRED.has(field)),
        type: "number",
        inputMode: step === "1" ? ("numeric" as const) : ("decimal" as const),
        min: 0,
        step,
        value: values[field],
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setField(field, e.target.value),
    });

    return (
        <Modal
            eyebrow={isEdit ? `Edición · ${product.sku}` : "Alta manual"}
            title={isEdit ? "Editar Producto" : "Nuevo Producto"}
            subtitle={
                isEdit
                    ? "Actualiza los datos maestros del producto. Los cambios aplican de inmediato."
                    : "Registra un insumo, cosecha o equipo en el catálogo de productos."
            }
            onClose={onClose}
            busy={saving}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button type="submit" form={FORM_ID} loading={saving}>Guardar Producto</Button>
                </>
            }
        >
            <form id={FORM_ID} className={styles.form} onSubmit={handleSubmit} noValidate>
                {submitError && (
                    <div className={styles.submitError} role="alert">
                        <FiAlertCircle aria-hidden />
                        <span>{submitError}</span>
                    </div>
                )}

                <FormSection
                    title="Información básica"
                    description="Identifica el producto y define cómo se clasifica en el catálogo."
                >
                    <FormField id="name" label="Nombre" required error={errors.name}>
                        <input {...text("name")} placeholder="Ej. Urea 46% N" autoFocus maxLength={200} />
                    </FormField>
                    <FormField id="sku" label="SKU" required error={errors.sku} hint="Único. Se guarda en mayúsculas.">
                        <input {...text("sku")} placeholder="Ej. FERT-UREA-50KG" maxLength={64} className={`${fieldA11y("sku", errors.sku).className} ${styles.upper}`} />
                    </FormField>
                    <FormField id="category" label="Categoría" required error={errors.category}>
                        <input {...text("category")} placeholder="Ej. fertilizante" list="product-category-suggestions" maxLength={100} />
                    </FormField>
                    <datalist id="product-category-suggestions">
                        {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
                    </datalist>
                    <SegmentedControl
                        label="Tipo de producto"
                        required
                        value={values.productType}
                        options={PRODUCT_TYPE_OPTIONS}
                        onChange={(v) => setField("productType", v)}
                    />
                    <SegmentedControl
                        label="Estado"
                        fullWidth
                        value={values.status}
                        options={PRODUCT_STATUS_OPTIONS}
                        onChange={(v) => setField("status", v)}
                        hint="Descontinuado retira el producto del catálogo sin borrar su historial."
                    />
                </FormSection>

                <FormSection
                    title="Agronomía / Especificaciones"
                    description="Datos técnicos para insumos y cultivos."
                    badge={values.isHazardous ? "Producto peligroso" : undefined}
                >
                    <FormField id="scientificName" label="Nombre científico" error={errors.scientificName}>
                        <input {...text("scientificName")} placeholder="Ej. Theobroma cacao" maxLength={200} />
                    </FormField>
                    <FormField id="activeIngredient" label="Ingrediente activo" error={errors.activeIngredient}>
                        <input {...text("activeIngredient")} placeholder="Ej. Glifosato" maxLength={200} />
                    </FormField>
                    <FormField id="safetyPeriodDays" label="Periodo de carencia (días)" error={errors.safetyPeriodDays} hint="Días entre la aplicación y la cosecha.">
                        <input {...numeric("safetyPeriodDays", "1")} placeholder="0" />
                    </FormField>
                    <div className={styles.switchCell}>
                        <Switch
                            id="isHazardous"
                            label="Material peligroso"
                            description="Requiere manejo y almacenamiento especial."
                            checked={values.isHazardous}
                            onChange={(v) => setField("isHazardous", v)}
                        />
                    </div>
                </FormSection>

                <FormSection
                    title="Empaque y precios"
                    description="Unidad de venta, presentación comercial y precios en USD."
                >
                    <FormField id="unitOfMeasure" label="Unidad de medida" required error={errors.unitOfMeasure}>
                        <select
                            {...fieldA11y("unitOfMeasure", errors.unitOfMeasure, true)}
                            value={values.unitOfMeasure}
                            onChange={(e) => setField("unitOfMeasure", e.target.value as typeof values.unitOfMeasure)}
                        >
                            {UNIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </FormField>
                    <div className={styles.inline}>
                        <FormField id="presentationSize" label="Presentación" error={errors.presentationSize}>
                            <input {...numeric("presentationSize", "0.001")} placeholder="Ej. 50" />
                        </FormField>
                        <FormField id="presentationUnit" label="Unidad presentación" error={errors.presentationUnit}>
                            <select
                                {...fieldA11y("presentationUnit", errors.presentationUnit)}
                                value={values.presentationUnit}
                                onChange={(e) => setField("presentationUnit", e.target.value as typeof values.presentationUnit)}
                            >
                                <option value="">—</option>
                                {UNIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </FormField>
                    </div>
                    <FormField id="costPrice" label="Precio de costo" required error={errors.costPrice}>
                        <input {...numeric("costPrice", "0.01")} placeholder="0.00" />
                    </FormField>
                    <FormField id="sellingPrice" label="Precio de venta" required error={errors.sellingPrice}>
                        <input {...numeric("sellingPrice", "0.01")} placeholder="0.00" />
                    </FormField>
                    <FormField id="taxRate" label="Tasa de impuesto (%)" required error={errors.taxRate} hint="IVA aplicable, de 0 a 100.">
                        <input {...numeric("taxRate", "0.01")} max={100} placeholder="0" />
                    </FormField>
                </FormSection>

                <FormSection
                    title="Control de stock"
                    description="Niveles que disparan alertas de reabastecimiento."
                >
                    <FormField id="minStockLevel" label="Stock mínimo" required error={errors.minStockLevel}>
                        <input {...numeric("minStockLevel", "1")} placeholder="0" />
                    </FormField>
                    <FormField id="maxStockLevel" label="Stock máximo" error={errors.maxStockLevel} hint="Opcional.">
                        <input {...numeric("maxStockLevel", "1")} placeholder="Sin límite" />
                    </FormField>
                    <FormField id="reorderPoint" label="Punto de reorden" required error={errors.reorderPoint} hint="Entre el stock mínimo y el máximo.">
                        <input {...numeric("reorderPoint", "1")} placeholder="0" />
                    </FormField>
                    <div className={styles.switchStack}>
                        <Switch
                            id="requiresBatchTracking"
                            label="Rastreo por lote"
                            checked={values.requiresBatchTracking}
                            onChange={(v) => setField("requiresBatchTracking", v)}
                        />
                        <Switch
                            id="requiresExpiration"
                            label="Controla vencimiento"
                            checked={values.requiresExpiration}
                            onChange={(v) => setField("requiresExpiration", v)}
                        />
                    </div>
                </FormSection>
            </form>
        </Modal>
    );
};
