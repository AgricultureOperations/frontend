import { Link } from 'react-router-dom';
import styles from "../../../styles/features/auth/pages/AuthPage.module.scss";
import SharedError from '../../../shared/components/SharedError';
import { useLogin } from '../hooks/useLogin';
import plantIcon from '../../../assets/plant-logo.png'
import LoginForm from '../components/LoginForm';


const LoginPage = () => {
    const {email,password,passwordType,loading,error,validationErrors,setEmail,setPassword,handleLogin,handlePasswordType} = useLogin();
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <img src={plantIcon} alt="Company Logo" className={styles.logo}/>
                <h3>Sign in</h3>
                {error && (<SharedError 
                    variant='inline'
                    message={error}
                    //onRetry={handleLogin}
                />)}
                <p>
                    Don't have an account yet?{" "}
                    <Link to="/register">Sign up Here</Link>
                </p>
                <LoginForm 
                    classNameForm={styles.form}
                    classNameFormGroup={styles.formGroup}
                    classNamePasswordInputContainer={styles.passwordInputContainer}
                    HandleLogin={handleLogin}
                    classNameInput={styles.input}
                    classNameError={styles.error}
                    classNameButton={styles.button}
                    loading={loading}
                    //fields
                    fields={[
                        {
                            type: 'email',
                            placeholder: 'email',
                            value:email,
                            HandleChange:(e) => setEmail(e.target.value),
                            validationError:validationErrors.email,
                            isRequired:true,
                        },
                        {
                            type: passwordType,
                            placeholder: 'Password',
                            value:password,
                            HandleChange:(e) => setPassword(e.target.value),
                            validationError:validationErrors.password,
                            isRequired:true,
                            isPasswordType:true,
                            classNamePasswordToogleIcon:styles.passwordToogleIcon,
                            passwordType:passwordType,
                            HandlePasswordType:handlePasswordType
                        }
                    ]}
                />
            </div>
        </div>
    )
}
export default LoginPage;