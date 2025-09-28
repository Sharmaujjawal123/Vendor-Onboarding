import express from "express";
import fetch from "node-fetch";
import multer from "multer";
import cors from "cors";

const app = express();

// ✅ Use memory storage (no files on disk)
// const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Hello World!"));



app.listen(3000, () => console.log("🚀 Server running on port 3000"));
