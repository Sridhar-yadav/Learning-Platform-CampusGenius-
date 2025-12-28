// filepath: c:\Users\sridh\OneDrive\Documents\campus_study\campus-genius\lib\token.ts

// This function is no longer needed as we're using the token from the API response
export function createToken(user: { id: string; role: string }): string {
    // This is a placeholder function that should not be used
    console.warn('createToken function is deprecated. Use the token from the API response instead.');
    return '';
}

// Function to set the token in a cookie
export function setToken(token: string): void {
    document.cookie = `token=${token}; path=/`;
}

// Function to check if user is authenticated
export function isAuthenticated(): boolean {
    return document.cookie.includes('token=');
}

// Function to get the token from cookies (for client-side checks only)
export function getToken(): string | undefined {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
}

// Function to remove the token (for logout)
export function removeToken(): void {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}