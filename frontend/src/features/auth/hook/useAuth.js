import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError, clearUser } from "../auth.slice";

export function useAuth() {

    const dispatch = useDispatch()

    async function handleRegister({ email, username, password }) {
        try {
            dispatch(setLoading(true))
            const data = await register({ email, username, password })
            dispatch(setUser(data.user))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
            throw error
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true))
            const data = await login({ email, password })
            dispatch(setUser(data.user))
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Login failed"))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            // 401 is expected if user is not logged in - don't show as error
            if (err.response?.status !== 401) {
                dispatch(setError(err.response?.data?.message || "Failed to fetch user data"))
            }
            // Don't throw - it's expected behavior if not logged in
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {  // ✅ logout function
        try {
            dispatch(setLoading(true))
            await logout()
            dispatch(clearUser())
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Logout failed"))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,  // ✅ export kiya
    }
}