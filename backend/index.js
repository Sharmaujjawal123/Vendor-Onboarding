import express from "express";




app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World')
})



app.listen(3000, () => console.log("🚀 Server running on port 3000"));
