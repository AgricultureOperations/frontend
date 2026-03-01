import { Link } from 'react-router-dom';
import styles from "./AuthPage.module.css";
import Spinner from '../../../shared/components/Spinner';
import SharedError from '../../../shared/components/SharedError';
import { useLogin } from '../hooks/useLogin';


const LoginPage = () => {
    const {email,password,loading,error,validationErrors,setEmail,setPassword,handleLogin} = useLogin();
    return (
        <div className={styles.container}>
            <h2 className={styles.title} >LoginPage</h2>
            {error && (<SharedError 
                message={error}
                onRetry={handleLogin}
                variant='inline'
            />)}
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
                        placeholder='Correo electrónico'
                        value={email}
                        onChange={(e)=> setEmail(e.target.value)}
                        required
                    />
                    {validationErrors.email && (
                        <p className={styles.error}>
                            {validationErrors.email}
                        </p>
                    )}
                </div>
                <div className={styles.formGroup}>
                    <input
                        className={styles.input}
                        type="password"
                        placeholder='Contraseña'
                        value={password}
                        onChange={(e)=> setPassword(e.target.value)}
                        required
                    />
                    {validationErrors.password && (
                        <p className={styles.error}>
                            {validationErrors.password}
                        </p>
                    )}
                </div>
                <button type="submit" className={styles.button} disabled={loading} onClick={handleLogin}>
                    {loading ? <Spinner />: 'Iniciar Sesión'}
                </button>
            </form>
            <p>
                Don't have an account?{" "}
                <Link to="/register">Register</Link>
            </p>
        </div>
    )
}
export default LoginPage;