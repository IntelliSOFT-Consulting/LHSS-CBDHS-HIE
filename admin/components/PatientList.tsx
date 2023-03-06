// replace with header
import React, { useState } from "react";
import { Dimmer, Loader, Image, Segment } from "semantic-ui-react";
import { parseFhirPatient } from "../lib/utils";
import DataTable from "./DataTable";

export default function PatientList() {
  const url = "http://hiedhs.intellisoftkenya.com:8081/fhir/Patient";
  let [patientList, setPatientList] = useState([]);

  let getPatients = async () => {
    let patients: any = await (
      await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
    console.log(patients);
    patients = patients.entry;
    let _p = [];
    for (let patient of patients) {
      let parsedPatient = parseFhirPatient(patient.resource);
      if (parsedPatient?.crossBorderId) {
        _p.push(parsedPatient);
      }
    }
    setPatientList(_p);
  };

  useState(() => {
    getPatients();
  }, []);

  return (
    <>
      {patientList.length > 0 ? (
        <>
          {/* {JSON.stringify(patientList)} */}
          <DataTable
            data={patientList}
            headers={[
              "crossBorderId",
              "otherNames",
              "surname",
              "sex",
              "dob",
              "country",
              "county",
              "subCounty",
            ]}
          />
        </>
      ) : (
        <Segment>
          <br />
          <br />
          <br />
          <Dimmer active inverted>
            <Loader content="Loading patients" />
          </Dimmer>

          {/* <Image src="/images/wireframe/short-paragraph.png" /> */}
        </Segment>
      )}
    </>
  );
}
