import express from 'express';
import { FhirApi, getPatientByCrossBorderId, generateCrossBorderId } from '../lib/utils';
import { parseFhirPatient, Patient } from '../lib/resources';

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
            res.statusCode = 200;
            res.json({ status: "success", patient, crossBorderId: patient.crossBorderId });
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
        let parsedPatient = parseFhirPatient(data);
        if (!parsedPatient) {
            let error = "Invalid Patient resource - failed to parse resource"
            res.statusCode = 400;
            console.log(error);
            res.json({ status: "error", error });
            return;
        }
        console.log(parsedPatient);
        let crossBorderId = generateCrossBorderId(parsedPatient?.country);
        let patient = (await FhirApi({
            url: `/Patient`,
            data: JSON.stringify(Patient({ ...parsedPatient, crossBorderId })),
            method: 'POST'
        })).data;
        if (patient.id) {
            res.json({ status: "success", crossBorderId });
            return;
        }
        res.statusCode = 400;
        res.json({ status: "error", error: "Failed to register patient" });
        return;
    } catch (error) {
        res.statusCode = 400;
        console.log(error);
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
        console.log(patients);
        patients = patients.map((patient: any) => {
            return patient.resource;
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


// patient search
router.get('/summary', async (req, res) => {
    try {
        let params = req.query;
        let crossBorderId = String(params.crossBorderId);
        let patient = await getPatientByCrossBorderId(crossBorderId);
        let summary = await FhirApi({ 'url': `/Patient/${patient.id}/$summary` })
        res.json({ status: "success", summary });
        return;
    } catch (error) {
        console.error(error);
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
});



//update patient details
router.put('/', async (req, res) => {
    try {
        let data = req.body;
        let crossBorderId = req.query.crossBorderId || null;
        if (!crossBorderId) {
            let error = "crossBorderId is a required parameter"
            res.statusCode = 400;
            res.json({ status: "error", error });
            return;
        }
        let parsedPatient = parseFhirPatient(data);
        if (!parsedPatient) {
            let error = "Invalid Patient resource - failed to parse resource"
            res.statusCode = 400;
            res.json({ status: "error", error });
            return;
        }
        let patient = await getPatientByCrossBorderId(String(crossBorderId) || '')
        if (!patient) {
            let error = "Invalid crossBorderId provided"
            res.statusCode = 400;
            res.json({ status: "error", error });
            return;
        }
        let fhirId = patient.id;
        let updatedPatient = (await FhirApi({
            url: `/Patient/${fhirId}`,
            method: "PUT",
            data: JSON.stringify({ ...data, id: fhirId })
        }))
        console.log(updatedPatient)
        res.statusCode = 200;
        res.json({ status: "success", patient: updatedPatient.data });
        return;
    } catch (error) {
        console.error(error);
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
});

export default router;