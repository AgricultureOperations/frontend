import plantIcon from '../../../assets/plant-logo.png'
import styles from "../../../styles/features/auth/pages/AuthPage.module.scss";
import SharedError from "../../../shared/components/SharedError";
import useRegister from "../hooks/useRegister";
import AuthForm from '../components/AuthForm';
import { IoArrowBack } from 'react-icons/io5';

const RegisterPage = () => {
    const {email,password,confirmPassword,passwordType,confirmPasswordType,loading,error,validationError,setEmail,setPassword,setConfirmPassword,handleRegister,handlePasswordType,handleConfirmPasswordType,HandleBack} = useRegister();
  return (
    <div className={styles.container}>
        <div className={styles.card}>
            <div className={styles.backContainer}>
                <button onClick={HandleBack} className={styles.backButton}>
                    <IoArrowBack />
                </button>
            </div>

            <img src={plantIcon} alt="Company Logo" className={styles.logo}/>
            <h3>Sign up</h3>
            { error && (
                <SharedError 
                variant="inline"
                //message={error}
                //onRetry={handleRegister}
                />
            )}
            <AuthForm 
                classNameForm={styles.form}
                classNameFormGroup={styles.formGroup}
                classNamePasswordInputContainer={styles.passwordInputContainer}
                HandleLogin={handleRegister}
                classNameInput={styles.input}
                classNameError={styles.error}
                classNameButton={styles.button}
                loading={loading}
                buttonName='Sign up'
                //fields
                fields={[
                    {
                        name: 'email',
                        type: 'email',
                        placeholder: 'email',
                        value:email,
                        HandleChange:(e) => setEmail(e.target.value),
                        validationError:validationError.email,
                        isRequired:true,
                    },
                    {
                        name: 'password',
                        type: passwordType,
                        placeholder: 'Password',
                        value:password,
                        HandleChange:(e) => setPassword(e.target.value),
                        validationError:validationError.password,
                        isRequired:true,
                        isPasswordType:true,
                        classNamePasswordToogleIcon:styles.passwordToogleIcon,
                        passwordType:passwordType,
                        HandlePasswordType:handlePasswordType
                    },
                    {
                        name: 'confirmPassword',
                        type: confirmPasswordType,
                        placeholder: 'Password',
                        value:confirmPassword,
                        HandleChange:(e) => setConfirmPassword(e.target.value),
                        validationError:validationError.confirmPassword,
                        isRequired:true,
                        isPasswordType:true,
                        classNamePasswordToogleIcon:styles.passwordToogleIcon,
                        passwordType:confirmPasswordType,
                        HandlePasswordType:handleConfirmPasswordType
                    }
                ]}
            />
        </div>
    </div>
  )
}
export default RegisterPage; 
