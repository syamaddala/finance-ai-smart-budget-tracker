import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const loginUser = async () => {

        try {

            const response =
                await api.post(
                    "/auth/login",
                    {
                        email,
                        password
                    }
                )

            localStorage.setItem(
                "token",
                response.data.token
            )

            navigate("/")

        } catch (error) {

            alert("Invalid credentials")

        }

    }

    return (

        <div className="auth-container">

            <div className="auth-box">

                <h1>Login</h1>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <button onClick={loginUser}>
                    Login
                </button>

                <p className="auth-text">
                    New user?
                    <span onClick={() => navigate("/register")}>
                        Register
                    </span>
                </p>

            </div>

        </div>

    )

}

export default Login