import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { loginSchema } from "../validations/login.validation";
import { ValidationError } from "yup";
import { loginThunk } from "../states/auth.slice";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";

export const useLogin = () => {
    const dispatch = useAppDispatch();
    const { token, loading, error } = useAppSelector(
        (state) => state.auth
    )
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordType, setPasswordType] = useState<string>('text');
    const handlePasswordType = () => {
        if(passwordType === 'text')
            setPasswordType('password')
        else
            setPasswordType('text')
    };
    const [validationErrors, setValidationErrors] = useState<{
        email?: string,
        password?: string
    }>({})
    const handleLogin = async () => {
        setValidationErrors({});
        //form handling error
        try {
            await loginSchema.validate(
                { email,password },
                { abortEarly: false } //collect all errors
            );
        } catch (error) {
            if(error instanceof ValidationError){
                const errors: { email?: string; password?: string } = {};
                error.inner.forEach((e) => {
                    if( e.path ){
                        errors[e.path as "email" | "password"] = e.message;
                    }
                });
                setValidationErrors(errors);
            }
            return;
        }
        dispatch(loginThunk({email,password}));
    }

    useEffect(() => {
        if( token ){
           navigate("/dashboard", { replace: true }) 
        }
    }, [token])
    
    return {
        email
        ,password
        ,passwordType
        ,loading
        ,error 
        ,validationErrors
        ,setEmail
        ,setPassword
        ,handleLogin
        ,handlePasswordType
    } 
    
}