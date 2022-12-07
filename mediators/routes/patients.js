'use strict'

import express from 'express';
import { FhirApi } from '../lib/fhir';

const app = express();


// get patient information
app.get('/patients/:id', async (req, res) => {
    try {
        let { id } = req.params;
        let patient = (await FhirApi({ url: `/Patient/${id}` })).data;
        res.json({ status: "success", results: patient, cbdhsId: patient.id });
        return;
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return;
    }
})

// modify patient details
app.post('/patients/:id', async (req, res) => {
    try {
        let data = req.body;
        let patient = (await FhirApi({ url: '/Patient', data, method: 'PUT' })).data
        res.json({ status: "success", results: patient, cbdhsId: patient.id })
        return
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return
    }
})

// create a new patient
app.post('/patients', async (req, res) => {
    try {
        let data = req.body;
        let patient = (await FhirApi({ url: '/Patient', data, method: 'POST' })).data
        res.json({ status: "success", results: patient, cbdhsId: patient.id })
        return
    } catch (error) {
        res.statusCode = 400;
        res.json({ status: "error", error });
        return
    }
})

// patient search
app.get('/patients', async (req, res) => {
    let { params } = req.params;
    let patients = (await FhirApi({
        url: `/Patient${params?.name && `?name=${params?.name}`}
        ${params?.id && `?_id=${params?.id}`}
        ${(params?.nationalId || params?.passportNo) && `?identifier=${(params?.nationalId || params?.passportNo)}`}`
    })).data?.entry || [];
    res.json({ status: "success", results: patients.data })
    return
})