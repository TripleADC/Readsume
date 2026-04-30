import express from 'express';
const router = express.Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import prisma_client from '../prisma_client.js';
import supabase from '../supabase.js';

 const allowed = {
    "application/pdf": "pdf"
};

// NOTE: replies are attached to comments when fetching resume (singular GET)

// Adding a new (initial) reply TO A COMMENT
router.post("/:commentId", async (req, res) => { 
    const commentId = req.params.commentId;
    const loggedInUser = req.user;

    const reply = req.body.reply;

    if (commentId == null || reply == null)
    {
        return res.status(400).json({ msg: "Required fields are null" });
    }

    const commentToReply = await prisma_client.resumeComments.findFirst({
        where: {
            id: commentId
        }
    });

    if (commentToReply == null)
    {
        return res.status(400).json({ msg: "Unable to find comment to reply to" });
    }

    try 
    {
        await prisma_client.resumeReplies.create({
            data: {
                reply: reply,
                created_at: new Date(),
                created_by: loggedInUser.id,
                for_comment: commentId
            }
        });

        // Increasing engagement of the original resume
        await prisma_client.resume.update({
            where: {
                id: commentToReply.for_resume
            },
            data: {
                engagement_score: {
                    increment: 1
                }
            }
        });

        return res.status(200).json({ msg: "Reply successfully added to comment" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to add reply for comment" });
    }
});

// Adding a reply to a reply (like a thread)
router.post("/reply/:replyId", async (req, res) => {
    const replyId = req.params.replyId;
    const loggedInUser = req.user;

    const reply = req.body.reply;

    if (replyId == null || reply == null)
    {
        return res.status(400).json({ msg: "Required fields are null" });
    }

    const replyToReply = await prisma_client.resumeReplies.findFirst({
        where: {
            id: replyId
        }
    });

    if (replyToReply == null)
    {
        return res.status(400).json({ msg: "Unable to find reply to reply to" });
    }

    const commentForReply = await prisma_client.resumeComments.findFirst({
        where: {
            id: replyToReply.for_comment
        }
    });

    if (commentForReply == null)
    {
        return res.status(400).json({ msg: "Unable to find comment to reply to" });
    }

    try 
    {
        await prisma_client.resumeReplies.create({
            data: {
                reply: reply,
                created_at: new Date(),
                created_by: loggedInUser.id,
                for_comment: replyToReply.commentId,
                for_reply: replyId
            }
        });

        // Increasing engagement of the original resume
        await prisma_client.resume.update({
            where: {
                id: commentForReply.for_resume
            },
            data: {
                engagement_score: {
                    increment: 1
                }
            }
        });

        return res.status(200).json({ msg: "Reply successfully added to comment" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to add reply for comment" });
    }
});

// Editing a reply
router.patch(":/replyId", async (req, res) => {
    const replyId = req.params.replyId;
    const loggedInUser = req.user;

    const reply = req.body.reply;

    if (replyId == null || reply == null)
    {
        return res.status(400).json({ msg: "Required fields are null" });
    }

    const replyToEdit = await prisma_client.resumeReplies.findFirst({
        where: {
            id: replyId
        }
    });

    if (replyToEdit == null)
    {
        return res.status(400).json({ msg: "Unable to find reply to edit" });
    }

    try 
    {
        await prisma_client.resumeComments.update({
            where: {
                id: replyId
            },
            data: {
                edited_at: new Date(),
                reply: reply
            }
        });

        return res.status(200).json({ msg: "Reply successfully edited" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to edit reply" });
    }
});

// Deleting a reply
router.delete("/:replyId", async (req, res) => {
    const replyId = req.params.replyId;
    const loggedInUser = req.user;

    const reply = req.body.reply;

    if (replyId == null || reply == null)
    {
        return res.status(400).json({ msg: "Required fields are null" });
    }

    const replyToDelete = await prisma_client.resumeReplies.findFirst({
        where: {
            id: replyId
        }
    });

    if (replyToDelete == null)
    {
        return res.status(400).json({ msg: "Unable to find reply to delete" });
    }

    // Not actually deleting the comment to preserve threads
    try 
    {
        await prisma_client.resumeReplies.update({
            where: {
                id: replyId
            },
            data: {
                reply: "This message has been deleted by the original poster",
                deleted_at: new Date()
            }
        });

        return res.status(200).json({ msg: "Reply successfully deleted" });
    }
    catch
    {
        return res.status(500).json({ msg: "Unable to delete reply" });
    }
});