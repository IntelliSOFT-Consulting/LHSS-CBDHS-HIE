import express from 'express';
import { FhirApi, getPatientByCrossBorderId, generateCrossBorderId, getPatientSummary } from '../lib/utils';
import { parseFhirPatient, Patient } from '../lib/resources';
import { ParsedQs } from 'qs'

export const router = express.Router();

router.use(express.json());


// get patient information by crossborder ID
router.get('/', async (req, res) => {
    try {
        let _queryParams: ParsedQs = req.query;
        let queryParams: Record<string, any> = { ..._queryParams }
        let { id, crossBorderId, identifier } = req.query;
        if (!id && !identifier && (!(crossBorderId))) {
            res.statusCode = 400;
            res.json({
                "resourceType": "OperationOutcome",
                "id": "exception",
                "issue": [{
                    "severity": "error",
                    "code": "exception",
                    "details": {
                        "text": "Failed to register patient. CrossBorder ID or identifier is required"
                    }
                }]
            });
            return;
        }
        // let url = new URL('/Patient')
        let params = []
        for (const k of Object.keys(queryParams)) {
            params.push(`${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`);
        }
        console.log(`/Patient?${params.join("&")}`)

        let patient = (await FhirApi({url: `/Patient?${params.join("&")}`})).data;
        if (patient) {
            // patient = patient.entry[0].resource;
            res.statusCode = 200;
            res.json(patient);
            return;
        }
        res.statusCode = 404;
        res.json({
            "resourceType": "OperationOutcome",
            "id": "exception",
            "issue": [{
                "severity": "error",
                "code": "exception",
                "details": {
                    "text": "Failed to register patient. CrossBorder patient not found"
                }
            }]
        });
        return;
    } catch (error) {
        res.statusCode = 400;
        console.log(error);
        res.json({
            "resourceType": "OperationOutcome",
            "id": "exception",
            "issue": [{
                "severity": "error",
                "code": "exception",
                "details": {
                    "text": `Failed to register patient. ${JSON.stringify(error)}`
                }
            }]
        });
        return;
    }
})


// create or register a new patient
router.post('/', async (req, res) => {
    try {
        let data = req.body;
        let parsedPatient = parseFhirPatient(data);
        if (!parsedPatient) {
            let error = "Invalid Patient resource - failed to parse resource";
            res.statusCode = 400;
            console.log(error);
            res.json({
                "resourceType": "OperationOutcome",
                "id": "exception",
                "issue": [{
                    "severity": "error",
                    "code": "exception",
                    "details": {
                        "text": `Failed to find patient. ${JSON.stringify(error)}`
                    }
                }]
            });
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
            res.statusCode = 200;
            res.json(patient);
            return;
        }
        res.statusCode = 400;
        res.json(patient);
        return;
    } catch (error) {
        res.statusCode = 400;
        console.log(error);
        res.json({
            "resourceType": "OperationOutcome",
            "id": "exception",
            "issue": [{
                "severity": "error",
                "code": "exception",
                "details": {
                    "text": "Failed to find patient. Check the resource and try again"
                }
            }]
        });
        return;
    }
});

// patient search
router.get('/search', async (req, res) => {
    try {
        let params = req.query;
        let patients = (await FhirApi({
            url: `/Patient${params?.name ? `?name=${params?.name}` : ""}${(params?.nationalId || params?.crossBorderId) ? `?identifier=${(params?.nationalId) || params?.crossBorderId}` : ''}`
        })).data;
        // console.log(patients);
        // patients = patients.entry || [];
        // patients = patients.map((patient: any) => {
        //     return patient.resource;
        // })
        res.json(patients);
        return;
    } catch (error) {
        console.error(error);
        res.statusCode = 400;
        res.json({
            "resourceType": "OperationOutcome",
            "id": "exception",
            "issue": [{
                "severity": "error",
                "code": "exception",
                "details": {
                    "text": `Patient not found - ${JSON.stringify(error)}`
                }
            }]
        });
        return;
    }
});


// patient search
router.get('/summary', async (req, res) => {
    try {
        let params = req.query;
        let summary = await getPatientSummary(String(params.crossBorderId));
        res.json(summary);
        return;
    } catch (error) {
        console.error(error);
        res.statusCode = 400;
        res.json({
            "resourceType": "OperationOutcome",
            "id": "exception",
            "issue": [{
                "severity": "error",
                "code": "exception",
                "details": {
                    "text": `Failed to generate IPS Summary - ${JSON.stringify(error)}`
                }
            }]
        });
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
            res.json({
                "resourceType": "OperationOutcome",
                "id": "exception",
                "issue": [{
                    "severity": "error",
                    "code": "exception",
                    "details": {
                        "text": `Failed to register patient. ${JSON.stringify(error)}`
                    }
                }]
            });
            return;
        }
        let parsedPatient = parseFhirPatient(data);
        if (!parsedPatient) {
            let error = "Invalid Patient resource - failed to parse resource"
            res.statusCode = 400;
            res.json({
                "resourceType": "OperationOutcome",
                "id": "exception",
                "issue": [{
                    "severity": "error",
                    "code": "exception",
                    "details": {
                        "text": `Invalid Patient resource - ${JSON.stringify(error)}`
                    }
                }]
            });
            return;
        }
        let patient = await getPatientByCrossBorderId(String(crossBorderId) || '')
        if (!patient) {
            let error = "Invalid crossBorderId provided"
            res.statusCode = 400;
            res.json({
                "resourceType": "OperationOutcome",
                "id": "exception",
                "issue": [{
                    "severity": "error",
                    "code": "exception",
                    "details": {
                        "text": `Patient not found - ${JSON.stringify(error)}`
                    }
                }]
            });;
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
        res.json(updatedPatient.data);
        return;
    } catch (error) {
        console.error(error);
        res.statusCode = 400;
        res.json({
            "resourceType": "OperationOutcome",
            "id": "exception",
            "issue": [{
                "severity": "error",
                "code": "exception",
                "details": {
                    "text": `Failed to update patient- ${JSON.stringify(error)}`
                }
            }]
        });
        return;
    }
});

export default router;