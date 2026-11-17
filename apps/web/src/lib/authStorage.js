
const TOKEN_KEY = 'sweety_token';
const USER_KEY = 'sweety_user';

export const authStorage = {
  getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const user = sessionStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
  },

  saveAuth(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearAuth() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};
