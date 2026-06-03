/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    me {
      id
      email
      fullName
      role
      roleDisplay
      regionId
      lastLogin
      isActive
      createdAt
    }
  }
`;

const USERS = gql`
    query Users($pagination: OffsetPaginationInput, $filters: UserFilter) {
        users(pagination: $pagination, filters: $filters) {
            results {
                id
                email
                fullName
                role
                roleDisplay
                regionId
                isActive
                lastLogin
                createdAt
            }
            totalCount
        }
    }
`;

const USER_DETAILS = gql`
    query UserDetail($id: ID!) {
        user(id: $id) {
            id
            email
            fullName
            role
            roleDisplay
            regionId
            isActive
            createdAt
        }
    }
`;

const CREATE_USER_MUTATION = gql`
    mutation CreateUser($data: UserCreateInput!) {
        createUser(data: $data) {
            ... on UserTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_USER_MUTATION = gql`
    mutation UpdateUser($id: ID!, $data: UserUpdateInput!) {
        updateUser(id: $id, data: $data) {
            ... on UserTypeMutationResponseType {
                errors
                ok
                result {
                    id
                    email
                    fullName
                    role
                    isActive
                    regionId
                    roleDisplay
                    createdAt
                }
            }
        }
    }
`;

const DELETE_USER = gql`
    mutation DeleteUser($id: ID!) {
        deleteUser(id: $id) {
            ... on UserTypeMutationResponseType {
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

const ENUMS = gql`
    query Enums {
        enums {
            UserRole {
                key
                label
            }
        }
    }
`;

const ADMIN_AREAS = gql`
    query AdminAreas($filters: AdminAreaFilter) {
        adminAreas(filters: $filters) {
            results {
                id
                name
            }
        }
    }
`;
