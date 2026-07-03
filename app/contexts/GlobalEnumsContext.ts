import { createContext } from 'react';

import type {
    AppEnumCollectionDashboardPage,
    AppEnumCollectionLinkType,
    AppEnumCollectionReportContentType,
    AppEnumCollectionTeamMemberSex,
    AppEnumCollectionUserRole,
} from '#generated/types/graphql';

export interface GlobalEnumsContextInterface {
    linkType: AppEnumCollectionLinkType[] | undefined;
    userRole: AppEnumCollectionUserRole[] | undefined;
    teamMemberSex: AppEnumCollectionTeamMemberSex[] | undefined;
    dashboardPage: AppEnumCollectionDashboardPage[] | undefined;
    reportContentType: AppEnumCollectionReportContentType[] | undefined;
}

const GlobalEnumsContext = createContext<GlobalEnumsContextInterface>({
    linkType: undefined,
    userRole: undefined,
    teamMemberSex: undefined,
    dashboardPage: undefined,
    reportContentType: undefined,
});

export default GlobalEnumsContext;
