interface SpinnerProps {
    size?: number;  // diameter in px
    color?: string; // spinner color
}

const Spinner = ({size = 20, color = "#ffffff"}:SpinnerProps) => {
  return (
    <div
        style={{
            width: size,
            height: size,
            border: `3px solid rgba(255,255,255,0.3)`,
            borderTop: `3px solid ${color}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
        }}
    />
  )
}
export default Spinner;