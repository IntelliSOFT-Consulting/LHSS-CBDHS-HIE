import express from 'express';
import { generatePatientReference, _supportedResources } from '../lib/resources';
import { FhirApi, getPatientByCrossBorderId } from '../lib/utils';
import { validateResource } from '../lib/validate';


export const router = express.Router();

router.use(express.json());


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
        console.log(patient)
        if (!patient) {
            res.json({ status: "error", error: `Cross Border Patient with the id ${crossBorderId} not found` });
            return;
        }

        // MDM Expansion - search across all linked resources.
        let data = await (await FhirApi({ url: `/${ipsComponent}?subject:mdm=Patient/${patient.id}` })).data;
        res.json({ status: "success", [ipsComponent]: data });
        return
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})

// modify patient details
router.post('/', async (req, res) => {
    try {
        let resource = req.body;
        if (['Observation', 'Medication', 'Immunization', 'AllergyIntolerance', 'MedicationRequest'].indexOf(resource.resourceType) < 0) {
            res.statusCode = 400;
            res.json({ status: "error", error: `Invalid or unsupported FHIR Resource` });
            return;
        }
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


        // Build resources


        // To-do: Hydrate resources


        // Post resource

        let data = await FhirApi({ url: `/${resource.resourceType}`, method: 'POST', data: JSON.stringify(resource) })
        if (["Unprocessable Entity", "Bad Request"].indexOf(data.statusText) > 0) {
            res.statusCode = 400;
            res.json({ status: "error", error: data.statusText, data: data.data.issue });
            return;
        }
        console.log(data);
        res.json({ status: "success", patient: crossBorderId, patientResource: `Patient/${patient.id}`, resource: `${resource.resourceType}/${data.data.id}` });
        return;
    } catch (error) {
        console.log(error);
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})



export default router;