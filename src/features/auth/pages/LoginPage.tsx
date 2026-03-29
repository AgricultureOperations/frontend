import { Link } from 'react-router-dom';
import styles from "../../../styles/features/auth/pages/AuthPage.module.scss";
import Spinner from '../../../shared/components/Spinner';
import SharedError from '../../../shared/components/SharedError';
import { useLogin } from '../hooks/useLogin';
import plantIcon from '../../../assets/plant-logo.png'
import { FaEye, FaEyeSlash } from 'react-icons/fa';


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
                    <div className={styles.formGroup}>
                        <input
                            className={styles.input}
                            type="email"
                            placeholder='Email'
                            value={email}
                            onChange={(e)=> setEmail(e.target.value)}
                            required
                        />
                        <p className={styles.error}>
                            {validationErrors.email || ''}
                        </p>
                    </div>
                    <div className={styles.formGroup}>
                        <div className={styles.passwordInputContainer}>
                            <input
                                className={styles.input}
                                type={passwordType}
                                placeholder='Password'
                                value={password}
                                onChange={(e)=> setPassword(e.target.value)}
                                required
                            />
                            <span
                                className={styles.passwordToogleIcon}
                                onClick={handlePasswordType} 
                            >
                                {passwordType === 'text' ?<FaEye/>:<FaEyeSlash/>}
                            </span>
                        </div>
                        <p className={styles.error}>
                            {validationErrors.password || ''}
                        </p>
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