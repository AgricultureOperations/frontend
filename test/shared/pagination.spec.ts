import { describe, expect, test } from "vitest";
import { getPageRange, getPageWindow } from "../../src/shared/utils/pagination";

describe("getPageWindow", () => {
    test("shows every page when there are few", () => {
        expect(getPageWindow(1, 3)).toEqual([1, 2, 3]);
    });

    test("keeps five pages around the current one, clamped to the edges", () => {
        expect(getPageWindow(1, 9)).toEqual([1, 2, 3, 4, 5]);
        expect(getPageWindow(5, 9)).toEqual([3, 4, 5, 6, 7]);
        expect(getPageWindow(9, 9)).toEqual([5, 6, 7, 8, 9]);
    });

    test("is empty without pages", () => {
        expect(getPageWindow(1, 0)).toEqual([]);
    });
});

describe("getPageRange", () => {
    test("returns the reference's '1–10 de 43' bounds", () => {
        expect(getPageRange(1, 10, 43)).toEqual({ from: 1, to: 10 });
        expect(getPageRange(5, 10, 43)).toEqual({ from: 41, to: 43 });
        expect(getPageRange(1, 10, 0)).toEqual({ from: 0, to: 0 });
    });
});
