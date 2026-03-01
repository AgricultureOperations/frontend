type errorVariante = "inline" | "page"
interface SharedErrorProps {
    message?: string;
    onRetry?: () => void;
    variant?: errorVariante
}

const SharedError = ({
    message= 'Something went wrong. Please try again.'
    ,onRetry
    ,variant = 'inline'}: SharedErrorProps) => {
        const isPage = variant === 'page';
  return (
    <div
        style={{
            padding: isPage ? "40px": "16px",
            margin: isPage? "40px auto": "16px 0",
            textAlign: "center",
            backgroundColor: "#ffeaea",
            color: "#b00020",
            borderRadius: "8px",
            maxWidth: isPage ? "400px" : "100%",
            border: "1px solid #ffb3b3"
        }}
    >
        <p
            style={{ marginBottom: "12px"}}
        >
            {message}
        </p>
        {onRetry && (
            <button
                onClick={onRetry}
                style={{
                    padding: "8px 16px",
                    backgroundColor: "#b00020",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}  
            >
                Retry
            </button>
        )}
    </div>
  )
}
export default SharedError;