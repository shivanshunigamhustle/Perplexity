import { RouterProvider } from "react-router"
import { router } from "./app.routes"
import { useAuth } from "../features/auth/hook/useAuth"
import { useEffect } from "react"
function App() {

   const auth = useAuth()

  useEffect(() => {
    // Try to fetch user data if already logged in
    auth.handleGetMe()
  }, [])
  return <RouterProvider router={router} />
}

export default App
