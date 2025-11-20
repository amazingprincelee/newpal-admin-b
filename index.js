import express from 'express';


const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))




const port = process.env.PORT || 3002;
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
    
})

