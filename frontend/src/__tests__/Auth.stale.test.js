import { describe, it, expect } from 'vitest';
import authReducer, { loginSuccess, logout } from '../store/authSlice';

describe('TC-PRA-002: Stale State Invalidation', () => {
  it('should clear all user data upon logout', () => {
    const initialState = {
      user: { id: 1, name: 'Alice', role: 'customer' },
      token: 'token-123',
      isAuthenticated: true,
      loading: false,
      error: null
    };

    const action = logout();
    const nextState = authReducer(initialState, action);

    expect(nextState.user).toBeNull();
    expect(nextState.token).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
  });

  it('should initialize completely isolated state when logging in as a different user', () => {
    // Initial user logs out
    const initialState = {
      user: { id: 1, name: 'Alice', role: 'customer' },
      token: 'token-123',
      isAuthenticated: true,
      loading: false,
      error: null
    };

    const loggedOutState = authReducer(initialState, logout());
    
    // New user logs in
    const newUser = { id: 2, name: 'Bob', role: 'customer' };
    const newToken = 'token-456';
    const loggedInState = authReducer(loggedOutState, loginSuccess({ user: newUser, token: newToken }));

    expect(loggedInState.user).toEqual(newUser);
    expect(loggedInState.token).toEqual('token-456');
    expect(loggedInState.user.name).not.toBe('Alice');
    expect(loggedInState.isAuthenticated).toBe(true);
  });
});
