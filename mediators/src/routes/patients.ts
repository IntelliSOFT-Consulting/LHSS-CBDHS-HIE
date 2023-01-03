import express from 'express';
import { FhirApi, parseFhirPatient, Patient } from '../lib/utils';
import { generateCrossBorderId } from '../lib/utils';

export const router = express.Router();

router.use(express.json());


// get patient information by crossborder ID
router.get('/', async (req, res) => {
    try {
        let { id } = req.query;
        if (!id) {
            res.json({ status: "error", error: "CrossBorder ID is required" });
            return;
        }
        let patient = (await FhirApi({ url: `/Patient?identifier=${id}` })).data;
        if (patient?.total > 0 || patient?.entry?.length > 0) {
            patient = patient.entry[0].resource;
            patient = parseFhirPatient(patient);
            res.statusCode = 200;
            res.json({ status: "success", patient, crossBorderId: patient.id });
            return;
        }
        res.statusCode = 404;
        res.json({ status: "error", "error": "CrossBorder patient not found" });
        return;
    } catch (error) {
        res.statusCode = 400;
        console.log(error);
        res.json({ status: "error", error });
        return;
    }
})


// create or register a new patient
router.post('/', async (req, res) => {
    try {
        let data = req.body;
        let crossBorderId = generateCrossBorderId(data.country);
        let patient = (await FhirApi({
            url: `/Patient`,
            data: JSON.stringify(Patient({ ...data, crossBorderId })),
            method: 'POST'
        })).data;
        if (patient.id) {
            res.json({ status: "success", crossBorderId });
            return;
        }
        res.statusCode = 400;
        res.json({ status: "error", error:"Failed to register patient" });
        return;
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
});

// patient search
router.get('/search', async (req, res) => {
    try {
        let params = req.query;
        let patients = (await FhirApi({
            url: `/Patient${params?.name ? `?name=${params?.name}` : ""}${(params?.nationalId || params?.crossBorderId) ? `?identifier=${(params?.nationalId) || params?.crossBorderId}` : ''}`
        })).data?.entry || [];
        console.log(patients)
        patients = patients.map((patient: any) => {
            return parseFhirPatient(patient.resource);
        })
        res.json({ status: "success", results: patients, count: patients.length });
        return;
    } catch (error) {
        console.error(error);
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
});

export default router;