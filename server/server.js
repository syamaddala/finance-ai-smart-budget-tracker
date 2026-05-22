const express=require("express")
const cors=require("cors")
require("dotenv").config()

const db=require("./db/db")

const authRoutes=
require("./routes/authRoutes")

const transactionRoutes=
require("./routes/transactionRoutes")

const aiRoutes=
require("./routes/aiRoutes")

const salaryRoutes=
require("./routes/salaryRoutes")

const budgetRoutes=
require("./routes/budgetRoutes")

const app=express()

// middleware FIRST
app.use(cors())
app.use(express.json())

// routes AFTER middleware
app.use(
"/api/auth",
authRoutes
)

app.use(
"/api/transactions",
transactionRoutes
)

app.use(
"/api/ai",
aiRoutes
)

app.use(
"/api/salary",
salaryRoutes
)

app.use(
"/api/budgets",
budgetRoutes
)

app.get("/",(req,res)=>{
res.send("Finance Tracker API Running")
})

const PORT=
process.env.PORT||5000

app.listen(PORT,()=>{
console.log(
`Server running on port ${PORT}`
)
})