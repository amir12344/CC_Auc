// Authentication feature barrel exports

// Store exports
export { authSlice, login, logout, setUserType } from './store/authSlice';
export {
  selectIsAuthenticated,
  selectUserType,
  selectAuthToken,
  selectAuthInfo,
  selectIsBuyer,
  selectIsSeller
} from './store/authSelectors';

// Component exports
export { LoginForm } from './components/LoginForm';

// Re-export auth slice as default for store configuration
export { default as authReducer } from './store/authSlice'; 