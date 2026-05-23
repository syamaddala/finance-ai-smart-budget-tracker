import {useState} from "react"
import {useNavigate} from "react-router-dom"
import api from "../services/api"

function Register(){

const [username,setUsername]=useState("")
const [email,setEmail]=useState("")
const [password,setPassword]=useState("")

const navigate=useNavigate()

const registerUser=async()=>{

try{

await api.post(
"/auth/register",
{
username,
email,
password
}
)

navigate("/login")

}catch(error){

alert("Registration failed")

}

}

return(

<div className="auth-container">

<div className="register-layout">

    <div className="register-info">

        <h1>💰 Finance AI</h1>

        <h2>Smart Budget Tracker</h2>

        <p>

            Track expenses, manage savings,
            analyze spending patterns and
            get AI-powered financial insights.

        </p>

        <div className="feature-box">

            <p>📊 Expense Analytics</p>

            <p>🤖 AI Predictions</p>

            <p>💸 Smart Budget Planning</p>

            <p>📈 Financial Health Score</p>

        </div>

    </div>

    <div className="auth-box">

        <h1>Create Account</h1>

        <p className="subtitle">
            Start managing your finances today
        </p>

        <input
            type="text"
            placeholder="Full Name"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
        />

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

        <button onClick={registerUser}>
            Create Account
        </button>

        <p className="auth-text">

            Already have an account?

            <span onClick={()=>navigate("/login")}>
                Login
            </span>

        </p>

    </div>

</div>

</div>

)

}

export default Register