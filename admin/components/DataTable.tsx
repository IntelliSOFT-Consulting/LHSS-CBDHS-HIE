// replace with header
import React, { useState } from "react";
import { Table } from "semantic-ui-react";

interface DataTableProps {
  headers: Array<string>;
  data: Array<any>;
}

export default function DataTable(props: DataTableProps) {
  return (
    <>
      <Table celled padded>
        <Table.Header>
          <Table.Row>
            {props.headers.map((header: string) => {
              return (
                <Table.HeaderCell>{header.toUpperCase()}</Table.HeaderCell>
              );
            })}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {props.data.map((row: any) => {
            return (
              <Table.Row>
                {props.headers.map((header: string) => {
                  return <Table.Cell>{row[header]}</Table.Cell>;
                })}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
}
