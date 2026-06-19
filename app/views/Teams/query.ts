/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const TEAMS = gql`
    query Teams($pagination: OffsetPaginationInput $filters: TeamFilter) {
        teams(pagination: $pagination, filters: $filters) {
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

const TEAM_MEMBERS = gql`
    query TeamMembers($pagination: OffsetPaginationInput, $filters: TeamMemberFilter) {
        teamMembers(pagination: $pagination, filters: $filters) {
            results {
                id
                name
                email
                sex
                sexDisplay
                region
                woreda
                position
                phoneNumber
                training
                fieldOfStudy
            }
            totalCount
        }
    }
`;

const TEAM_MEMBER = gql`
    query TeamMemberDetails($id: ID!) {
        teamMember(id: $id) {
            id
            name
            email
            sex
            sexDisplay
            region
            woreda
            position
            phoneNumber
            training
            fieldOfStudy
        }
    }
`;

const DELETE_TEAM_MEMBER = gql`
    mutation DeleteTeamMember($id: ID!) {
        deleteTeamMember(id: $id) {
            ... on TeamMemberTypeMutationResponseType {
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

const CREATE_TEAM_MEMBER_MUTATION = gql`
    mutation CreateTeamMember($data: TeamMemberCreateInput!) {
        createTeamMember(data: $data) {
        ... on TeamMemberTypeMutationResponseType {
            errors
            ok
        }
    }
}
`;

const UPDATE_TEAM_MEMBER_MUTATION = gql`
    mutation UpdateTeamMember($id: ID!, $data: TeamMemberUpdateInput!) {
        updateTeamMember(id: $id, data: $data) {
        ... on TeamMemberTypeMutationResponseType {
            errors
            ok
        }
    }
}
`;
