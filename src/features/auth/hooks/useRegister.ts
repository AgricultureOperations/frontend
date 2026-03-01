import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postRegister } from "../actions/post-register.action";
import { ValidationError } from 'yup';
import { registerSchema } from "../validations/register.validation";

const useRegister = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null)
    
    const [validationError, setValidationError] = useState<{
        email?: string,
        password?: string
    }>({})
    const handleRegister = async () => {
        setLoading(true);
        setError(null);
        setValidationError({});   
        try {
            await registerSchema.validate(
                { email, password },
                { abortEarly: false }
            );
        } catch (error) {
            if( error instanceof ValidationError ){
                const errors: { email?: string; password?: string} = {};
                error.inner.forEach((e) => {
                    if( e.path ){
                        errors[e.path as "email" | "password"] = e.message
                    }
                });
                setValidationError(errors);
            }
            setLoading(false);
            return;
        }
        
        try {
            const response = await postRegister(email,password); 
            console.log(response);
            if(response != null){            
                navigate('/login');
            }
        } catch (error) {
            if(error instanceof Error){
                setError(error.message);
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
        ,validationError
        ,setEmail
        ,setPassword
        ,setLoading
        ,handleRegister
    };
}
 
export default useRegister;