import { describe, expect, test, vi } from "vitest";
import { bitacoraApi } from '../../src/api/bitacora.api';
import axios, { AxiosError } from "axios";

//vi.mock("axios");

describe('bitacoraApi', ()=>{
    test('should be configured correctly', ()=>{
        expect(bitacoraApi.defaults.baseURL).toBe(import.meta.env.VITE_BITACORA_BASE_URL);
    });

    test('should emulate API success response', async ()=>{
        const spy = vi.spyOn(bitacoraApi,"get").mockResolvedValue(
        {    
            data: { token: "abc" },
            status: 200,
            statusText: "OK",
            headers: {},
            config: {}
        });
        const response = await bitacoraApi.get("/login");
        expect(spy).toHaveBeenCalled();
        expect(response.data.token).toBe('abc')
    });

    test('should emulate API unauthorized response', async ()=>{
        const spy = vi.spyOn(bitacoraApi,"get").mockRejectedValue(
        {    
            response: {
                data: { status: "error", message:   "Invalid Credentials" },
                status: 401,
                statusText: "Unauthorized",
                headers: {},
                config: {}
            }
        });
        try {
            await bitacoraApi.get("/login");
        } catch (error) {
            const axiosError = error as AxiosError<{ status: string; message: string }>;
            expect(axiosError.response?.data.status).toBe('error')
            expect(axiosError.response?.data.message).toBe('Invalid Credentials')
            
        }
        expect(spy).toHaveBeenCalled();
    });
});