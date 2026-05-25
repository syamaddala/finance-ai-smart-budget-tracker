const db = require("../db/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        const [result] = await db.query(
            "SELECT * FROM users WHERE email=?",
            [email]
        )

        if (result.length > 0) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        const hashedPassword =
            await bcrypt.hash(password, 10)

        await db.query(
            `INSERT INTO users
            (name,email,password)
            VALUES(?,?,?)`,
            [name, email, hashedPassword]
        )

        res.status(201).json({
            message: "User Registered Successfully"
        })

    } catch (error) {
        console.log(error)

        res.status(500).json({
            message: "Server Error"
        })
    }
}


// Login
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body

        const [result] = await db.query(
            "SELECT * FROM users WHERE email=?",
            [email]
        )

        if (result.length === 0) {
            return res.status(400).json({
                message: "User not found"
            })
        }

        const user = result[0]

        const comparePassword =
            await bcrypt.compare(
                password,
                user.password
            )

        if (!comparePassword) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.json({
            token,
            message: "Login Success"
        })

    } catch (error) {

        console.log(error)

        res.status(500).json({
            message: "Server Error"
        })
    }
}

module.exports = {
    registerUser,
    loginUser
}