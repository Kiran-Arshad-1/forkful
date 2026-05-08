import useAuthStore from '../store/authStore';

// Thin hook so components import from hooks/ rather than store/ directly.
const useAuth = () => useAuthStore();

export default useAuth;
