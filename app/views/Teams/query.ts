/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const TEAMS = gql`
    query Teams($pagination: OffsetPaginationInput) {
        teams(pagination: $pagination) {
            results {
                id
                createdAt
                updatedAt
                name
                description
            }
            totalCount
        }
    }
`;

const TEAM_DETAILS = gql`
    query TeamDetail($id: ID!) {
        team(id: $id) {
            id
            name
            description
        }
    }
`;

const CREATE_TEAM_MUTATION = gql`
    mutation CreateTeam($data: TeamCreateInput!) {
        createTeam(data: $data) {
        ... on TeamTypeMutationResponseType {
            errors
            ok
        }
    }
}
`;

const UPDATE_TEAM_MUTATION = gql`
    mutation UpdateTeam($id: ID!, $data: TeamUpdateInput!) {
        updateTeam(id: $id, data: $data) {
        ... on TeamTypeMutationResponseType {
            errors
            ok
        }
    }
}
`;

const DELETE_TEAM = gql`
    mutation DeleteTeam($id: ID!) {
        deleteTeam(id: $id) {
            ... on TeamTypeMutationResponseType {
                errors
                ok
                result {
                    id
                    name
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
