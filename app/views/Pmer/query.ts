/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const PMER_REPORTS = gql`
    query PmerReports($pagination: OffsetPaginationInput, $filters: PmerReportFilter) {
        pmerReports(pagination: $pagination, filters: $filters) {
            results {
                id
                title
                category
                categoryDisplay
                reportType
                reportTypeDisplay
                department
                project
                visibility
                visibilityDisplay
                region {
                    id
                    name
                }
            }
            totalCount
        }
    }
`;

const PMER_REPORT_DETAIL = gql`
    query PmerReportDetail($id: ID!) {
        pmerReport(id: $id) {
            id
            title
            description
            category
            reportType
            department
            project
            visibility
            region {
                id
            }
            file {
                url
                name
            }
        }
    }
`;

const CREATE_PMER_REPORT = gql`
    mutation CreatePmerReport($data: PmerReportCreateInput!) {
        createPmerReport(data: $data) {
            ... on PmerReportTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;

const UPDATE_PMER_REPORT = gql`
    mutation UpdatePmerReport($id: ID!, $data: PmerReportUpdateInput!) {
        updatePmerReport(id: $id, data: $data) {
            ... on PmerReportTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;

const DELETE_PMER_REPORT = gql`
    mutation DeletePmerReport($id: ID!) {
        deletePmerReport(id: $id) {
            ... on PmerReportTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;
