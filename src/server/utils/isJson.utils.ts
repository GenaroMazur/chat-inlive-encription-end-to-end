export function isJSON(obj: string) {
    try {
        JSON.parse(obj);
    } catch (e) {
        return false;
    }
    return true;
}