import * as yup from "yup";

// UX-only mirror of product-service's rules (CreateProductDto + Product entity invariants).
// The backend enforces all of them again.
const optionalNumber = () =>
    yup
        .number()
        .transform((value, original) => (original === "" ? undefined : value))
        .typeError("Debe ser un número");

// Tolerance, because binary floats make 12.4 * 100 = 1240.0000000000002.
const twoDecimals = (value: number | undefined) =>
    value === undefined || Math.abs(Math.round(value * 100) - value * 100) < 1e-6;

export const productSchema = yup.object().shape({
    name: yup.string().trim().required("El nombre es obligatorio").max(200, "Máximo 200 caracteres"),
    sku: yup
        .string()
        .trim()
        .required("El SKU es obligatorio")
        .max(64, "Máximo 64 caracteres")
        .matches(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, "Solo letras, números, '.', '_' o '-'"),
    category: yup.string().trim().required("La categoría es obligatoria").max(100, "Máximo 100 caracteres"),
    productType: yup.string().required("Seleccione un tipo"),
    status: yup.string().required(),
    scientificName: yup.string().max(200, "Máximo 200 caracteres"),
    activeIngredient: yup.string().max(200, "Máximo 200 caracteres"),
    safetyPeriodDays: optionalNumber().integer("Debe ser un número entero").min(0, "No puede ser negativo"),
    unitOfMeasure: yup.string().required("Seleccione una unidad"),
    presentationSize: optionalNumber()
        .positive("Debe ser mayor a 0")
        .when("presentationUnit", {
            is: (unit: string) => !!unit,
            then: (schema) => schema.required("Indique el tamaño de la presentación"),
        }),
    presentationUnit: yup.string().when("presentationSize", {
        is: (size: string) => size !== "" && size !== undefined,
        then: (schema) => schema.required("Seleccione la unidad de la presentación"),
    }),
    costPrice: optionalNumber()
        .required("El precio de costo es obligatorio")
        .min(0, "No puede ser negativo")
        .test("decimals", "Máximo 2 decimales", twoDecimals),
    sellingPrice: optionalNumber()
        .required("El precio de venta es obligatorio")
        .min(0, "No puede ser negativo")
        .test("decimals", "Máximo 2 decimales", twoDecimals),
    taxRate: optionalNumber()
        .required("La tasa de impuesto es obligatoria")
        .min(0, "Entre 0 y 100")
        .max(100, "Entre 0 y 100")
        .test("decimals", "Máximo 2 decimales", twoDecimals),
    minStockLevel: optionalNumber()
        .required("El stock mínimo es obligatorio")
        .integer("Debe ser un número entero")
        .min(0, "No puede ser negativo"),
    maxStockLevel: optionalNumber()
        .integer("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .test("gte-min", "Debe ser mayor o igual al stock mínimo", function (max) {
            const { minStockLevel } = this.parent;
            return max === undefined || minStockLevel === undefined || max >= minStockLevel;
        }),
    reorderPoint: optionalNumber()
        .required("El punto de reorden es obligatorio")
        .integer("Debe ser un número entero")
        .min(0, "No puede ser negativo")
        .test("range", "Debe estar entre el stock mínimo y el máximo", function (point) {
            const { minStockLevel, maxStockLevel } = this.parent;
            if (point === undefined) return true;
            if (minStockLevel !== undefined && point < minStockLevel) return false;
            return maxStockLevel === undefined || point <= maxStockLevel;
        }),
}, [["presentationSize", "presentationUnit"]]);
