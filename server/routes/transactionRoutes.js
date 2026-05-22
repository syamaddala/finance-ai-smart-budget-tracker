const express = require("express")

const verifyToken =
    require("../middleware/authMiddleware")



const router = express.Router()

const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    getSummary,
    categoryAnalytics,
    getSuggestions,
    getMonthlyAnalytics
    }=require("../controllers/transactionController")

router.post(
    "/add",
    verifyToken,
    addTransaction
)

router.get(
    "/all",
    verifyToken,
    getTransactions
)

router.delete(
    "/delete/:id",
    verifyToken,
    deleteTransaction
)
router.get(
    "/summary",
    verifyToken,
    getSummary
)

router.get(
    "/analytics",
    verifyToken,
    categoryAnalytics
)

router.get(
    "/suggestions",
    verifyToken,
    getSuggestions
)

router.get(
    "/monthly",
    verifyToken,
    getMonthlyAnalytics
    )
module.exports = router