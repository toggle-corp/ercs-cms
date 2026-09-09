import { createContext } from 'react';

import type {
    AppEnumCollectionDashboardPage,
    AppEnumCollectionLinkType,
    AppEnumCollectionPmerReportCategory,
    AppEnumCollectionPmerReportDocumentType,
    AppEnumCollectionReportContentType,
    AppEnumCollectionReportType,
    AppEnumCollectionReportVisibility,
    AppEnumCollectionTeamMemberSex,
    AppEnumCollectionUserRole,
} from '#generated/types/graphql';

export interface GlobalEnumsContextInterface {
    linkType: AppEnumCollectionLinkType[] | undefined;
    reportType: AppEnumCollectionReportType[] | undefined;
    userRole: AppEnumCollectionUserRole[] | undefined;
    teamMemberSex: AppEnumCollectionTeamMemberSex[] | undefined;
    dashboardPage: AppEnumCollectionDashboardPage[] | undefined;
    reportContentType: AppEnumCollectionReportContentType[] | undefined;
    reportVisibility: AppEnumCollectionReportVisibility[] | undefined;
    pmerReportCategory: AppEnumCollectionPmerReportCategory[] | undefined;
    pmerReportDocumentType: AppEnumCollectionPmerReportDocumentType[] | undefined;
}

const GlobalEnumsContext = createContext<GlobalEnumsContextInterface>({
    linkType: undefined,
    reportType: undefined,
    userRole: undefined,
    teamMemberSex: undefined,
    dashboardPage: undefined,
    reportContentType: undefined,
    reportVisibility: undefined,
    pmerReportCategory: undefined,
    pmerReportDocumentType: undefined,
});

export default GlobalEnumsContext;
