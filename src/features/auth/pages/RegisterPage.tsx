import styles from "./AuthPage.module.css";
import Spinner from "../../../shared/components/Spinner";
import SharedError from "../../../shared/components/SharedError";
import useRegister from "../hooks/useRegister";

const RegisterPage = () => {
    const {email,password,loading,error,validationError,setEmail,setPassword,handleRegister} = useRegister();
  return (
    <div className={styles.container}>
        <h2 className={styles.title}>Register</h2>
        { error && (
            <SharedError 
            message={error}
            onRetry={handleRegister}
            variant="inline"
            />
        )}
        <form className={styles.form}
            onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
            }}
            >
            <div className={styles.formGroup}>
                <input 
                    className={styles.input}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                { validationError.email && (
                    <p className={styles.error}>
                      {validationError.email}  
                    </p>
                )}
            </div>
            <div className={styles.formGroup}>
                <input 
                    className={styles.input}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                { validationError.password && (
                    <p className={styles.error}>
                        {validationError.password}
                    </p>
                )}
            </div>
            <button type='submit' className={styles.button} disabled={loading} onClick={handleRegister}>{loading ? <Spinner />: 'Register'}</button>
        </form>
    </div>
  )
}
export default RegisterPage; 
