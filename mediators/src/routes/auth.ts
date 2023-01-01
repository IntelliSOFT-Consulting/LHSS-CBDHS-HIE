import express, { Request, response, Response } from "express";
import { getOpenHIMToken, installChannels, sendRequest } from "../lib/utils";


const router = express.Router();
router.use(express.json());

// Login
router.get("/token", async (req: Request, res: Response) => {
    try {
        let token = await getOpenHIMToken();
        await installChannels()
        res.json({ status: "success", token });
        res.set(token);
        return;
    }
    catch (error) {
        console.log(error);
        res.statusCode = 401;
        res.json({ error: "incorrect email or password" });
        return;
    }
});


// Login
router.get("/install", async (req: Request, res: Response) => {
    try {
        let token = await getOpenHIMToken();
        await sendRequest()
        res.json({ status: "success", token });
        return;
    }
    catch (error) {
        console.log(error);
        res.statusCode = 401;
        res.json({ error: "incorrect email or password" });
        return;
    }
});

export default router