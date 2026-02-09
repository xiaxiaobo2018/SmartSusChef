import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    setAuthToken,
    getAuthToken,
    authApi,
    LoginRequest,
    RegisterRequest,
} from '../api';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('api service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
        setAuthToken(null); // Clear token in memory
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Token Management', () => {
        describe('setAuthToken', () => {
            it('should store token in memory and localStorage', () => {
                const token = 'test-token-123';
                setAuthToken(token);

                expect(localStorageMock.getItem('smartsus-token')).toBe(token);
                expect(getAuthToken()).toBe(token);
            });

            it('should remove token when set to null', () => {
                setAuthToken('test-token');
                expect(getAuthToken()).toBe('test-token');

                setAuthToken(null);
                expect(getAuthToken()).toBeNull();
                expect(localStorageMock.getItem('smartsus-token')).toBeNull();
            });

            it('should overwrite existing token', () => {
                setAuthToken('old-token');
                setAuthToken('new-token');

                expect(getAuthToken()).toBe('new-token');
                expect(localStorageMock.getItem('smartsus-token')).toBe('new-token');
            });
        });

        describe('getAuthToken', () => {
            it('should retrieve token from localStorage if not in memory', () => {
                localStorageMock.setItem('smartsus-token', 'stored-token');

                const token = getAuthToken();
                expect(token).toBe('stored-token');
            });

            it('should return null if no token exists', () => {
                const token = getAuthToken();
                expect(token).toBeNull();
            });

            it('should return memory token without checking localStorage', () => {
                setAuthToken('memory-token');
                localStorageMock.setItem('smartsus-token', 'storage-token');

                const token = getAuthToken();
                expect(token).toBe('memory-token');
            });
        });
    });

    describe('authApi', () => {
        describe('login', () => {
            it('should send POST request with credentials', async () => {
                const mockResponse = {
                    token: 'auth-token-123',
                    user: {
                        id: 'user-1',
                        username: 'testuser',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'manager',
                        status: 'Active',
                    },
                    storeSetupRequired: false,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockResponse,
                });

                const loginData: LoginRequest = {
                    username: 'testuser',
                    password: 'password123',
                };

                const result = await authApi.login(loginData);

                expect(mockFetch).toHaveBeenCalledTimes(1);
                expect(mockFetch).toHaveBeenCalledWith(
                    expect.stringContaining('/auth/login'),
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify(loginData),
                        headers: expect.objectContaining({
                            'Content-Type': 'application/json',
                        }),
                    })
                );
                expect(result).toEqual(mockResponse);
            });

            it('should throw error on failed login', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                    json: async () => ({ message: 'Invalid credentials' }),
                });

                const loginData: LoginRequest = {
                    username: 'testuser',
                    password: 'wrongpassword',
                };

                await expect(authApi.login(loginData)).rejects.toThrow('Unauthorized');
            });

            it('should include auth token in header if available', async () => {
                setAuthToken('existing-token');

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ token: 'new-token', user: {} }),
                });

                await authApi.login({ username: 'user', password: 'pass' });

                expect(mockFetch).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            Authorization: 'Bearer existing-token',
                        }),
                    })
                );
            });
        });

        describe('register', () => {
            it('should send POST request with registration data', async () => {
                const mockResponse = {
                    token: 'new-auth-token',
                    user: {
                        id: 'user-2',
                        username: 'newuser',
                        name: 'New User',
                        email: 'new@example.com',
                        role: 'employee',
                        status: 'Active',
                    },
                    storeSetupRequired: true,
                };

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockResponse,
                });

                const registerData: RegisterRequest = {
                    username: 'newuser',
                    password: 'password123',
                    name: 'New User',
                    email: 'new@example.com',
                };

                const result = await authApi.register(registerData);

                expect(mockFetch).toHaveBeenCalledTimes(1);
                expect(mockFetch).toHaveBeenCalledWith(
                    expect.stringContaining('/auth/register'),
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify(registerData),
                    })
                );
                expect(result).toEqual(mockResponse);
            });

            it('should handle validation errors', async () => {
                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 400,
                    json: async () => ({
                        title: 'Validation Error',
                        errors: {
                            Username: ['Username is already taken'],
                            Email: ['Invalid email format'],
                        },
                    }),
                });

                const registerData: RegisterRequest = {
                    username: 'duplicate',
                    password: 'pass',
                    name: 'User',
                    email: 'invalid',
                };

                await expect(authApi.register(registerData)).rejects.toThrow();
            });
        });

        describe('getCurrentUser', () => {
            it('should fetch current user with auth token', async () => {
                const mockUser = {
                    id: 'user-1',
                    username: 'testuser',
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'manager',
                    status: 'Active',
                };

                setAuthToken('valid-token');

                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockUser,
                });

                const result = await authApi.getCurrentUser();

                expect(mockFetch).toHaveBeenCalledWith(
                    expect.stringContaining('/auth/me'),
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            Authorization: 'Bearer valid-token',
                        }),
                    })
                );
                expect(result).toEqual(mockUser);
            });

            it('should throw Unauthorized error on 401', async () => {
                setAuthToken('expired-token');

                mockFetch.mockResolvedValueOnce({
                    ok: false,
                    status: 401,
                    json: async () => ({ message: 'Token expired' }),
                });

                await expect(authApi.getCurrentUser()).rejects.toThrow('Unauthorized');

                // Token should be cleared on 401
                expect(getAuthToken()).toBeNull();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle 403 Forbidden response', async () => {
            setAuthToken('valid-token');

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: async () => ({ message: 'Access denied' }),
            });

            await expect(authApi.getCurrentUser()).rejects.toThrow('Forbidden');
        });

        it('should handle 404 Not Found response', async () => {
            setAuthToken('valid-token');

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ message: 'Resource not found' }),
            });

            await expect(authApi.getCurrentUser()).rejects.toThrow('Resource not found');
        });

        it('should handle 500 Server Error response', async () => {
            setAuthToken('valid-token');

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ message: 'Internal server error' }),
            });

            await expect(authApi.getCurrentUser()).rejects.toThrow('Internal server error');
        });

        it('should handle network errors', async () => {
            setAuthToken('valid-token');

            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(authApi.getCurrentUser()).rejects.toThrow('Network error');
        });

        it('should handle malformed JSON response', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            });

            await expect(authApi.login({ username: 'user', password: 'pass' }))
                .rejects.toThrow();
        });

        it('should handle 204 No Content response', async () => {
            setAuthToken('valid-token');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
                json: async () => {
                    throw new Error('No content');
                },
            });

            // Assuming there's an API endpoint that returns 204
            // This tests the generic fetchWithAuth function
            const result = await authApi.getCurrentUser();
            expect(result).toEqual({});
        });
    });

    describe('Request Headers', () => {
        it('should include Content-Type: application/json', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ token: 'token', user: {} }),
            });

            await authApi.login({ username: 'user', password: 'pass' });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('should not include Authorization header when no token', async () => {
            setAuthToken(null);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ token: 'token', user: {} }),
            });

            await authApi.login({ username: 'user', password: 'pass' });

            const call = mockFetch.mock.calls[0];
            const headers = call[1].headers as Record<string, string>;

            expect(headers['Authorization']).toBeUndefined();
        });

        it('should include Authorization header when token exists', async () => {
            setAuthToken('test-token-456');

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({}),
            });

            await authApi.getCurrentUser();

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token-456',
                    }),
                })
            );
        });
    });
});
