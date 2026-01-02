type ValidCredentials = {
    username: string;
    password: string;
};

export function isValidCredentials(
    credentials: unknown
): credentials is ValidCredentials {
    return (
        typeof credentials === "object" &&
        credentials !== null &&
        "username" in credentials &&
        "password" in credentials &&
        typeof (credentials as { username: unknown }).username === "string" &&
        typeof (credentials as { password: unknown }).password === "string"
    );
}
