/* eslint-disable @typescript-eslint/no-unused-vars */
import { gql } from 'urql';

const REPORTS = gql`
    query Reports($pagination: OffsetPaginationInput, $filters: ReportFilter) {
        reports(pagination: $pagination, filters: $filters) {
            results {
                id
                createdAt
                title
                owner
                reportType
                reportTypeDisplay
                thematicAreaId
                updatedAt
                visibility
                visibilityDisplay
            }
            totalCount
        }
    }
`;

const DELETE_REPORT = gql`
    mutation DeleteReport($id: ID!) {
        deleteReport(id: $id) {
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

const REPORT_ENUMS = gql`
    query ReportEnums {
        enums {
            ReportType {
                key
                label
            }
            ReportVisibility {
                key
                label
            }
            ReportContentType {
                key
                label
            }
        }
    }
`;

const REPORT_DETAIL = gql`
    query ReportDetail($id: ID!) {
        report(id: $id) {
            id
            title
            description
            disasterType
            contentType
            iframeUrl
            owner
            visibility
            reportType
            thematicAreaId
            regionId
            publishedAt
            coverImage {
                url
                name
            }
            file {
                url
                name
            }
        }
    }
`;

const CREATE_REPORT = gql`
    mutation CreateReport($data: ReportCreateInput!) {
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

const UPDATE_REPORT = gql`
    mutation UpdateReport($id: ID!, $data: ReportUpdateInput!) {
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
