const db=require("../db/db")

const addBudget=(req,res)=>{

    console.log(req.body)
    
    const userId=req.user.id
    
    const {category,monthly_limit}=req.body
    
    const query=
    `INSERT INTO budgets
    (user_id,category,monthly_limit)
    VALUES(?,?,?)`
    
    db.query(
    query,
    [userId,category,monthly_limit],
    (err,result)=>{
    
    if(err){
    return res.status(500).json(err)
    }
    
    res.json({
    message:"Budget added"
    })
    
    }
    )
    
    }


const getBudgets=(req,res)=>{

const userId=req.user.id

const query=
`SELECT * FROM budgets
WHERE user_id=?`

db.query(
query,
[userId],
(err,result)=>{

if(err){
return res.status(500).json(err)
}

res.json(result)

}
)

}

module.exports={
addBudget,
getBudgets
}