import { ProductStatus, ProductType, UnitOfMeasure } from "../interfaces/product.interface";

interface Option<T extends string> {
    value: T;
    label: string;
}

export const PRODUCT_TYPE_OPTIONS: Option<ProductType>[] = [
    { value: "input", label: "Insumo" },
    { value: "harvest", label: "Cosecha" },
    { value: "equipment", label: "Equipo" },
];

export const PRODUCT_STATUS_OPTIONS: Option<ProductStatus>[] = [
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "discontinued", label: "Descontinuado" },
];

// The four field units come first; the rest are the other values product-service accepts.
export const UNIT_OPTIONS: Option<UnitOfMeasure>[] = [
    { value: "kg", label: "Kilogramo (kg)" },
    { value: "bag", label: "Saco" },
    { value: "t", label: "Tonelada (ton)" },
    { value: "qq", label: "Quintal (qq)" },
    { value: "lb", label: "Libra (lb)" },
    { value: "g", label: "Gramo (g)" },
    { value: "l", label: "Litro (l)" },
    { value: "ml", label: "Mililitro (ml)" },
    { value: "gal", label: "Galón (gal)" },
    { value: "box", label: "Caja" },
    { value: "unit", label: "Unidad" },
];

export const CATEGORY_SUGGESTIONS = [
    "fertilizante",
    "pesticida",
    "semilla",
    "banano",
    "cacao",
    "granos",
    "maquinaria",
    "herramientas",
];

// Short labels for table cells.
export const UNIT_SHORT_LABEL: Record<UnitOfMeasure, string> = {
    kg: "kg",
    g: "g",
    lb: "lb",
    qq: "qq",
    t: "ton",
    l: "l",
    ml: "ml",
    gal: "gal",
    unit: "unidad",
    box: "caja",
    bag: "saco",
};

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
    harvest: "Harvest",
    input: "Input",
    equipment: "Equipment",
};

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    discontinued: "Discontinued",
};

export const formatPrice = (value: number): string =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
