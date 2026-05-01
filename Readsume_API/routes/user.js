import express from 'express';
const router = express.Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import prisma_client from '../prisma_client.js';

router.patch("/fields", async (req, res) => {
    const loggedInUser = req.user;
    const fieldIds = req.body.fieldIds;

    if (fieldIds == null || fieldIds == [])
    {
        return res.status(400).json({ msg: "Required fields are null or empty" });
    }

    try 
    {
        await prisma_client.$transaction(async (transact) => {

            // Starting fresh
            await transact.userField.deleteMany({
                where: {
                    user: loggedInUser.id
                }
            });

            // Putting all of them
            await transact.userField.createMany({
                data: fieldIds.map(field => ({
                    user: loggedInUser.id,
                    field: field,
                    created_at: new Date()
                }))
            });
        });

        return res.status(200).json({ msg: "User fields successfully updated" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to update user" });
    }
});

// Deleting user
// Should reroute user OUT afterwards in frontend
router.delete("/", async (req, res) => {
    const loggedInUser = req.user;

    try 
    {
        await prisma_client.users.delete({
            where: {
                id: loggedInUser.id
            }
        })

        return res.status(200).json({ msg: "User successfully updated" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to delete user" });
    }
})

export default router;