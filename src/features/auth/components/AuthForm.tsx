import CustomInput from "../../../shared/components/CustomInput";
import Spinner from "../../../shared/components/Spinner";
interface inputField {
    name: string;
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
interface Props {
    classNameForm: string;
    classNameFormGroup: string;
    classNamePasswordInputContainer: string;
    HandleLogin: () => void;
    classNameInput: string;
    classNameError: string;
    classNameButton: string;
    loading: boolean;
    buttonName: string;
    //fields
    fields: inputField[]

}
const AuthForm = ({classNameForm, classNameFormGroup, classNamePasswordInputContainer, HandleLogin, classNameInput, classNameError, fields, classNameButton, loading, buttonName}:Props) => {
  return (
    <form className={classNameForm}
        onSubmit={(e) => {
            e.preventDefault();
            HandleLogin();
        }}
        >
        {fields.map(field =>
            !field.isPasswordType && (<CustomInput 
                classNameFormGroup={classNameFormGroup}
                classNameInput={classNameInput}
                classNameError={classNameError}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                HandleChange={field.HandleChange}
                isRequired={field.isRequired}
                validationError={field.validationError}
            />) || 
            field.isPasswordType && (
            <div className={classNameFormGroup}>
                <CustomInput 
                    classNameFormGroup={classNamePasswordInputContainer}
                    classNameInput={classNameInput}
                    classNameError={classNameError}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    HandleChange={field.HandleChange}
                    isRequired={field.isRequired}
                    validationError={field.validationError}
                    isPasswordType={field.isPasswordType}
                    passwordType={field.passwordType}
                    classNamePasswordToogleIcon={field.classNamePasswordToogleIcon}
                    HandlePasswordType={field.HandlePasswordType}
                />
            </div>)
        )}
        <button type="submit" className={classNameButton} disabled={loading} onClick={HandleLogin}>
            {loading ? <Spinner />: buttonName}
        </button>
    </form>
  )
}
export default AuthForm;
