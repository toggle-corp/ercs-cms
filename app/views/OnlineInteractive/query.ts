/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const ONLINE_INTERACTIVES = gql`
    query OnlineInteractives($pagination: OffsetPaginationInput, $filters: ReportFilter) {
        reports(pagination: $pagination, filters: $filters) {
            results {
                id
                createdAt
                title
                updatedAt
            }
            totalCount
        }
    }
`;

const ONLINE_INTERACTIVE_DETAIL = gql`
    query OnlineInteractiveDetail($id: ID!) {
        report(id: $id) {
            id
            title
            file {
                url
                name
            }
            coverImage {
                url
                name
            }
        }
    }
`;

const CREATE_ONLINE_INTERACTIVE = gql`
    mutation CreateOnlineInteractive($data: ReportCreateInput!) {
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

const UPDATE_ONLINE_INTERACTIVE = gql`
    mutation UpdateOnlineInteractive($id: ID!, $data: ReportUpdateInput!) {
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

const DELETE_ONLINE_INTERACTIVE = gql`
    mutation DeleteOnlineInteractive($id: ID!) {
        deleteReport(id: $id) {
            errors
            ok
        }
    }
`;
