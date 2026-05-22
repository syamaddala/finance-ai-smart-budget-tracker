const OpenAI=require("openai")
const db=require("../db/db")

const client=new OpenAI({
apiKey:process.env.OPENAI_API_KEY
})

const getAIAdvice=(req,res)=>{

res.json({
reply:"AI Assistant Ready"
})

}


const chatAI=(req,res)=>{

    const {question}=req.body
    const userId=req.user.id
    
    const query=`
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
    (err,result)=>{
    
    if(err){
    return res.status(500).json(err)
    }
    
    const q=question.toLowerCase()
    
    let reply=""
    
    const top=result[0]
    
    if(!top){
    
    reply="No transaction data available."
    
    }
    
    else if(q.includes("travel")){
    
    const travel=
    result.find(
    item=>item.category==="Travel"
    )
    
    reply=travel
    ? `You spent ₹${travel.total} on Travel. Consider planning trips and setting monthly travel limits.`
    : "No travel expenses found."
    
    }
    
    else if(q.includes("food")){
    
    const food=
    result.find(
    item=>item.category==="Food"
    )
    
    reply=food
    ? `You spent ₹${food.total} on Food. Reducing restaurant spending could increase savings.`
    : "No food expenses found."
    
    }
    
    else if(q.includes("save")){
    
    reply=
    `Your highest expense category is ${top.category}. Reducing it could improve savings.`
    
    }
    
    else{
    
    reply=
    `Your highest spending category is ${top.category} with ₹${top.total}.`
    
    }
    
    res.json({
    reply
    })
    
    })
    
    }

module.exports={
getAIAdvice,
chatAI
}