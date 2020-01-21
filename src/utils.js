export const isValidUrl = (url) => {

    if (url === undefined) return false;

    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}
export const extractDomain = url => url !== undefined ? new URL(url).host : ''

export const timeSince = (date) => {

    const seconds = Math.floor(((new Date().getTime() / 1000) - parseInt(date)));
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) return interval + "y";

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + "m";

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + "d";

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "h";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + "m ";

    return Math.floor(seconds) + "s";
}