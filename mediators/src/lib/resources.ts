// To Do: 
//     1. Add support for multiple systems 

import { FhirApi } from "./utils";






export const generateCode = (system: string, code: string, display: string) => {
    try {
        new URL(system);
    } catch (error) {
        console.log("invalid system value");
        return null
    }
    return { system, code, display }
}

export const generateReference = async (resource: string, id: string) => {
    try {
        let reference = (await FhirApi({ url: `/${resource}/${id}` })).data
        return {
            "reference": "Practitioner/eumfh-39-07",
            "display": "Dr. Mark Antonio"
        }

    } catch (error) {
        console.log(error);
        return null
    }

}





// Observations





// Condition
export const Condition = (onsetDateTime: string, codes: Array<any>, patient: string, practitioner: string) => {
    try {
        return {
            resourceType: "Condition",
            clinicalStatus: {
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                    "code": "active"
                }]
            },
            category: [{
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "75326-9",
                    "display": "Problem"
                }]
            }],
            "code": { "coding": codes },
            "subject": { "reference": `Patient/${patient}` },
            "onsetDateTime": onsetDateTime,
            "asserter": { "reference": `Practitioner/${practitioner}` }
        }
    } catch (error) {
        console.error("failed to build Condition resource", error);
        return null;
    }
}


export const parseCondition = (data: any) => {
    try {
        return {
            onsetDateTime: data.onsetDateTime,
            id: data?.id || null,
            practitioner: data.asserter.reference.split('/')[1],
            codes: data.code.coding[0], patient: data.subject.reference.split('/')[1],
        }
    } catch (error) {
        console.log("failed to parse Condition resource", error);
        return null;
    }
}

// 

// Organization.
export const Organization = (name: string, country: string, townOrCityOrCounty: string, address: string) => {
    try {
        return {
            resourceType: "Organization", "name": name,
            "address": [{ "line": [address], "city": townOrCityOrCounty, "country": country }]
        }
    } catch (error) {
        console.error("failed to build Organization resource", error);
        return null;
    }
}

export const parseOrganization = (data: any) => {
    try {
        return {
            id: data?.id || null, name: data.name, address: data.address[0].line,
            city: data.address[0].city, country: data.address[0].country
        }
    } catch (error) {
        console.log("failed to parse Organization resource", error);
        return null;
    }
}


// Patient
export let Patient = (patient: any) => {
    return {
        resourceType: 'Patient',
        ...(patient.id && { id: patient.id }),
        identifier: [
            { "value": patient.pointOfCareId, "id": "POINT_OF_CARE_ID" },
            { "value": patient.crossBorderId, "id": "CROSS_BORDER_ID" },
            { "value": patient.nationalId, "id": "NATIONAL_ID", "system": patient.country }
        ],
        name: [{ family: patient.surname, given: [patient.otherNames,], },],
        maritalStatus: {
            "coding": [
                {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
                    "code": patient.maritalStatus.toUpperCase(),
                    "display": patient.maritalStatus
                }
            ],
            "text": patient.maritalStatus
        },
        telecom: [{ value: patient.phone, },],
        birthDate: new Date(patient.dob).toISOString().slice(0, 10),
        gender: (patient.sex).toLowerCase(),
        address: [
            {
                state: patient.county,
                district: patient.district,
                city: patient.subCounty,
                village: patient.ward || patient.region,
                country: patient.country
            },
        ],
        contact: [
            {
                telecom: [{ value: patient.nextOfKinPhone, },],
                name: { family: patient.nextOfKinName, },
                relationship: [{ text: patient.nextOfKinRelationship }]
            },
        ],
    };
};


export const parseIdentifiers = async (patientId: string) => {
    let patient: any = (await FhirApi({ url: `/Patient?identifier=${patientId}`, })).data
    if (!(patient?.total > 0 || patient?.entry.length > 0)) {
        return null;
    }
    let identifiers = patient.entry[0].resource.identifier;
    return identifiers.map((id: any) => {
        return {
            [id.id]: id
        }
    })
}

export const parseFhirPatient = (patient: any) => {
    try {
        let identifiers = patient.identifier;
        let _ids: any = {}
        for (let id of identifiers) {
            _ids[id.id] = id
        }
        console.log(_ids)
        return {
            surname: patient.name[0].family,
            crossBorderId: _ids.CROSS_BORDER_ID?.value || '',
            pointOfCareId: _ids.POINT_OF_CARE_ID?.value || '',
            nationalId: _ids.NATIONAL_ID?.value || '',
            otherNames: patient.name[0].given[0],
            sex: patient.gender,
            dob: new Date(patient.birthDate).toDateString(),
            maritalStatus: patient.maritalStatus.coding[0].display,
            // "occupation": "Student",
            // "education": "Primary School",
            deceased: patient.deceasedBoolean,
            // "address": "58, Nakuru Town East",
            phone: patient.telecom[0].value,
            country: patient.address[0].country,
            region: patient.address[0].country === "Uganda" ? patient.address[0].village : undefined,
            district: patient.address[0].district || undefined,
            county: patient.address[0].state,
            subCounty: patient.address[0].city,
            nextOfKinName: patient.contact[0].relationship[0].text,
            nextOfKinRelationship: patient.contact[0].name.family,
            nextOfKinPhone: patient.contact[0].telecom,
        }
    } catch (error) {
        console.log("ERROR parsing Patient resource: ", error)
        return null
    }
}
