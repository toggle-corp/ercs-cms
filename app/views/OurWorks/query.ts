/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const EXTERNAL_DASHBOARDS = gql`
    query ExternalDashboards($pagination: OffsetPaginationInput, $filters: ExternalDashboardFilter) {
        externalDashboards(pagination: $pagination, filters: $filters) {
            results {
                createdAt
                createdById
                description
                id
                isActive
                order
                page
                pageDisplay
                regionId
                showOnHome
                title
                updatedAt
                url
            }
            totalCount
        }
    }
`;

const DELETE_EXTERNAL_DASHBOARD = gql`
    mutation DeleteExternalDashboard($id: ID!) {
        deleteExternalDashboard(id: $id) {
            ... on ExternalDashboardTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
            ... on OperationInfo {
                messages {
                    message
                }
            }
        }
    }
`;

const DASHBOARD_ENUMS = gql`
    query DashboardEnums {
        enums {
            DashboardPage {
                key
                label
            }
        }
    }
`;

const EXTERNAL_DASHBOARD_DETAIL = gql`
    query ExternalDashboardDetail($id: ID!) {
        externalDashboard(id: $id) {
            id
            description
            isActive
            order
            page
            regionId
            title
            url
        }
    }
`;

const CREATE_EXTERNAL_DASHBOARD = gql`
    mutation CreateExternalDashboard($data: ExternalDashboardCreateInput!) {
        createExternalDashboard(data: $data) {
            ... on ExternalDashboardTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;

const UPDATE_EXTERNAL_DASHBOARD = gql`
    mutation UpdateExternalDashboard($id: ID!, $data: ExternalDashboardUpdateInput!) {
        updateExternalDashboard(id: $id, data: $data) {
            ... on ExternalDashboardTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;
