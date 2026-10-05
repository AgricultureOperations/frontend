// Fallback display name until GET /auth/me (which carries `name`) has loaded, or if it fails.
// Derived from the email's local part instead of decoding the JWT, per the
// "no client-side JWT decoding for UI info" rule (architecture.md).
export const getDisplayNameFromEmail = (email: string | null): string => {
    if (!email) return "";
    const localPart = email.split("@")[0];
    return localPart
        .split(/[._-]+/)
        .filter(Boolean)
        .join(" ");
};

export const getInitials = (displayName: string): string => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
