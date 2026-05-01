import express from 'express';
const router = express.Router();

import prisma_client from '../prisma_client.js';
import supabase from '../supabase.js';

// Returning all fields
router.get("/", async (req, res) => { 
    try 
    {
        const fields = await prisma_client.fieldTags.findMany({
            select: {
                id: true,
                fieldName: true
            }
        })

        return res.status(200).json({ data: fields, msg: "Successfully returned all fields" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to retrieve all fields" });
    }
});

// Returning a user's field
router.get("/user", async (req, res) => { 
    const loggedInUser = req.user;

    try 
    {
        const userFields = await prisma_client.userField.findMany({
            where: {
                user: loggedInUser.id
            },
        });

        return res.status(200).json({ data: userFields, msg: "Successfully returned the user's field" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to retrieve the user's field" });
    }
});

// Returning a resume's field
router.get("/resume/:resumeId", async (req, res) => { 
    const resumeId = req.params.resumeId;

    try 
    {
        const resumeFields = await prisma_client.resumeField.findMany({
            where: {
                resume: resumeId 
            }
        });

        return res.status(200).json({ data: resumeFields, msg: "Successfully returned the resumes field" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to retrieve the resumes field" });
    }
});

export default router;