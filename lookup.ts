// express router for handling geo lookup requests
import express, { Request, Response } from "express";
import { searchCountryByName } from "./internal_data";
import { filterWithConstraints } from "./skyscanner";

// create /geo/country/:ip endpoint
const router = express.Router();


router.get("/country/:name", (req: Request, res: Response) => {
    const name = req.params.name;

    const data = searchCountryByName(name);
    if (!data) {
        res.status(404).json({ error: "Country not found" });
        return;
    }

    res.status(200).json(data);
});

router.get("/continent/:name", (req: Request, res: Response) => {
    const name = req.params.name;

    const data = searchCountryByName(name);
    if (!data) {
        res.status(404).json({ error: "Country not found" });
        return;
    }

    res.status(200).json(data);
});

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