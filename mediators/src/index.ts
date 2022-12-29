import express from "express";
import cors from 'cors'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config() // Load environment variables

//Import routes 
import Index from './routes/main'
import Auth from './routes/auth'
import Patients from './routes/patients'
import SHR from './routes/shr'

// import Reports from './routes/reports'

import { importMediators } from "./lib/utils";

const app = express();
const PORT = 3000;

app.use(cors())


importMediators();

app.use('/', Index)

app.use('/auth', Auth)
app.use('/patients', Patients)
app.use('/shr', SHR)

app.use('/files', express.static(`${path.join(__dirname, '../public/')}`))

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});