import express from 'express';
import { FhirApi, Patient } from '../lib/fhir';
import { uuid } from 'uuidv4';

export const router = express.Router();

router.use(express.json());


// get patient information
router.get('/:id', async (req, res) => {
    try {
        let { id } = req.params;
        let patient = (await FhirApi({ url: `/Patient?identifier=${id}` })).data;
        res.json({ status: "success", patient, crossBorderId: patient.id });
        return;
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})


// create or register a new patient
router.post('/', async (req, res) => {
    try {
        let data = req.body;
        let patient = (await FhirApi({
            url: `/Patient`,
            data: JSON.stringify(Patient(data)),
            method: 'POST'
        }))
        res.json({ status: "success", results: patient })
        return
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return
    }
})

// patient search
router.get('/patients', async (req, res) => {
    try {
        let params = req.params;
        let patients = (await FhirApi({
            url: `/Patient${params?.name && `?name=${params?.name}`}
        ${params?.id && `?_id=${params?.id}`}
        ${(params?.nationalId || params?.passportNo) && `?identifier=${(params?.nationalId || params?.passportNo)}`}`
        })).data?.entry || [];
        res.json({ status: "success", results: patients.data })
        return
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return
    }
})

export default router;