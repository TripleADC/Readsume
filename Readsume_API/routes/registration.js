import express from 'express';
const router = express.Router();

import prisma_client from '../prisma_client.js';

// Create user, using
router.post("/", async (req, res) => { 
    const auth0_id = req.auth.payload.sub;

    const foundUser = await prisma_client.users.findFirst({
        where: {
            auth0_id: auth0_id
        }
    });

    // If the user is found, no need to create an account
    if (foundUser)
    {
        return res.status(200).json({ msg: 'User found, logging in'});
    }

    try {
        const createdUser = await prisma_client.users.create({
            data: {
                created_at: new Date(),
                auth0_id: auth0_id
            }
        });

        return res.status(200).json({ msg: 'User created properly'});
    } 
    catch (err) 
    {
        return res.status(500).json({ msg: "Failed to create user" });
    }
});

export default router;