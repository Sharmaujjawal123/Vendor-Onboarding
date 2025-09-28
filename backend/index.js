import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });
app.get("/", (req, res) => res.send("Hello World!"));



app.listen(3000, () => console.log("🚀 Server running on port 3000"));
