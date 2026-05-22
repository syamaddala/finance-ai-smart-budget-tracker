const express=require("express")

const verifyToken=
require("../middleware/authMiddleware")

const {
addBudget,
getBudgets
}=require("../controllers/budgetController")

const router=express.Router()

router.post(
"/add",
verifyToken,
addBudget
)

router.get(
"/all",
verifyToken,
getBudgets
)

module.exports=router