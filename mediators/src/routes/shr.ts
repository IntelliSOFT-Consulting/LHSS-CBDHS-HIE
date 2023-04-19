import express from 'express';
import { generatePatientReference, _supportedResources } from '../lib/resources';
import { FhirApi, getPatientByCrossBorderId } from '../lib/utils';
import { validateResource } from '../lib/validate';


export const router = express.Router();

router.use(express.json());


const supportedResources = ['Observation', 'Medication', 'Immunization', 'AllergyIntolerance', 'MedicationRequest', 'Encounter'];

// get patient information
router.get('/', async (req, res) => {
    try {
        let { crossBorderId, type } = req.query;
        if (!type) {
            res.statusCode = 400;
            res.json({ status: "error", error: `resource type is required` });
            return;
        }
        let ipsComponent = type;
        if (!crossBorderId) {
            res.statusCode = 400;
            res.json({ status: "error", error: `Patient crossBorderId is required` });
            return;
        }
        ipsComponent = String(ipsComponent).charAt(0).toUpperCase() + String(ipsComponent).slice(1);
        let patient = await getPatientByCrossBorderId(String(crossBorderId));
        console.log(patient);
        if (!patient) {
            res.json({ status: "error", error: `Cross Border Patient with the id ${crossBorderId} not found` });
            return;
        }

        // MDM Expansion - search across all linked resources.
        let data = await (await FhirApi({ url: `/${ipsComponent}?patient=Patient/${patient.id}` })).data;
        console.log(data);
        res.json({ status: "success", [ipsComponent]: data });
        return
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})


// get patient information
router.post('/:resourceType', async (req, res) => {
    try {
        let resource = req.body;
        let { resourceType } = req.params;
        if (supportedResources.indexOf(resourceType) < 0) {
            res.statusCode = 400;
            let error = `Invalid or unsupported FHIR Resource`;
            res.json({
                "resourceType": "OperationOutcome",
                "id": "exception",
                "issue": [{
                    "severity": "error", "code": "exception",
                    "details": { "text": error }
                }]
            });
            return;
        }

        let { crossBorderId } = req.query;
        if (!crossBorderId) {
            res.statusCode = 400;
            let error = `Patient crossBorderId is required`;
            res.json({
                "resourceType": "OperationOutcome",
                "id": "exception",
                "issue": [{
                    "severity": "error", "code": "exception",
                    "details": { "text": error }
                }]
            });
            return;
        }
        let patient = await getPatientByCrossBorderId(String(crossBorderId));
        let error = `Cross Border Patient with the id ${crossBorderId} not found`
        if (!patient) {
            res.json({
                "resourceType": "OperationOutcome",
                "id": "exception",
                "issue": [{
                    "severity": "error", "code": "exception", "details": { "text": error }
                }]
            });
            return;
        }

        // Parse resources
        if (resource.subject) {
            resource.subject = await generatePatientReference("Patient", patient.id);
        }
        if (resource.patient) {
            resource.patient = await generatePatientReference("Patient", patient.id);
        }
        if (resource.reference) {
            resource.reference = await generatePatientReference("Patient", patient.id);
        }
        // Build resources

        // To-do: Hydrate resources


        // Post resource

        let data = await FhirApi({ url: `/${resourceType}`, method: 'POST', data: JSON.stringify(resource) })
        if (["Unprocessable Entity", "Bad Request"].indexOf(data.statusText) > 0) {
            res.statusCode = 400;
            res.json(data.data);
            return;
        }
        // console.log(data);
        // res.json({ status: "success", patient: crossBorderId, patientResource: `Patient/${patient.id}`, resource: `${resource.resourceType}/${data.data.id}` });
        res.json(data.data);
        return;
    } catch (error) {
        res.statusCode = 400;
        res.json({
            "resourceType": "OperationOutcome",
            "id": "exception",
            "issue": [{
                "severity": "error", "code": "exception", "details": { "text": error }
            }]
        });
        return;
    }
})


// modify patient details
router.post('/', async (req, res) => {
    try {
        let resource = req.body;
        // if (supportedResources.indexOf(resource.resourceType) < 0) {
        //     res.statusCode = 400;
        //     res.json({ status: "error", error: `Invalid or unsupported FHIR Resource` });
        //     return;
        // }
        let ipsComponent = resource.resourceType;

        let { crossBorderId } = req.query;
        if (!crossBorderId) {
            res.statusCode = 400;
            res.json({ status: "error", error: `Patient crossBorderId is required` });
            return;
        }
        let patient = await getPatientByCrossBorderId(String(crossBorderId));
        if (!patient) {
            res.json({ status: "error", error: `Cross Border Patient with the id ${crossBorderId} not found` });
            return;
        }

        // Parse resources
        if (resource.subject) {
            resource.subject = generatePatientReference("Patient", patient.id);
        }
        if (resource.patient) {
            resource.patient = generatePatientReference("Patient", patient.id);
        }
        if (resource.reference) {
            resource.reference = generatePatientReference("Patient", patient.id);
        }

        // Post FHIR Bundle

        let data = await FhirApi({ url: `/`, method: 'POST', data: JSON.stringify(resource) })
        if (["Unprocessable Entity", "Bad Request"].indexOf(data.statusText) > 0) {
            res.statusCode = 400;
            res.json(data.data);
            return;
        }
        res.json(data.data);
        return;
    } catch (error) {
        console.log(error);
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})



export default router;