const HN_VERSION = 'v0';
const HN_API_BASE_URL = 'https://hacker-news.firebaseio.com';

const api = {
    fetch(endpoint, options) {
        return fetch(`${HN_API_BASE_URL}/${HN_VERSION}${endpoint}`, options);
    }
};

export default api;