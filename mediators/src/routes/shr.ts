import express from 'express';
import { _supportedResources } from '../lib/resources';
import { FhirApi, getPatientByCrossBorderId } from '../lib/utils';
import { validateResource } from '../lib/validate';


export const router = express.Router();

router.use(express.json());


// get patient information
router.get('/:ipsComponent', async (req, res) => {
    try {
        let { ipsComponent } = req.params;
        let { crossBorderId } = req.query;
        if (!crossBorderId) {
            res.statusCode = 400;
            res.json({ status: "error", error: `Patient crossBorderId is required` });
            return;
        }
        ipsComponent = String(ipsComponent).charAt(0).toUpperCase() + ipsComponent.slice(1);
        let patient = await getPatientByCrossBorderId(String(crossBorderId));
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
router.post('/:ipsComponent', async (req, res) => {
    try {
        let { ipsComponent } = req.params;
        if (_supportedResources.indexOf(ipsComponent) < 0) {
            res.json({ status: "error", error: `IPS Component not supported` });
            return;
        }
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

        ipsComponent = String(ipsComponent).charAt(0).toUpperCase() + ipsComponent.slice(1)

        // Parse resources


        // Build resources


        // To-do: Hydrate resources


        // Post resource

        let data = await FhirApi({ url: `/${ipsComponent}`, method: 'POST' })
        console.log(ipsComponent)
        // res.json({ status: "success", results: patient, crossBorderId: patient.id });
        return;
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})



export default router;