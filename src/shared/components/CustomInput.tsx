import { FaEye, FaEyeSlash } from "react-icons/fa";

interface Props {
    classNameFormGroup: string;
    classNameInput: string;
    classNameError: string;
    name: string;
    type: string;
    placeholder: string;
    value: string;
    HandleChange: (e: any) => void;
    validationError?: string;
    isRequired: boolean;
    label?: string;
    classNameLabel?: string;

    //password-specific
    isPasswordType?: boolean;
    classNamePasswordToogleIcon?: string;
    passwordType?: "text" | "password";
    HandlePasswordType?: () => void;

}
const CustomInput = ({classNameFormGroup,classNameInput,classNameError,name,type,placeholder,value,HandleChange,isRequired = false,validationError,label,classNameLabel, isPasswordType = false,passwordType,classNamePasswordToogleIcon,HandlePasswordType}:Props) => {
  const labelElement = label && (
    <label htmlFor={name} className={classNameLabel}>{label}</label>
  );
  return (
    <>
        {isPasswordType && labelElement}
        <div className={classNameFormGroup}>
            {!isPasswordType && labelElement}
            <input
                className={classNameInput}
                id={label ? name : undefined}
                name={name}
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