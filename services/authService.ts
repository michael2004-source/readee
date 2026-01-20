
// NOTE: This is a simple, non-secure authentication service for demonstration purposes.
// It uses localStorage and stores passwords in plaintext. Do not use in production.

const USERS_KEY = 'interactive_reader_users';
const CURRENT_USER_KEY = 'interactive_reader_current_user';

const getUsers = (): Record<string, string> => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
};

const saveUsers = (users: Record<string, string>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const signUp = (email: string, password: string): { success: boolean; message: string } => {
    const users = getUsers();
    if (users[email]) {
        return { success: false, message: 'User with this email already exists.' };
    }
    users[email] = password; // In a real app, hash the password!
    saveUsers(users);
    return { success: true, message: 'Sign up successful! You can now log in.' };
};

export const logIn = (email: string, password: string): { success: boolean; message: string } => {
    const users = getUsers();
    if (!users[email] || users[email] !== password) {
        return { success: false, message: 'Invalid email or password.' };
    }
    localStorage.setItem(CURRENT_USER_KEY, email);
    return { success: true, message: 'Login successful!' };
};

export const logOut = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): string | null => {
    return localStorage.getItem(CURRENT_USER_KEY);
};
