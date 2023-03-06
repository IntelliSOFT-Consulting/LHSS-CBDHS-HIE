import express from 'express';
import { FhirApi, getPatientByCrossBorderId } from '../lib/utils';
import { validateResource } from '../lib/validate';


export const router = express.Router();

router.use(express.json());


// get patient information
router.get('/:ipsComponent', async (req, res) => {
    try {
        let { ipsComponent } = req.params;
        let { crossBorderId } = req.query;
        ipsComponent = String(ipsComponent).charAt(0).toUpperCase() + ipsComponent.slice(1)
        let patient = getPatientByCrossBorderId(String(crossBorderId))
        // let patient = (await FhirApi({ url: `/Patient?id=${id}` })).data;
        // res.json({ status: "success", results: patient, crossBorderId: patient.id });
        return;
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
        let { crossBorderId } = req.query;
        let patient = getPatientByCrossBorderId(String(crossBorderId))

        ipsComponent = String(ipsComponent).charAt(0).toUpperCase() + ipsComponent.slice(1)

        let data
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