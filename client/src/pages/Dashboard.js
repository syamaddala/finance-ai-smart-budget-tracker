import {
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"
import {
    ResponsiveContainer
} from "recharts"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from "recharts"
import { useEffect, useState, useCallback } from "react"
import api from "../services/api"
import "../App.css"
import jsPDF from "jspdf"
import CountUp from "react-countup"

function Dashboard() {

    const [summary, setSummary] = useState({})
    const [transactions, setTransactions] = useState([])
    const [aiReply, setAIReply] = useState("")
    const [question, setQuestion] = useState("")
    const [reply, setReply] = useState("")
    const [search, setSearch] = useState("")
    const [filterType, setFilterType] = useState("")
    const [budget, setBudget] = useState({})
    const [budgets, setBudgets] = useState([])
    const [darkMode, setDarkMode] = useState(false)
    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState("expense")
    const [category, setCategory] = useState("")

    const token = localStorage.getItem("token")

    const askAI = () => {

        const questionText =
            question.toLowerCase()

        if (
            questionText.includes("spending")
            ||

            questionText.includes("expense")
        ) {

            setReply(
                smartAIReply()
            )

        }

        else if (
            questionText.includes("balance")
        ) {

            setReply(
                `Your current balance is ₹${summary.balance}`
            )

        }

        else {

            setReply(
                "Try asking about spending, expenses or balance"
            )

        }

    }

    const generatePDF = () => {

        const pdf = new jsPDF()
    
        // Use normal font
        pdf.setFont("helvetica", "normal")
    
        pdf.setFontSize(20)
        pdf.text(
            "Finance AI Report",
            20,
            20
        )
    
        pdf.setFontSize(12)
    
        // Replace ₹ with Rs
        pdf.text(
            `Income : Rs ${summary.totalIncome || 0}`,
            20,
            40
        )
    
        pdf.text(
            `Expense : Rs ${summary.totalExpense || 0}`,
            20,
            50
        )
    
        pdf.text(
            `Balance : Rs ${summary.balance || 0}`,
            20,
            60
        )
    
        pdf.line(
            20,
            70,
            180,
            70
        )
    
        pdf.setFontSize(14)
    
        pdf.text(
            "Transactions",
            20,
            85
        )
    
        let y = 100
    
        transactions.forEach((item,index)=>{
    
            const row =
    
            `${index+1}. ${item.title} | Rs ${item.amount} | ${item.type} | ${item.category}`
    
            pdf.text(
                row,
                20,
                y
            )
    
            y += 12
    
            if(y > 270){
    
                pdf.addPage()
    
                y = 20
    
            }
    
        })
    
        pdf.save(
            "FinanceReport.pdf"
        )
    
    }

    const fetchAI = useCallback(async () => {

        try {

            const response =
                await api.get(
                    "/ai/advice",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

            setAIReply(
                response.data.reply
            )

        } catch (error) {

            console.log(error)

        }

    }, [token])


    const fetchSummary = useCallback(async () => {

        try {

            const response = await api.get(
                "/transactions/summary",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setSummary(response.data)

        } catch (error) {
            console.log(error)
        }

    }, [token])

    const scrollToSection = (id) => {

        const section = document.getElementById(id)

        if (section) {

            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            })

        }

    }
    const fetchTransactions = useCallback(async () => {

        try {

            const response = await api.get(
                "/transactions/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setTransactions(response.data)

        } catch (error) {
            console.log(error)
        }

    }, [token])

    const fetchBudgets = useCallback(async () => {

        try {

            const response = await api.get(
                "/budgets/all",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setBudgets(response.data)

        } catch (error) {

            console.log(error)

        }

    }, [token])


    const fetchBudget = useCallback(async () => {

        try {

            const response =
                await api.get(
                    "/salary/budget",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

            setBudget(response.data)

        } catch (error) {

            console.log(error)

        }

    }, [token])

    const deleteTransaction = async (id) => {

        try {

            await api.delete(
                `/transactions/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            fetchSummary()
            fetchTransactions()

        } catch (error) {

            console.log(error)

        }

    }

    const addTransaction = async () => {

        if (
            title.trim() === "" ||
            amount === "" ||
            category.trim() === ""
        ) {

            alert("Please fill all fields")
            return
        }

        if (Number(amount) <= 0) {

            alert("Amount must be greater than 0")
            return
        }

        try {

            await api.post(
                "/transactions/add",
                {
                    title,
                    amount: Number(amount),
                    type,
                    category
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            setTitle("")
            setAmount("")
            setCategory("")

            fetchSummary()
            fetchTransactions()

        } catch (error) {

            console.log(error)

            alert(
                "Failed to add transaction"
            )

        }

    }
    useEffect(() => {

        fetchSummary()
        fetchTransactions()
        fetchBudgets()
        fetchBudget()
        fetchAI()

    }, [
        fetchSummary,
        fetchTransactions,
        fetchBudgets,
        fetchBudget,
        fetchAI
    ])

    const calculateSpent = (category) => {

        const total =

            transactions
                .filter(
                    (item) =>

                        item.category === category
                        &&

                        item.type === "expense"
                )

                .reduce(
                    (sum, item) =>

                        sum +
                        Number(item.amount),

                    0
                )

        return total

    }





    const healthScore = Math.max(

        0,

        Math.min(

            100,

            summary.totalIncome > 0

                ?

                Math.round(

                    ((summary.balance) /
                        summary.totalIncome) * 100

                )

                :

                0

        )

    )

    const categoryData = transactions
        .filter(item => item.type === "expense")
        .reduce((acc, item) => {

            const existing = acc.find(
                x => x.name === item.category
            )

            if (existing) {

                existing.value += Number(item.amount)

            } else {

                acc.push({
                    name: item.category,
                    value: Number(item.amount)
                })

            }

            return acc

        }, [])



    const COLORS = [
        "#0088FE",
        "#00C49F",
        "#FFBB28",
        "#FF8042",
        "#AF19FF",
        "#FF4560"
    ]
    const expenseTransactions =

        transactions.filter(
            (item) => item.type === "expense"
        )
    const totalExpense =

        expenseTransactions.reduce(
            (sum, item) =>
                sum + Number(item.amount),
            0
        )


    const nextMonthPrediction =
        Math.round(
            totalExpense * 1.1
        )
    const smartAIReply = () => {

        const expenseData = {}

        transactions
            .filter(
                (item) => item.type === "expense"
            )
            .forEach((item) => {

                if (expenseData[item.category]) {

                    expenseData[item.category] +=
                        Number(item.amount)

                } else {

                    expenseData[item.category] =
                        Number(item.amount)

                }

            })

        const highestCategory =

            Object.keys(expenseData)
                .reduce(

                    (a, b) =>

                        expenseData[a] >
                            expenseData[b]

                            ?

                            a

                            :

                            b

                )

        const highestAmount =

            expenseData[highestCategory]

        return `You spent ₹${highestAmount} on ${highestCategory}. This is your highest expense category. Consider reducing spending here.`

    }

    const monthlyData = [

        {
            month: "Week1",
            expense: totalExpense * 0.20,
            income: summary.totalIncome || 0
        },

        {
            month: "Week2",
            expense: totalExpense * 0.30,
            income: summary.totalIncome || 0
        },

        {
            month: "Week3",
            expense: totalExpense * 0.25,
            income: summary.totalIncome || 0
        },

        {
            month: "Week4",
            expense: totalExpense * 0.25,
            income: summary.totalIncome || 0
        }

    ]
    return (

        <div className={`dashboard ${darkMode ? "dark" : ""}`}>
            <div className="sidebar">

                <h1 className="logo">
                    Finance AI
                </h1>

                <div className="menu">
                    <p onClick={() => scrollToSection("dashboard")}>
                        📊 Dashboard
                    </p>

                    <p onClick={() => scrollToSection("analytics")}>
                        📈 Analytics
                    </p>

                    <p onClick={() => scrollToSection("transactions")}>
                        💳 Transactions
                    </p>

                    <p onClick={() => scrollToSection("assistant")}>
                        🤖 AI Assistant
                    </p>


                </div>

                <button
                    className="theme-btn"
                    onClick={() =>
                        setDarkMode(!darkMode)
                    }
                >
                    {darkMode ? "☀ Light" : "🌙 Dark"}
                </button>

            </div>


            <div className="content">

                <div className="header" id="dashboard">
                    <div>

                        <h1
                            style={{
                                margin: 0
                            }}
                        >
                            Finance Dashboard
                        </h1>

                        <p
                            style={{
                                color: "gray"
                            }}
                        >
                            Welcome back 👋 Manage your finances intelligently
                        </p>

                    </div>

                    <div className="top-controls">

                        <button
                            onClick={generatePDF}
                            style={{

                                padding: "12px 18px",
                                border: "none",
                                borderRadius: "12px",
                                background: "#3b82f6",
                                color: "white",
                                cursor: "pointer"

                            }}
                        >

                            📄 Download Report

                        </button>

                        <div className="notification">

                            🔔

                            <span className="notification-badge">

                                {transactions.length}

                            </span>

                        </div>

                        <div className="avatar">

                            {
                                localStorage
                                    .getItem("username")
                                    ?.charAt(0)
                                    ?.toUpperCase()

                                ||

                                "S"
                            }

                        </div>

                        <button

                            onClick={() => {

                                localStorage.removeItem(
                                    "token"
                                )

                                window.location.href = "/login"

                            }}

                            className="download-btn"
                        >

                            Logout

                        </button>

                    </div>

                </div>


                <div className="cards">

                    <div className={`card ${darkMode ? "dark-card" : ""}`}>
                        <h3>Income</h3>
                        <h2>

                            ₹

                            <CountUp
                                end={summary.totalIncome || 0}
                                duration={2}
                            />

                        </h2>
                    </div>

                    <div className={`card ${darkMode ? "dark-card" : ""}`}>
                        <h3>Expense</h3>
                        <h2>

                            ₹

                            <CountUp
                                end={summary.totalExpense || 0}
                                duration={2}
                            />

                        </h2>
                    </div>

                    <div className={`card ${darkMode ? "dark-card" : ""}`}>
                        <h3>Balance</h3>
                        <h2>

                            ₹

                            <CountUp
                                end={summary.balance || 0}
                                duration={2}
                            />

                        </h2>
                    </div>



                </div>
                <h2 className="section-title">
                    Smart Budget Allocation
                </h2>

                <div className="cards">

                    <div className="card">
                        <h3>Salary</h3>
                        <h2>₹{summary.totalIncome || 0}</h2>
                    </div>

                    <div className="card">
                        <h3>Needs (50%)</h3>
                        <h2>₹{Math.round((summary.totalIncome || 0) * 0.5)}</h2>
                    </div>

                    <div className="card">
                        <h3>Wants (30%)</h3>
                        <h2>₹{Math.round((summary.totalIncome || 0) * 0.3)}</h2>
                    </div>

                    <div className="card">
                        <h3>Savings (20%)</h3>
                        <h2>₹{Math.round((summary.totalIncome || 0) * 0.2)}</h2>
                    </div>

                </div>
                <h2 style={{ marginTop: "40px" }}>
                    Budget Limits
                </h2>

                <div className="cards">

                    {
                        budgets.map((item) => {

                            const spent =
                                calculateSpent(
                                    item.category
                                )

                            const percent =

                                item.monthly_limit > 0

                                    ?

                                    (spent / item.monthly_limit) * 100

                                    :

                                    0



                            return (

                                <div
                                    className="card"

                                    style={{

                                        background:

                                            darkMode

                                                ?

                                                "#1e293b"

                                                :

                                                "white",

                                        color:

                                            darkMode

                                                ?

                                                "white"

                                                :

                                                "black"

                                    }}
                                    key={item.id}
                                >

                                    <h3>
                                        {item.category}
                                    </h3>

                                    <p>

                                        Spent: ₹{spent}

                                    </p>

                                    <p>

                                        Limit: ₹{JSON.stringify(item.monthly_limit)}

                                    </p>

                                    <div
                                        style={{

                                            height: "10px",
                                            background: "#ddd",
                                            borderRadius: "10px",
                                            overflow: "hidden"

                                        }}
                                    >

                                        <div
                                            style={{

                                                width: `${Math.min(percent, 100)}%`,

                                                height: "100%",

                                                background:

                                                    percent > 100

                                                        ?

                                                        "red"

                                                        :

                                                        percent > 80

                                                            ?

                                                            "orange"

                                                            :

                                                            "green"

                                            }}

                                        >

                                        </div>

                                    </div>

                                    {



                                        <div>

                                            {

                                                spent >

                                                    item.monthly_limit

                                                    ?

                                                    <div style={{ color: "red" }}>

                                                        ⚠ Budget exceeded by
                                                        ₹{spent - item.monthly_limit}

                                                    </div>

                                                    :

                                                    spent >

                                                        item.monthly_limit * 0.8

                                                        ?

                                                        <div style={{ color: "orange" }}>

                                                            ⚡ Near budget limit

                                                        </div>

                                                        :

                                                        <div style={{ color: "green" }}>

                                                            ✅ Budget healthy

                                                        </div>

                                            }

                                        </div>

                                    }

                                </div>

                            )

                        })
                    }

                </div>
                <h2 style={{ marginTop: "40px" }}>
                    Financial Health
                </h2>

                <div className="cards">

                    <div className={`card ${darkMode ? "dark-card" : ""}`}>

                        <h3>Health Score</h3>

                        <h1>
                            {healthScore}%
                        </h1>

                        {
                            healthScore > 70
                                ?

                                <p>🟢 Excellent</p>

                                :

                                healthScore > 40

                                    ?

                                    <p>🟡 Moderate</p>

                                    :

                                    <p>🔴 Risk Zone</p>
                        }

                    </div>

                </div>
                <h2 style={{ marginTop: "40px" }}>
                    AI Prediction
                </h2>

                <div className="cards">

                    <div className={`card ${darkMode ? "dark-card" : ""}`}>

                        <h3>
                            Predicted Next Month Expense
                        </h3>

                        <h1>
                            ₹{nextMonthPrediction}
                        </h1>

                        {

                            nextMonthPrediction >

                                summary.balance

                                ?

                                <p>
                                    ⚠ Expenses may exceed current balance
                                </p>

                                :

                                <p>
                                    ✅ Current spending pattern looks healthy
                                </p>

                        }

                    </div>

                </div>
                <h2 className="section-title">
                    Expense Categories
                </h2>

                <div className={`ai-box ${darkMode ? "dark-card" : ""}`}>

                    <ResponsiveContainer
                        width="100%"
                        height={400}
                    >

                        <PieChart>

                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                dataKey="value"
                                label={({ name, value }) =>
                                    `${name}: ${value}`
                                }
                            >

                                {
                                    categoryData.map(
                                        (
                                            entry,
                                            index
                                        ) => (

                                            <Cell
                                                key={index}
                                                fill={
                                                    COLORS[
                                                    index %
                                                    COLORS.length
                                                    ]
                                                }
                                            />

                                        )
                                    )
                                }

                            </Pie>

                            <Tooltip
                                contentStyle={{
                                    backgroundColor:
                                        darkMode
                                            ? "#1e293b"
                                            : "#ffffff",

                                    border: "none",

                                    borderRadius: "12px",

                                    color:
                                        darkMode
                                            ? "#ffffff"
                                            : "#000000"
                                }}
                            />

                            <Legend
                                wrapperStyle={{
                                    color:
                                        darkMode
                                            ? "#ffffff"
                                            : "#000000"
                                }}
                            />

                        </PieChart>

                    </ResponsiveContainer>

                </div>
                <h2 className="section-title" id="analytics"> 
                    Monthly Analytics
                </h2>

                <div className={`ai-box ${darkMode ? "dark-card" : ""}`}>

                    <ResponsiveContainer
                        width="100%"
                        height={400}
                    >

                        <LineChart
                            data={monthlyData}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={
                                    darkMode
                                        ? "#475569"
                                        : "#d1d5db"
                                }
                            />

                            <XAxis
                                dataKey="month"
                                stroke={
                                    darkMode
                                        ? "#ffffff"
                                        : "#000000"
                                }
                            />

                            <YAxis
                                stroke={
                                    darkMode
                                        ? "#ffffff"
                                        : "#000000"
                                }
                            />

                            <Tooltip
                                contentStyle={{
                                    backgroundColor:
                                        darkMode
                                            ? "#1e293b"
                                            : "#ffffff",

                                    border: "none",

                                    borderRadius: "12px",

                                    color:
                                        darkMode
                                            ? "#ffffff"
                                            : "#000000"
                                }}
                            />

                            <Legend
                                wrapperStyle={{
                                    color:
                                        darkMode
                                            ? "#ffffff"
                                            : "#000000"
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="expense"
                                stroke="#ff4d4d"
                                strokeWidth={3}
                            />

                            <Line
                                type="monotone"
                                dataKey="income"
                                stroke="#22c55e"
                                strokeWidth={3}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

                <h2 style={{ marginTop: "40px" }} id="assistant">
                    AI Assistant
                </h2>

                <div className="ai-box ai">

                    <p>{aiReply}</p>

                </div>


                <h2 style={{ marginTop: "40px" }}>
                    Ask AI
                </h2>

                <div className="ai-box">

                    <input
                        placeholder="Ask something..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        style={{
                            width: "400px",
                            padding: "10px"
                        }}
                    />

                    <button
                        onClick={askAI}
                        style={{
                            marginLeft: "10px",
                            padding: "10px",
                            cursor: "pointer"
                        }}
                    >
                        Ask
                    </button>

                    <div
                        style={{
                            marginTop: "20px"
                        }}
                    >

                        <p>{reply}</p>

                    </div>

                </div>


                <div className="ai" id="transactions">

                    <h2>
                        Add Transaction
                    </h2>

                </div>

                <div className="add-transaction">

                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >

                        <option value="expense">
                            Expense
                        </option>

                        <option value="income">
                            Income
                        </option>

                    </select>

                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />

                    <button
                        onClick={addTransaction}
                    >
                        Add
                    </button>

                </div>

                <h2 style={{ marginTop: "40px" }}>
                    Transactions
                </h2>

                <div
                    className="ai-box"
                    style={{
                        marginBottom: "20px"
                    }}
                >

                    <input
                        placeholder="Search transaction..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: "10px",
                            width: "250px"
                        }}
                    />

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{
                            marginLeft: "10px",
                            padding: "10px"
                        }}
                    >

                        <option value="">
                            All
                        </option>

                        <option value="income">
                            Income
                        </option>

                        <option value="expense">
                            Expense
                        </option>

                    </select>

                </div>


                {

                    transactions

                        .filter((item) => {

                            return (

                                (item.title || "")
                                    .toLowerCase()
                                    .includes(
                                        search.toLowerCase()
                                    )

                                &&

                                (
                                    filterType === ""

                                    ||

                                    item.type === filterType
                                )

                            )

                        })

                        .map((item) => (

                            <div
                                className={`transaction-card ${item.type}`}>

                                <h3>{item.title}</h3>

                                <p>
                                    ₹{item.amount}
                                </p>

                                <p>
                                    {item.type}
                                </p>

                                <p>
                                    {item.category}
                                </p>

                                <p>

                                    {new Date(
                                        item.created_at
                                    ).toLocaleDateString()}

                                </p>

                                <button

                                    onClick={() =>
                                        deleteTransaction(item.id)
                                    }

                                    style={{

                                        padding: "8px",
                                        cursor: "pointer"

                                    }}

                                >

                                    Delete

                                </button>

                            </div>

                        ))

                }

            </div>

        </div>

    )

}

export default Dashboard