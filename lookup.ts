// express router for handling geo lookup requests
import express, { Request, Response } from "express";
const router = express.Router();

router.get("/testsergi", async (req: Request, res: Response) => {
    // const body = req.body;

    // const players = [
    //     {
    //         name: "Player 1",
    //         originCountry: "ES",
    //         maxBudget: 1000,
    //         answers: []
    //     },
    //     {
    //         name: "Player 2",
    //         originCountry: "ES",
    //         maxBudget: 1500,
    //         answers: []
    //     }
    // ]

    // const data = await filterWithConstraints(players, ["IT", "FR", "DE"], 5);
    // console.log(data);
    // res.status(200).json({ message: "awda" });
});


export default router;