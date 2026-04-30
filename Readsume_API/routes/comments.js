import express from 'express';
const router = express.Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import prisma_client from '../prisma_client.js';
import supabase from '../supabase.js';

 const allowed = {
    "application/pdf": "pdf"
};

// NOTE: comments are gotten by default by resume (singular GET)

// Adding a new comment for a resume
router.post("/:resumeId", async (req, res) => { 
    const resumeId = req.params.resumeId;
    const loggedInUser = req.user;

    const comment = req.body.comment;
    const position_top = req.body.position_top;
    const position_left = req.body.position_left;
    const box_width = req.body.box_width;
    const box_height = req.body.box_height;

    if (resumeId == null || comment == null || 
        position_top == null || position_left == null ||
        box_width == null || box_height == null)
    {
        return res.status(400).json({ msg: "Required fields are null" });
    }

    const resumeToComment = await prisma_client.resume.findFirst({
        where: {
            id: resumeId
        }
    });

    if (resumeToComment == null)
    {
        return res.status(400).json({ msg: "Unable to find resume" });
    }

    try 
    {
        await prisma_client.resumeComments.create({
            data: {
                for_resume: resumeId,
                created_at: new Date(),
                created_by: loggedInUser.id,
                comment: comment,
                position_top: position_top,
                position_left: position_left,
                box_width: box_width,
                box_height: box_height
            }
        });

        // Increasing engagement of the original resume
        await prisma_client.resume.update({
            where: {
                id: resumeId
            },
            data: {
                engagement_score: {
                    increment: 1
                }
            }
        });

        return res.status(200).json({ msg: "Comment successfully added for resume" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to add comment for resume" });
    }
});

// Editing a message
router.patch("/:commentId", async (req, res) => { 
    const commentId = req.params.commentId;
    const loggedInUser = req.user;

    const newComment = req.body.comment;

    if (commentId == null)
    {
        return res.status(400).json({ msg: "Required fields are null" });
    }

    const commentToEdit = await prisma_client.resumeComments.findFirst({
        where: {
            id: commentId
        }
    })

    if (commentToEdit == null)
    {
        return res.status(400).json({ msg: "Unable to find comment" });
    }

    try 
    {
        await prisma_client.resumeComments.update({
            where: {
                id: commentId
            },
            data: {
                comment: newComment,
                edited_at: new Date()
            }
        });

        return res.status(200).json({ msg: "Comment successfully edited for resume" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to edit comment for resume" });
    }
});

router.delete("/:commentId", async (req, res) => {
    const commentId = req.params.commentId;
    const loggedInUser = req.user;

    if (commentId == null)
    {
        return res.status(400).json({ msg: "Required fields are null" });
    }

    const commentToDelete = await prisma_client.resumeComments.findFirst({
        where: {
            id: commentId
        }
    })

    if (commentToDelete == null)
    {
        return res.status(400).json({ msg: "Unable to find comment" });
    }

    try 
    {
        await prisma_client.resumeComments.delete({
            where: {
                id: commentId
            }
        })

        return res.status(200).json({ msg: "Comment successfully deleted for resume" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to delete comment for resume" });
    }
});