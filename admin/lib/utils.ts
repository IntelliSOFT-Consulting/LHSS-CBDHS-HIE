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
