import { Link } from 'react-router-dom';
import styles from "../../../styles/features/auth/pages/AuthPage.module.scss";
import Spinner from '../../../shared/components/Spinner';
import SharedError from '../../../shared/components/SharedError';
import { useLogin } from '../hooks/useLogin';
import plantIcon from '../../../assets/plant-logo.png'
import CustomInput from '../../../shared/components/CustomInput';


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
                <form className={styles.form}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleLogin();
                    }}
                    >
                    <CustomInput 
                        classNameFormGroup={styles.formGroup}
                        classNameInput={styles.input}
                        classNameError={styles.error}
                        type="email"
                        placeholder='Email'
                        value={email}
                        HandleChange={(e)=> setEmail(e.target.value)}
                        isRequired={true}
                        validationError={validationErrors.email}
                    />
                    <div className={styles.formGroup}>
                        <CustomInput 
                            classNameFormGroup={styles.passwordInputContainer}
                            classNameInput={styles.input}
                            classNameError={styles.error}
                            type={passwordType}
                            placeholder='Password'
                            value={password}
                            HandleChange={(e)=> setPassword(e.target.value)}
                            isRequired={true}
                            validationError={validationErrors.password}
                            isPasswordType={true}
                            passwordType={passwordType}
                            classNamePasswordToogleIcon={styles.passwordToogleIcon}
                            HandlePasswordType={handlePasswordType}
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={loading} onClick={handleLogin}>
                        {loading ? <Spinner />: 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
}
export default LoginPage;