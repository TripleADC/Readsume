import express from 'express';
const router = express.Router();

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import prisma_client from '../prisma_client.js';
import supabase from '../supabase.js';

 const allowed = {
    "application/pdf": "pdf"
};

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
        results = await prisma_client.resumeField.findMany({
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
        results = await prisma_client.resumeField.findMany({
			...relationSortQuantity
        });
    }
    
	// Return the resume, 
	res.status(201).json();
});

// Getting a specific resume + their comments + replies
router.get("/:resumeId", async (req, res) => {
    const resumeId = req.params.resumeId;

    var results = await prisma_client.resume.findMany({
        where: {
            resumeId: resumeId
        },
        include: {
            ResumeComments: {
                include: {
                    ResumeReplies
                }
            }
        }
    });

    // only keep the resume id in it
    results = results.map(x => {
        return {
            id: x.id,
            ResumeComments: x.ResumeComments
        };
    });
    
    // Return the resume comment
    res.status(201).json(results);
});

// Uploading a resume
// Getting the file, uploading that file to supabase storage then linking it with user
// Fields is a comma seperated string
router.post("/", upload.single("file"), async (req, res) => { 
	const file = req.file;
    const loggedInUser = req.user;
    const fieldIds= req.body.fieldIds;

    let path = "";
    let public_url = "";

    if (file == null || fieldIds == null || fieldIds == []) {
      return res.status(400).json({ error: "Required fields are null" });
    }

    // Making unique file name
    const ext = allowed[file.mimetype];
    if (ext != null) {
        return res.status(400).json({ error: "Invalid file type" });
    }

    const filePath = `resumes/${auth0_id}/${Date.now()}.${ext}`;

    try 
    {
        const { data, error } = await supabase.storage
            .from("resume")
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

            if (error != null) {
                throw error;
            }
        
            path = data.path;
    }
    catch
    {
        return res.status(500).json({ error: "Resume unable to be uploaded" });
    }

    // Getting public url
    try 
    {
        const { data } = await supabase.storage
            .from("resume")
            .getPublicUrl(path)

        public_url = data.publicUrl;
    }
    catch
    {
        return res.status(500).json({ error: "Unable to get public URL for resume" });
    }

    // Creating resume record
    try {
        const createdResume = await prisma_client.resume.create({
            data: {
                created_at: new Date(),
                public: true,
                object_key: path,
                public_url: public_url,
                created_by: loggedInUser.id,
                engagement_score: 0
            }
        });

        await prisma_client.$transaction(async (transact) => {
            // Putting all of them
            await transact.resumeField.createMany({
                data: fieldIds.map(field => ({
                    resume: createdResume.id,
                    field: field
                }))
            });
        });

        res.status(200).json({ msg: "Resume successfully created"});
    }
    catch
    {
        res.status(500).json({ error: "Resume unable to be created"});
    }
});

// Making a resume public or private (toggle)
router.patch("/status", async (req, res) => { 
    const resumeId = req.body.resumeId;

    if (resumeId == null)
    {
        return res.status(400).json({ error: "Resume is null" });
    }

    const resumeToEdit = await prisma_client.resume.findFirst({
        where: {
            id: resumeId
        }
    });

    if (resumeToEdit == null)
    {
        return res.status(400).json({ error: "Resume not found" });
    }

    try 
    {
        await prisma_client.resume.update({
            where: {
                id: resumeId
            },
            data: {
                public: !resumeToEdit.public
            }
        })

        return res.status(200).json({ msg: "Resume status successfully updated" });
    }
    catch
    {
        return res.status(500).json({ error: "Unable to update resume status" });
    }
});

// Assigning a resume their fields
// Fields is a comma seperated string
router.patch("/fields", async (req, res) => {
    const resumeId = req.body.resumeId;
    const fieldIds = req.body.fieldIds;

    if (resumeId == null || fieldIds == null || fieldIds == [])
    {
        return res.status(400).json({ error: "Required fields are null or empty" });
    }

    const resumeToEdit = await prisma_client.resume.findFirst({
        where: {
            id: resumeId
        }
    });

    if (resumeToEdit == null)
    {
        return res.status(400).json({ error: "Resume not found" });
    }

    try 
    {
        await prisma_client.$transaction(async (transact) => {

            // Starting fresh
            await transact.resumeField.deleteMany({
                where: {
                    resume: resumeId
                }
            });

            // Putting all of them
            await transact.resumeField.createMany({
                data: fieldIds.map(field => ({
                    resume: resumeId,
                    field: field,
                    created_at: new Date()
                }))
            });
        });

        return res.status(200).json({ msg: "Resume fields successfully updated" });
    }
    catch
    {
        return res.status(500).json({ error: "Unable to update resume" });
    }
});

export default router;