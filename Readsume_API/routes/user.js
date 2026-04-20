import express from 'express';
const router = express.Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import prisma from '../prisma.js';

// Create user, using
router.post("/", async (req, res) => { 
    const auth0_id = req.auth.payload.sub;

    const foundUser = await prisma.users.findFirst({
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
        const createdUser = await prisma.users.create({
            data: {
                created_at: new Date(),
                auth0_id: auth0_id
            }
        });

        return res.status(200).json({ msg: 'User created properly'});
    } 
    catch (err) 
    {
        return res.status(500).json({ error: "Failed to create user" });
    }
});

export default router;