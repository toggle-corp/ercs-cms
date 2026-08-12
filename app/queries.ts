/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const BULK_UPDATE_EXTERNAL_DASHBOARDS = gql`
    mutation BulkUpdateExternalDashboards($data: [ExternalDashboardOrderInput!]!) {
        bulkUpdateExternalDashboards(data: $data) {
            ... on ExternalDashboardTypeListMutationResponseType {
                ok
                errors
            }
        }
    }
`;
