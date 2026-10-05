import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchMeThunk } from "../states/auth.slice";

// Loads GET /auth/me once per session (app load and after each login). AppLayout calls it for every protected page.
export const useSession = () => {
    const dispatch = useAppDispatch();
    const token = useAppSelector((state) => state.auth.token);
    const { me, meStatus, meError } = useAppSelector((state) => state.auth);

    const reload = useCallback(() => {
        dispatch(fetchMeThunk());
    }, [dispatch]);

    useEffect(() => {
        if (token && meStatus === "idle") reload();
    }, [token, meStatus, reload]);

    return { me, status: meStatus, error: meError, reload };
};
