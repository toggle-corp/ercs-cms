/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const PAGE_OPTIONS = gql`
    query PageOptions {
        enums {
            DashboardPage {
                key
                label
            }
        }
    }
`;
const EXTERNAL_DASHBOARDS = gql`
    query HomeExternalDashboards($pagination: OffsetPaginationInput, $filters: ExternalDashboardFilter) {
        externalDashboards(pagination: $pagination, filters: $filters) {
            results {
                id
                title
                description
                url
                page
                pageDisplay
                isActive
                order
                showOnHome
            }
            totalCount
        }
    }
`;

const QUICK_LINKS_DASHBOARDS = gql`
    query HomeQuickLinksDashboards {
        externalDashboards(filters: {showOnHome: true, isActive: true}) {
            results {
                id
                title
                description
                url
                page
                pageDisplay
                isActive
                order
                showOnHome
            }
            totalCount
        }
    }
`;

const UPDATE_EXTERNAL_DASHBOARD = gql`
    mutation HomeUpdateExternalDashboard($id: ID!, $data: ExternalDashboardUpdateInput!) {
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
