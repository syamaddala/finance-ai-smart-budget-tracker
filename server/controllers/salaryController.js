const db=require("../db/db")


const addSalary=(req,res)=>{

const userId=req.user.id

const {monthly_salary}=req.body


const query=
`
INSERT INTO salary
(user_id,monthly_salary)

VALUES(?,?)

ON DUPLICATE KEY UPDATE

monthly_salary=VALUES(
monthly_salary
)
`

db.query(
query,
[userId,monthly_salary],
(err,result)=>{

if(err){

return res
.status(500)
.json(err)

}

res.json({
message:
"Salary saved"
})

})

}



const getBudget=(req,res)=>{

const userId=req.user.id

const query=
`
SELECT monthly_salary
FROM salary
WHERE user_id=?
`

db.query(
query,
[userId],
(err,result)=>{

if(err){

return res
.status(500)
.json(err)

}

if(result.length===0){

return res.json({
message:
"No salary data"
})

}

const salary=
Number(
result[0]
.monthly_salary
)

const needs=
salary*0.5

const wants=
salary*0.3

const savings=
salary*0.2


res.json({

salary,
needs,
wants,
savings

})

})

}


module.exports={

addSalary,
getBudget

}