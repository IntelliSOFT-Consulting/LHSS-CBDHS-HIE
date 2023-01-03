import express from 'express';
import { FhirApi } from '../lib/utils';


export const router = express.Router();

router.use(express.json());


// get patient information
router.get('/patients/:id', async (req, res) => {
    try {
        let { id } = req.params;
        let patient = (await FhirApi({ url: `/Patient?id=${id}` })).data;
        res.json({ status: "success", results: patient, crossBorderId: patient.id });
        return;
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})

// modify patient details
router.post('/patients/:id', async (req, res) => {
    try {
        let data = req.body;
        let patient = (await FhirApi({ url: '/Patient', data, method: 'PUT' })).data;
        res.json({ status: "success", results: patient, crossBorderId: patient.id });
        return;
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})



export default router;