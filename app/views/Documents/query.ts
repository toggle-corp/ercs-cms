/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const DOCUMENTS = gql`
    query Documents($pagination: OffsetPaginationInput, $filters: ReportFilter) {
        reports(pagination: $pagination, filters: $filters) {
            results {
                id
                createdAt
                title
                reportType
                reportTypeDisplay
            }
            totalCount
        }
    }
`;

const DELETE_DOCUMENT = gql`
    mutation DeleteDocument($id: ID!) {
        deleteReport(id: $id) {
            ... on ReportTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;

const DOCUMENT_DETAIL = gql`
    query DocumentDetail($id: ID!) {
        report(id: $id) {
            id
            title
            contentType
            reportType
            file {
                url
                name
            }
        }
    }
`;

const CREATE_DOCUMENT = gql`
    mutation CreateDocument($data: ReportCreateInput!) {
        createReport(data: $data) {
            ... on ReportTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;

const UPDATE_DOCUMENT = gql`
    mutation UpdateDocument($id: ID!, $data: ReportUpdateInput!) {
        updateReport(id: $id, data: $data) {
            ... on ReportTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;
