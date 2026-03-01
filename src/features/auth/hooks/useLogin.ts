import { useNavigate } from "react-router-dom";
import { postLogin } from "../actions/post-login.action";
import { useState } from "react";
import { loginSchema } from "../validations/login.validation";
import { ValidationError } from "yup";

export const useLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [validationErrors, setValidationErrors] = useState<{
        email?: string,
        password?: string
    }>({})
    const handleLogin = async () => {
        setLoading(true);
        setError(null);
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
            setLoading(false)
            return; // stop submission if validation fails
        }

        //api handling error
        try {
            const data = await postLogin(email,password);
            localStorage.setItem("token", data.token);
            navigate("/dashboard")            
        } catch (error) {
            if(error instanceof Error){
                setError(error.message)
            }else{
                setError("Something went wrong")
            }
        }finally{
            setLoading(false)
        }
    }
    return {
        email
        ,password
        ,loading
        ,error 
        ,validationErrors
        ,setEmail
        ,setPassword
        ,handleLogin
    } 
    
}