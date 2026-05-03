#!/usr/bin/env node
'use strict';

import "dotenv/config";

import { auth } from "express-oauth2-jwt-bearer";

const port = (() => {
    const args = process.argv;

    if (args.length !== 3) {
        console.error("usage: node root.js port");
        process.exit(1);
    }

    const num = parseInt(args[2], 10);
    if (isNaN(num)) {
        console.error("error: argument must be an integer.");
        process.exit(1);
    }

    return num;
})();

import express from 'express';
import cors from 'cors';
const app = express();

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const jwtCheck = auth({
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  audience: "readsume_api",
  tokenSigningAlg: 'RS256'
});
app.use(jwtCheck);

import dbAuth from "./middleware/dbAuth.js";

import resumeRoutes from "./routes/resume.js";
import registrationRoutes from "./routes/registration.js";
import userRoutes from "./routes/user.js";
import fieldRoutes from "./routes/fields.js";
import displayNamesRoutes from "./routes/displayNames.js";

app.use("/displayNames", dbAuth, displayNamesRoutes);
app.use("/fields", dbAuth, fieldRoutes);
app.use("/resumes", dbAuth, resumeRoutes);
app.use("/users", dbAuth, userRoutes);
app.use("/registration", registrationRoutes);


const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});