// express router for handling geo lookup requests
import express, { Request, Response } from "express";
import { getWikipediaImage } from "./unsplash";
const router = express.Router();

router.get("/test", async (req: Request, res: Response) => {
    const q = req.query.a;
    const abc = await getWikipediaImage(q as string)
    console.log("abc", abc);
    res.json({ message: "Hello World", q });
});


export default router;