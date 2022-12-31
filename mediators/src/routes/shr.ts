'use strict'

import express from 'express';
import { FhirApi } from '../lib/fhir';


export const router = express.Router()

router.use(express.json())


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
        let patient = (await FhirApi({ url: '/Patient', data, method: 'PUT' })).data
        res.json({ status: "success", results: patient, crossBorderId: patient.id })
        return
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return
    }
})

// create/register a new patient
router.post('/patients', async (req, res) => {
    try {
        let data = req.body;
        let patients = (await FhirApi({
            url: `/Patient$${data?.id && `?_id=${data?.id}`}
        ${(data?.nationalId || data?.passportNo) && `?identifier=${(data?.nationalId || data?.passportNo)}`}`
        })).data?.entry || [];
        if (patients.length > 0) {
            res.statusCode = 400;
            res.json({ status: "error", error: "patient is already registered" });
            return
        }
        let patient = (await FhirApi({ url: '/Patient', data, method: 'POST' })).data
        res.json({ status: "success", results: patient, crossBorderId: patient.id })
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
        let {data} = req.params;
        // let patients = (await FhirApi({
        //     url: `/Patient${data?.name && `?name=${data?.name}`}
        // ${data?.id && `?_id=${data?.id}`}
        // ${(data?.nationalId || data?.passportNo) && `?identifier=${(data?.nationalId || data?.passportNo)}`}`
        // })).data?.entry || [];
        res.json({ status: "success", results: data })
        return
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return
    }
})

export default router;