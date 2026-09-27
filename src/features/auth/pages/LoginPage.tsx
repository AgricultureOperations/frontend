import { Link } from 'react-router-dom';
import { FiLogIn, FiMoon, FiSun } from 'react-icons/fi';
import styles from "../../../styles/features/auth/pages/LoginPage.module.scss";
import SharedError from '../../../shared/components/SharedError';
import { useLogin } from '../hooks/useLogin';
import { useTheme } from '../../../shared/hooks/useTheme';
import plantIcon from '../../../assets/plant-logo.png'
import AuthForm from '../components/AuthForm';


const LoginPage = () => {
    const {email,password,passwordType,loading,error,validationErrors,setEmail,setPassword,handleLogin,handlePasswordType} = useLogin();
    const {theme,toggleTheme} = useTheme();
    const isDark = theme === 'dark';
    return (
        <div className={styles.container} data-theme={theme}>
            <div className={styles.card}>
                <button
                    type="button"
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
                </button>
                <div className={styles.header}>
                    <img src={plantIcon} alt="Company Logo" className={styles.logo}/>
                    <h1 className={styles.title}>Sign in</h1>
                    <p className={styles.subtitle}>
                        Don't have an account yet?{" "}
                        <Link to="/register" className={styles.link}>Sign up here</Link>
                    </p>
                </div>
                {error && (<SharedError
                    variant='inline'
                    message={error}
                    //onRetry={handleLogin}
                />)}
                <AuthForm
                    classNameForm={styles.form}
                    classNameFormGroup={styles.formGroup}
                    classNamePasswordInputContainer={styles.passwordInputContainer}
                    HandleLogin={handleLogin}
                    classNameInput={styles.input}
                    classNameLabel={styles.label}
                    classNameError={styles.error}
                    classNameButton={styles.button}
                    loading={loading}
                    buttonName='Sign in'
                    buttonIcon={<FiLogIn aria-hidden />}
                    //fields
                    fields={[
                        {
                            name: 'email',
                            type: 'email',
                            label: 'Email',
                            placeholder: 'Enter your email',
                            value:email,
                            HandleChange:(e) => setEmail(e.target.value),
                            validationError:validationErrors.email,
                            isRequired:true,
                        },
                        {
                            name: 'password',
                            type: passwordType,
                            label: 'Password',
                            placeholder: 'Enter your password',
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
