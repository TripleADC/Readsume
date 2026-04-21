const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const jwt = require("jsonwebtoken");

const dbAuth = async (req, res, next) => { 
    const auth0_id = req.auth.payload.sub;

    // Check if user actually exists
    const loggedInUser = await prisma.users.findFirst({
        where: {
            auth0_id: auth0_id
        }
    });

    if (loggedInUser == null)
    {
        return res.status(404).json({ error : "User not found"});
    }

    req.user = loggedInUser;
    next();
}; 

export default dbAuth