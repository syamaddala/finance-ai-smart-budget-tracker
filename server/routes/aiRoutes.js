const express=require("express")

const router=express.Router()

const {
getAIAdvice,
chatAI
}=require("../controllers/aiController")

const verifyToken=
require("../middleware/authMiddleware")


router.get(
"/advice",
verifyToken,
getAIAdvice
)

router.post(
"/chat",
verifyToken,
chatAI
)

module.exports=router