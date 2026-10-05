// Up to `size` consecutive page numbers around the current page (reference: "‹ 1 2 3 4 5 ›").
export const getPageWindow = (page: number, totalPages: number, size = 5): number[] => {
    if (totalPages <= 0) return [];
    const count = Math.min(size, totalPages);
    const start = Math.min(Math.max(1, page - Math.floor(count / 2)), totalPages - count + 1);
    return Array.from({ length: count }, (_, i) => start + i);
};

// "1–10 de 43" range for the footer.
export const getPageRange = (page: number, pageSize: number, total: number) => ({
    from: total === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
});
