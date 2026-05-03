import express from 'express';
const router = express.Router();

import prisma_client from '../prisma_client.js';

router.get("/display/status", async (req, res) => {
    const loggedInUser = req.user;

    const hasDisplayName = loggedInUser.display_name != null && loggedInUser.number_id != null;

    return res.status(200).json({ data: hasDisplayName, msg: 'Successfully retrieved user' });
});

router.post("/display", async (req, res) => {
    const loggedInUser = req.user;
    const animalId = req.animalId;
    
    let animal = "";
    
    if (animal == null)
    {
        return res.status(400).json({ msg: "Required fields are null or empty" });
    }

    // Getting the animal name
    try
    {
        const animalObj = await prisma_client.displayNameOptions.findFirst({
            where: {
                id: animalId
            }
        });

        animal = animalObj.animal_name;
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to get animal name for display name" });
    }

    // Creating
    try
    {
        await prisma_client.users.update({
            where: {
                id: loggedInUser.id
            },
            data: {
                display_name: `anon-${animal}`,
                number_id: loggedInUser.auth0_id.split("|")[1].slice(0, 7)
            }
        });

        return res.status(200).json({ msg: "Display name successfully updated" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to create animal name for display name" });
    }
})


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