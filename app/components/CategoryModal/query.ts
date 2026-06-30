/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const THEMATIC_AREAS = gql`
    query ThematicAreas($pagination: OffsetPaginationInput, $filters: ThematicAreaFilter) {
        thematicAreas(pagination: $pagination, filters: $filters) {
            totalCount
            results {
                id
                name
                createdAt
                updatedAt
            }
        }
    }
`;

const CREATE_THEMATIC_AREA = gql`
    mutation CreateThematicArea($data: ThematicAreaInput!) {
        createThematicArea(data: $data) {
            ... on ThematicAreaTypeMutationResponseType {
                errors
                ok
                result {
                    id
                    name
                }
            }
        }
    }
`;

const UPDATE_THEMATIC_AREA = gql`
    mutation UpdateThematicArea($id: ID!, $data: ThematicAreaInput!) {
        updateThematicArea(id: $id, data: $data) {
            ... on ThematicAreaTypeMutationResponseType {
                errors
                ok
                result {
                    id
                    name
                }
            }
        }
    }
`;

const DELETE_THEMATIC_AREA = gql`
    mutation DeleteThematicArea($id: ID!) {
        deleteThematicArea(id: $id) {
            ... on ThematicAreaTypeMutationResponseType {
                errors
                ok
                result {
                    id
                }
            }
        }
    }
`;
