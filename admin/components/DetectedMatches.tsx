// replace with header
import React, { useState } from "react";
import { Dimmer, Loader, Image, Segment } from "semantic-ui-react";
import { parseFhirPatient } from "../lib/utils";
import DataTable from "./DataTable";

export default function DetectedMatches() {
  const url = "http://hiedhs.intellisoftkenya.com:8082/matching?operation=findPossibleMatches";
  let [patientList, setPatientList] = useState([]);

  let getData = async () => {
    let data: any = await (
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
    console.log(data);
    data = data.possibleMatches;
    let _p = [];
    setPatientList(data);
  };

  useState(() => {
    getData();
  }, []);

  return (
    <>
      {patientList.length > 0 ? (
        <>
          {/* {JSON.stringify(patientList)} */}
          <DataTable
            data={patientList}
            headers={[
              "goldenResourceId",
              "sourceResourceId",
              "matchResult",
              "linkSource",
              "eidMatch",
              "hadToCreateNewResource",
              "score",
            ]}
          />
        </>
      ) : (
        <Segment>
          <br />
          <br />
          <br />
          <Dimmer active inverted>
            <Loader content="Loading data" />
          </Dimmer>

          {/* <Image src="/images/wireframe/short-paragraph.png" /> */}
        </Segment>
      )}
    </>
  );
}
