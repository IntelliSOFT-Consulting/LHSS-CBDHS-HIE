"use client";

// import Head from "next/head";
// import Image from "next/image";
import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { Button, Container, Header, Tab, Divider } from "semantic-ui-react";
import React from "react";
import PatientList from "../components/PatientList";
import DetectedMatches from "../components/DetectedMatches";

const panes = [
  {
    menuItem: "Crossborder Patients List",
    render: () => (
      <Tab.Pane>
        <PatientList />
      </Tab.Pane>
    ),
  },
  {
    menuItem: "Matched Patients",
    render: () => (
      <Tab.Pane>
        <DetectedMatches />
      </Tab.Pane>
    ),
  },
  // { menuItem: "Link Patient Records", render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  // { menuItem: "Merge Patient Records", render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  // { menuItem: "Healthcare Facilities", render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  // { menuItem: "Report & Monitoring", render: () => <Tab.Pane>Tab 3 Content</Tab.Pane> },
  { menuItem: "Settings", render: () => <Tab.Pane>Failed to load settings</Tab.Pane> },

];

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      {/* <Head></Head> */}

      <main className={styles.main}>
        <Header as="h1" color="violet">
          CBDHS HIE Admin
        </Header>
        <Divider />
        <br />
        <br />
        <Container>
          <Tab panes={panes} />
        </Container>
      </main>
    </>
  );
}
