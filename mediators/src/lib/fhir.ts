
export let apiHost = process.env.FHIR_BASE_URL



// a fetch wrapper for HAPI FHIR server.
export const FhirApi = async (params: any) => {
    let _defaultHeaders = { "Content-Type": 'application/json' }
    if (!params.method) {
        params.method = 'GET';
    }
    try {
        let response = await fetch(String(`${apiHost}${params.url}`), {
            headers: _defaultHeaders,
            method: params.method ? String(params.method) : 'GET',
            ...(params.method !== 'GET' && params.method !== 'DELETE') && { body: String(params.data) }
        });
        let responseJSON = await response.json();
        let res = {
            status: "success",
            statusText: response.statusText,
            data: responseJSON
        };
        return res;
    } catch (error) {
        console.error(error);
        let res = {
            statusText: "FHIRFetch: server error",
            status: "error",
            data: error
        };
        console.error(error);
        return res;
    }
}

// Sample Patient Object.
// Create Patient in the MPI

// required

// patient id, patient name

export let Patient = (patient:any) => {
    return {
        resourceType: 'Patient',
        ...(patient.id && { id: patient.id }),
        identifier: [
            {
                "value": patient.pointOfCareId,
                "id": "POINT_OF_CARE_ID"
            },
            {
                "value": patient.crossBorderId,
                "id": "CROSS_BORDER_ID"
            }
        ],
        name: [
            {
                family: patient.surname,
                given: [patient.otherNames, ],
            },
        ],
        telecom: [
            {
                value: patient.phone,
            },
        ],
        birthDate: new Date(patient.dob).toISOString().slice(0, 10),
        address: [
            {
                state: patient.county,
                district: patient.subCounty,
                city: patient.ward,
                village: patient.village
            },
        ],
        contact: [
            {
                telecom: [
                    {
                        value: patient.nextOfKinPhone,
                    },
                ],
                name: {
                    family: patient.nextOfKinName,
                },
                relationship: [{
                    text: patient.nextOfKinRelationship
                }]
            },
        ],
    };
};

// Sample Observation Object For Dynamic Building

// Sample Encounter Object For Dynamic Building

