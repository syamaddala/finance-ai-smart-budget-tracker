const db = require("../db/db")

const addTransaction = (req, res) => {

    const { title, amount, type, category } = req.body

    const userId = req.user.id

    const query = `
INSERT INTO transactions
(user_id,title,amount,type,category)
VALUES(?,?,?,?,?)
`

    db.query(
        query,
        [userId, title, amount, type, category],
        (err, result) => {

            if (err) {
                return res.status(500).json(err)
            }

            res.status(201).json({
                message: "Transaction added"
            })

        }
    )

}


const getTransactions = (req, res) => {

    const userId = req.user.id

    const query =
        `SELECT * FROM transactions
WHERE user_id=?
ORDER BY created_at DESC`

    db.query(
        query,
        [userId],
        (err, result) => {

            if (err) {
                return res.status(500).json(err)
            }

            res.json(result)

        }
    )

}

const deleteTransaction = (req, res) => {

    const transactionId = req.params.id

    const userId = req.user.id

    const query =
        `DELETE FROM transactions
    WHERE id=? AND user_id=?`

    db.query(
        query,
        [transactionId, userId],
        (err, result) => {

            if (err) {
                return res.status(500).json(err)
            }

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Transaction not found"
                })

            }

            res.json({
                message: "Transaction deleted"
            })

        }
    )

}

const getSummary = (req, res) => {

    const userId = req.user.id

    const query = `
        SELECT
        SUM(
        CASE
        WHEN type='income'
        THEN amount
        ELSE 0
        END
        ) AS totalIncome,
        
        SUM(
        CASE
        WHEN type='expense'
        THEN amount
        ELSE 0
        END
        ) AS totalExpense
        
        FROM transactions
        WHERE user_id=?
        `

    db.query(
        query,
        [userId],
        (err, result) => {

            if (err) {
                return res.status(500).json(err)
            }

            const income =
                result[0].totalIncome || 0

            const expense =
                result[0].totalExpense || 0

            const balance =
                income - expense

            res.json({
                totalIncome: income,
                totalExpense: expense,
                balance
            })

        }
    )

}
const categoryAnalytics = (req, res) => {

    const userId = req.user.id

    const query = `
            SELECT
            category,
            SUM(amount) as total
            FROM transactions
            WHERE user_id=?
            AND type='expense'
            GROUP BY category
            `

    db.query(
        query,
        [userId],
        (err, result) => {

            if (err) {
                return res.status(500).json(err)
            }

            res.json(result)

        }
    )

}

const getSuggestions = (req, res) => {

    const userId = req.user.id

    const query = `
    SELECT
    category,
    SUM(amount) as total
    FROM transactions
    WHERE user_id=?
    AND type='expense'
    GROUP BY category
    ORDER BY total DESC
    `

    db.query(
        query,
        [userId],
        (err, result) => {

            if (err) {
                return res.status(500).json(err)
            }

            if (result.length === 0) {
                return res.json({
                    message: "No expense data available"
                })
            }

            const topCategory = result[0]

            let suggestion = ""

            if (topCategory.total > 1000) {

                suggestion =
                    `You are spending heavily on ${topCategory.category}. Consider reducing it to improve savings.`

            } else {

                suggestion =
                    "Your spending pattern looks balanced."
            }

            res.json({
                topCategory: topCategory.category,
                amount: topCategory.total,
                suggestion
            })

        }
    )

}

const getMonthlyAnalytics=(req,res)=>{

    const userId=req.user.id
    
    const query=`
    SELECT
    DATE_FORMAT(created_at,'%Y-%m') AS month,
    
    SUM(
    CASE
    WHEN type='income'
    THEN amount
    ELSE 0
    END
    ) AS income,
    
    SUM(
    CASE
    WHEN type='expense'
    THEN amount
    ELSE 0
    END
    ) AS expense
    
    FROM transactions
    
    WHERE user_id=?
    
    GROUP BY month
    ORDER BY month
    `
    
    db.query(
    query,
    [userId],
    (err,result)=>{
    
    if(err){
    return res.status(500).json(err)
    }
    
    res.json(result)
    
    })
    
    }

module.exports={
addTransaction,
getTransactions,
deleteTransaction,
getSummary,
categoryAnalytics,
getSuggestions,
getMonthlyAnalytics
}