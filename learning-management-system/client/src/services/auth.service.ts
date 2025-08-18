import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface User {
    id: string;
    username: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    token: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role?: 'student' | 'instructor';
}

class AuthService {
    private static instance: AuthService;
    private currentUser: User | null = null;

    private constructor() {
        // Load user from localStorage on initialization
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
            } catch (error) {
                localStorage.removeItem('user');
            }
        }
    }

    async googleLogin(credential: string): Promise<User> {
        try {
            const response = await axios.post(`${API_URL}/auth/google`, { credential });
            const user = response.data;
            this.setCurrentUser(user);
            return user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async login(credentials: LoginCredentials): Promise<User> {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, credentials);
            const user = response.data;
            this.setCurrentUser(user);
            return user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async register(data: RegisterData): Promise<User> {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, data);
            const user = response.data;
            this.setCurrentUser(user);
            return user;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    logout(): void {
        localStorage.removeItem('user');
        this.currentUser = null;
        // Optional: Clear any other stored data
        localStorage.removeItem('lastCourse');
        localStorage.removeItem('courseProgress');
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    isAuthenticated(): boolean {
        return !!this.currentUser && !!this.currentUser.token;
    }

    hasRole(role: string): boolean {
        return this.currentUser?.role === role;
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        try {
            const response = await axios.put(
                `${API_URL}/auth/profile`,
                data,
                {
                    headers: this.getAuthHeader()
                }
            );
            const updatedUser = { ...this.currentUser, ...response.data };
            this.setCurrentUser(updatedUser);
            return updatedUser;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        try {
            await axios.post(
                `${API_URL}/auth/change-password`,
                { oldPassword, newPassword },
                {
                    headers: this.getAuthHeader()
                }
            );
        } catch (error) {
            throw this.handleError(error);
        }
    }

    private setCurrentUser(user: User): void {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    private getAuthHeader() {
        return this.currentUser?.token
            ? { Authorization: `Bearer ${this.currentUser.token}` }
            : {};
    }

    private handleError(error: any): Error {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'An error occurred';
            if (error.response?.status === 401) {
                this.logout(); // Clear invalid session
            }
            return new Error(message);
        }
        return error;
    }
}

export const authService = AuthService.getInstance();
export default authService;