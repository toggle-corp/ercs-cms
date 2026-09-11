/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const LINKS = gql`
    query Links($pagination: OffsetPaginationInput, $filters: LinkFilter) {
        publicLinks(filters: $filters, pagination: $pagination) {
            totalCount
            results {
                createdAt
                description
                id
                title
                linkType
                linkTypeDisplay
                updatedAt
                url
            }
        }
    }
`;

const CREATE_LINK_MUTATION = gql`
    mutation CreateLink($data: LinkCreateInput!) {
        createLink(data: $data) {
            ... on LinkTypeMutationResponseType {
                errors
                ok
            }
        }
    }
`;

const UPDATE_LINK_MUTATION = gql`
    mutation UpdateLink($id: ID!, $data: LinkUpdateInput!) {
        updateLink(id: $id, data: $data) {
            ... on LinkTypeMutationResponseType {
                errors
                ok
                result {
                    id
                    title
                    linkType
                    description
                    url
                }
            }
        }
    }
`;

const LINK_DETAILS = gql`
    query LinkDetail($id: ID!) {
        link(id: $id) {
            id
            title
            description
            url
            linkType
        }
    }
`;

const DELETE_LINK = gql`
    mutation DeleteLink($id: ID!) {
        deleteLink(id: $id) {
            errors
            ok
        }
    }
`;
