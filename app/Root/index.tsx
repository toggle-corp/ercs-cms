import {
    Suspense,
    useMemo,
    useState,
} from 'react';
import { Cookies } from 'react-cookie';
import { Outlet } from 'react-router';
import { AlertContainer } from '@ifrc-go/ui';
import { AlertContext } from '@ifrc-go/ui/contexts';
import { cacheExchange } from '@urql/exchange-graphcache';
import {
    Client,
    fetchExchange,
    Provider as UrqlProvider,
} from 'urql';

import PreloadMessage from '#components/PreloadMessage';
import {
    api,
    appTitle,
    environment,
} from '#config';
import GlobalEnumsContext, { type GlobalEnumsContextInterface } from '#contexts/GlobalEnumsContext';
import UserContext, { type UserContextInterface } from '#contexts/UserContext';
import {
    type MeQuery,
    useGlobalEnumsQuery,
} from '#generated/types/graphql';
import useAlertContextProviderValue from '#hooks/useAlertContextProviderValue';
import { ME_QUERY } from '#views/RootLayout';

const COOKIE_NAME = `ERCS-${environment}-CSRFTOKEN`;
const GRAPHQL_ENDPOINT = `${api}/graphql/`;

const cookies = new Cookies();
const gqlClient = new Client({
    url: GRAPHQL_ENDPOINT,
    exchanges: [
        cacheExchange({
            updates: {
                Mutation: {
                    logout: (_result, _args, cache) => {
                        cache.updateQuery({ query: ME_QUERY }, () => ({ me: null }));
                    },
                },
            },
        }),
        fetchExchange,
    ],
    fetchOptions: () => ({
        headers: {
            'X-CSRFToken': cookies.get(COOKIE_NAME),
        },
        credentials: 'include',
    }),
    requestPolicy: 'cache-and-network',
    suspense: false,
});

// NOTE: useGlobalEnumsQuery needs UrqlProvider as an parent.
// Since Root itself renders UrqlProvider, the hook must live in
// RootContent a child component mounted inside that provider.
function RootContent() {
    const [user, setUser] = useState<MeQuery['me'] | undefined>();
    const authenticated = !!user;
    const userContext: UserContextInterface = useMemo(() => ({
        authenticated,
        user,
        setUser,
    }), [authenticated, user]);

    const alertContextValue = useAlertContextProviderValue();

    const [{ data: globalEnumsData }] = useGlobalEnumsQuery();

    const globalEnumsContext: GlobalEnumsContextInterface = useMemo(() => ({
        linkType: globalEnumsData?.enums.LinkType,
        reportType: globalEnumsData?.enums.ReportType,
        userRole: globalEnumsData?.enums.UserRole,
        teamMemberSex: globalEnumsData?.enums.TeamMemberSex,
        dashboardPage: globalEnumsData?.enums.DashboardPage,
        reportContentType: globalEnumsData?.enums.ReportContentType,
        reportVisibility: globalEnumsData?.enums.ReportVisibility,
    }), [globalEnumsData]);

    return (
        <UserContext.Provider value={userContext}>
            <GlobalEnumsContext.Provider value={globalEnumsContext}>
                <AlertContext.Provider value={alertContextValue}>
                    <AlertContainer />
                    <Suspense
                        fallback={(
                            <PreloadMessage>
                                {appTitle}
                                {' '}
                                loading...
                            </PreloadMessage>
                        )}
                    >
                        <Outlet />
                    </Suspense>
                </AlertContext.Provider>
            </GlobalEnumsContext.Provider>
        </UserContext.Provider>
    );
}

function Root() {
    return (
        <UrqlProvider value={gqlClient}>
            <RootContent />
        </UrqlProvider>
    );
}

export default Root;
