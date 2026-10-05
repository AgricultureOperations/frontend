import axios from "axios";

export const FORBIDDEN_MESSAGE = "No tienes permiso para realizar esta acción";

// Message for rejectWithValue. A 403 means "signed in but not allowed": the session stays (only a 401
// logs out, see createAxiosApi), and the hook turns this message into a toast.
export const getApiErrorMessage = (error: unknown, fallback = "Something went wrong"): string => {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) return FORBIDDEN_MESSAGE;
        return error.response?.data?.message || fallback;
    }
    return error instanceof Error && error.message ? error.message : fallback;
};
