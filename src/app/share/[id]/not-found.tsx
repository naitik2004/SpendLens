import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#fafaf9",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      color: "#1a1714",
    }}>
      <p style={{ fontSize: 13, color: "#a09890", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
        404
      </p>
      <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
        Audit not found
      </h1>
      <p style={{ fontSize: 14, color: "#a09890", marginBottom: 8 }}>
        This link may have expired or been removed.
      </p>
      <Link href="/" style={{
        background: "#1a6b4a",
        color: "white",
        padding: "10px 22px",
        borderRadius: 99,
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
      }}>
        Run a new audit →
      </Link>
    </div>
  );
}