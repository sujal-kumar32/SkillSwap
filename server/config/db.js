const mongoose=require("mongoose");


mongoose.connect("mongodb://localhost:27017/Skill-Swap").then(()=>{
       console.log("DB Connected")
     
}).catch((err)=>{
    console.log(err);
    
})