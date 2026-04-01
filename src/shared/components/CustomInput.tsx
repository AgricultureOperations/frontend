import { FaEye, FaEyeSlash } from "react-icons/fa";

interface Props {
    classNameFormGroup: string;
    classNameInput: string;
    classNameError: string;
    type: string;
    placeholder: string;
    value: string;
    HandleChange: (e: any) => void;
    validationError?: string;
    isRequired: boolean;

    //password-specific
    isPasswordType?: boolean;
    classNamePasswordToogleIcon?: string;
    passwordType?: "text" | "password";
    HandlePasswordType?: () => void;

}
const CustomInput = ({classNameFormGroup,classNameInput,classNameError,type,placeholder,value,HandleChange,isRequired = false,validationError, isPasswordType = false,passwordType,classNamePasswordToogleIcon,HandlePasswordType}:Props) => {
  return (
    <>
        <div className={classNameFormGroup}>
            <input
                className={classNameInput}
                type={isPasswordType ? passwordType : type}
                placeholder={placeholder}
                value={value}
                onChange={HandleChange}
                required={isRequired}
            />
            {isPasswordType && (
                <span
                    className={classNamePasswordToogleIcon}
                    onClick={HandlePasswordType} 
                >
                    {passwordType === 'text' ?<FaEye/>:<FaEyeSlash/>}
                </span>
            )}
            {!isPasswordType &&(
                <p className={classNameError}>
                    {validationError || ''}
                </p>
            )}
        </div>
        {isPasswordType &&(
            <p className={classNameError}>
                {validationError || ''}
            </p>
        )}
    </>
  )
}
export default CustomInput;