import { createContext } from 'react';

import type {
    AppEnumCollectionDashboardPage,
    AppEnumCollectionLinkType,
    AppEnumCollectionTeamMemberSex,
    AppEnumCollectionUserRole,
} from '#generated/types/graphql';

export interface GlobalEnumsContextInterface {
    linkType: AppEnumCollectionLinkType[] | undefined;
    userRole: AppEnumCollectionUserRole[] | undefined;
    teamMemberSex: AppEnumCollectionTeamMemberSex[] | undefined;
    dashboardPage: AppEnumCollectionDashboardPage[] | undefined;
}

const GlobalEnumsContext = createContext<GlobalEnumsContextInterface>({
    linkType: undefined,
    userRole: undefined,
    teamMemberSex: undefined,
    dashboardPage: undefined,
});

export default GlobalEnumsContext;
