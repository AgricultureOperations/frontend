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
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordType, setPasswordType] = useState<"text" | "password">('password');
    const [confirmPasswordType, setConfirmPasswordType] = useState<"text" | "password">('password');
    const handlePasswordType = () => {
        if(passwordType === 'text')
            setPasswordType('password')
        else
            setPasswordType('text')
    };
    const handleConfirmPasswordType = () => {
        if(confirmPasswordType === 'text')
            setConfirmPasswordType('password')
        else
            setConfirmPasswordType('text')
    };
    
    const [validationError, setValidationError] = useState<{
        email?: string,
        password?: string,
        confirmPassword?: string
    }>({})
    const handleRegister = async () => {
        //setLoading(true);
        //setError(null);
        setValidationError({});   
        try {
            await registerSchema.validate(
                { email, password, confirmPassword },
                { abortEarly: false }
            );
        } catch (error) {
            if( error instanceof ValidationError ){
                const errors: { email?: string; password?: string, confirmPassword?: string} = {};
                error.inner.forEach((e) => {
                    if( e.path ){
                        errors[e.path as "email" | "password" | "confirmPassword"] = e.message
                    }
                });
                setValidationError(errors);
            }
            //setLoading(false);
            return;
        }
        dispatch(registerThunk({email,password}));
    } 

    useEffect(() => {
        if( success ){
            HandleBack()
        }
    }, [success])

    const HandleBack = () => {
        navigate("/login", { replace: true})
    };
    
    return {
        email
        ,password
        ,confirmPassword
        ,passwordType
        ,confirmPasswordType
        ,loading
        ,error
        ,validationError
        ,setEmail
        ,setPassword
        ,setConfirmPassword
        ,handleRegister
        ,handlePasswordType
        ,handleConfirmPasswordType
        ,HandleBack
    };
}
 
export default useRegister;