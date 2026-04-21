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
router.post("/", upload.single("file"), async (req, res) => { 
	const file = req.file;
    const loggedInUser = req.user;

    let path = "";
    let public_url = "";

    if (file == null) {
      return res.status(400).json({ error: "No file uploaded" });
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
        await prisma_client.resume.create({
            data: {
                created_at: new Date(),
                public: true,
                object_key: path,
                public_url: public_url,
                created_by: loggedInUser.id,
                engagement_score: 0
            }
        });

        res.status(200).json({ msg: "Resume successfully created"});
    }
    catch
    {
        res.status(500).json({ error: "Resume unable to be created"});
    }
});

// Making a resume public or private (toggle)
router.patch("/", async (req, res) => { 
    const resumeId = req.body.resumeId;

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

        return res.status(200).json({ msg: "Resume successfully updated" });
    }
    catch
    {
        return res.status(500).json({ error: "Unable to update resume" });
    }
});



export default router;