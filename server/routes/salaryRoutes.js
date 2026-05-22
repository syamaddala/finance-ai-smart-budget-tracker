const express=require("express")

const router=
express.Router()

const verifyToken=
require("../middleware/authMiddleware")

const {
addSalary,
getBudget
}=require(
"../controllers/salaryController"
)

router.post(
"/add",
verifyToken,
addSalary
)

router.get(
"/budget",
verifyToken,
getBudget
)

module.exports=
router