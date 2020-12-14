export default class CookieStore {
    public static Read(key: string): object {
        let match = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        if (!match) return undefined;
        try {
            return JSON.parse(decodeURIComponent(atob(match[2])));
        } catch {
            return undefined;
        }
    }

    public static Write(key: string, value: object): void {
        let encodedObject = btoa(encodeURIComponent(JSON.stringify(value)));
        document.cookie = key + "=" + encodedObject + ";path=/;expires=" + new Date(Date.now() + 31536000000);
    }

    public static Delete(key: string): void {
        document.cookie = key + "=" + ";path=/;expires=" + new Date(Date.now() - 60000);
    }
}
