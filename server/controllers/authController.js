const db = require("../db/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Signup
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Check existing user
        const checkQuery =
            "SELECT * FROM users WHERE email=?"

        db.query(checkQuery, [email], async (err, result) => {

            if (err) {
                return res.status(500).json(err)
            }

            if (result.length > 0) {
                return res.status(400).json({
                    message: "User already exists"
                })
            }

            // Hash password
            const hashedPassword =
                await bcrypt.hash(password, 10)

            const insertQuery =
                `INSERT INTO users
                (name,email,password)
                VALUES(?,?,?)`

            db.query(
                insertQuery,
                [name,email,hashedPassword],
                (err,data)=>{

                    if(err){
                        return res.status(500).json(err)
                    }

                    res.status(201).json({
                        message:"User Registered Successfully"
                    })
                }
            )
        })

    } catch(error){
        res.status(500).json(error)
    }
}


// Login

const loginUser = (req,res)=>{

    const {email,password}=req.body

    const query=
    "SELECT * FROM users WHERE email=?"

    db.query(query,[email],
    async(err,result)=>{

        if(err){
            return res.status(500).json(err)
        }

        if(result.length===0){
            return res.status(400).json({
                message:"User not found"
            })
        }

        const user=result[0]

        const comparePassword=
        await bcrypt.compare(
            password,
            user.password
        )

        if(!comparePassword){
            return res.status(400).json({
                message:"Invalid credentials"
            })
        }

        const token=jwt.sign(
            {
                id:user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"7d"
            }
        )

        res.json({
            token,
            message:"Login Success"
        })

    })

}

module.exports={
    registerUser,
    loginUser
}