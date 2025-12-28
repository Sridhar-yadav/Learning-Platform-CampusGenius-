import { getToken } from './token';

export function getClientToken() {
    return getToken();
}

export function isAuthenticated() {
    return !!getClientToken();
}

export function logout() {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/login';
}