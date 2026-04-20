import express from 'express';
const router = express.Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import prisma from '../prisma.js';

// Gets the next 5 resumes - defaultly the user's field, but can be changed manually afterwards
// The 5 resumes are the highest engagement rank
router.get("/", async (req, res) => {
	const fieldIds = req.body.fieldIds;
    var results = [];

	var relationSortQuantity = {
		include: {
			Resume: true,
			FieldTags: true
		},
		orderBy: {
			Resume: {
				engagement_points: 'desc'
			}
		},
		take: 5
	}


    if (fieldIds.length > 0)
    {
        results = await prisma.resumeField.findMany({
            where: {
                field: {
                    in: fieldIds
                }
            },
            ...relationSortQuantity
        });
    }
    else
    {
        results = await prisma.resumeField.findMany({
			...relationSortQuantity
        });
    }
    
	// Return the resume, 
	res.status(201).json();
});

// Uploading a resume
// Getting the file, uploading that file to supabase storage then linking it with user
router.post("/", upload.single("file"), async (req, res) => { 
	const file = req.file;

});