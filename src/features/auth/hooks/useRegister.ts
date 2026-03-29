import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
//import { postRegister } from "../actions/post-register.action";
import { ValidationError } from 'yup';
import { registerSchema } from "../validations/register.validation";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { registerThunk } from "../states/register.slice";

const useRegister = () => {
    const dispatch = useAppDispatch();
    const { success, loading, error } = useAppSelector(
        (state) => state.register
    )
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    /*const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null)*/
    
    const [validationError, setValidationError] = useState<{
        email?: string,
        password?: string
    }>({})
    const handleRegister = async () => {
        //setLoading(true);
        //setError(null);
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
            //setLoading(false);
            return;
        }
        
        /*try {
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
        }*/
       dispatch(registerThunk({email,password}));
    } 

    useEffect(() => {
        if( success ){
            navigate("/login", { replace: true})
        }
    }, [success])
    
    return {
        email
        ,password
        ,loading
        ,error
        ,validationError
        ,setEmail
        ,setPassword
        ,handleRegister
    };
}
 
export default useRegister;