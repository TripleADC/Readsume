import express from 'express';
const router = express.Router();

import prisma_client from '../prisma_client.js';

router.get("/", async (req, res) => {

    try 
    {
        const options = await prisma_client.displayNameOptions.findMany({
            select: {
                id: true,
                animal_name: true
            }
        });

        return res.status(200).json({ data: options, msg: "Display name options successfully retrieved" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to retrieve display name options" });
    }
});

export default router;