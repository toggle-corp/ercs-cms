import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    Button,
    Container,
    ListView,
    Modal,
    Pager,
    SelectInput,
    Table,
    TextInput,
} from '@ifrc-go/ui';
import {
    createActionColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    type HomeExternalDashboardsQuery,
    type HomeExternalDashboardsQueryVariables,
    type HomeQuickLinksDashboardsQuery,
    useHomeExternalDashboardsQuery,
    useHomeQuickLinksDashboardsQuery,
    useHomeUpdateExternalDashboardMutation,
    usePageOptionsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import {
    errorMessage,
    idSelector,
    keySelector,
    labelSelector,
} from '#utils/common';

const MAX_DASHBOARDS_IN_HOME = 6;
type HomeListItem = NonNullable<NonNullable<HomeExternalDashboardsQuery['externalDashboards']>['results'][number]> & { no: number};
type QuickLinksListItem = NonNullable<NonNullable<HomeQuickLinksDashboardsQuery['externalDashboards']>['results'][number]> & { no: number};

type DashboardsFilterType = NonNullable<HomeExternalDashboardsQueryVariables['filters']>;
const defaultFilter: DashboardsFilterType = {
    page: undefined,
    search: undefined,
};

function Home() {
    const {
        filter,
        rawFilter,
        filtered,
        setFilterField,
        resetFilter,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState({
        filter: defaultFilter,
    });

    const alert = useAlert();

    const [removingId, setRemovingId] = useState<string | undefined>();

    const [, updateDashboard] = useHomeUpdateExternalDashboardMutation();

    const queryVariables = useMemo(() => ({
        pagination: {
            limit,
            offset,
        },
        filters: {
            page: filter.page,
            search: filter.search,
            isActive: true,
            showOnHome: false,
        },
    }), [limit, offset, filter.page, filter.search]);

    const [
        { fetching: dashboardsPending, data },
        reExecuteMainQuery,
    ] = useHomeExternalDashboardsQuery({
        variables: queryVariables,
    });

    const [
        { fetching: quickLinksPending, data: quickLinksData },
        reExecuteQuickLinksQuery,
    ] = useHomeQuickLinksDashboardsQuery();

    const quickLinksResults = quickLinksData?.externalDashboards?.results;
    const dashboardLimitReached = quickLinksResults?.length === MAX_DASHBOARDS_IN_HOME;

    const tableData: HomeListItem[] = useMemo(() => (
        (data?.externalDashboards?.results ?? []).map((dashboard, index) => ({
            ...dashboard,
            no: (page - 1) * limit + index + 1,
        }))
    ), [page, data, limit]);

    const quickLinksTableData: QuickLinksListItem[] = useMemo(() => (
        (quickLinksResults ?? []).map((dashboard, index) => ({
            ...dashboard,
            no: index + 1,
        }))
    ), [quickLinksResults]);

    const [
        { fetching: pageOptionsPending, data: pageOptionsData },
    ] = usePageOptionsQuery();

    const pageOptions = pageOptionsData?.enums.DashboardPage;

    const handleAddToQuickLinks = useCallback((id: string) => {
        updateDashboard({ id, data: { showOnHome: true } }).then((resp) => {
            const result = resp.data?.updateExternalDashboard;
            if (result?.ok) {
                reExecuteMainQuery();
                reExecuteQuickLinksQuery();
                alert.show('Added to quick links', { variant: 'success' });
            } else {
                alert.show(errorMessage, { variant: 'danger' });
            }
        }).catch(() => {
            alert.show(errorMessage, { variant: 'danger' });
        });
    }, [updateDashboard, reExecuteMainQuery, reExecuteQuickLinksQuery, alert]);

    const handleRemoveClick = useCallback((id: string) => {
        setRemovingId(id);
    }, []);

    const handleRemoveCancel = useCallback(() => {
        setRemovingId(undefined);
    }, []);

    const handleRemoveConfirm = useCallback(() => {
        if (isNotDefined(removingId)) {
            return;
        }
        setRemovingId(undefined);
        updateDashboard({ id: removingId, data: { showOnHome: false } }).then((resp) => {
            const result = resp.data?.updateExternalDashboard;
            if (result?.ok) {
                reExecuteMainQuery();
                reExecuteQuickLinksQuery();
                alert.show('Removed from quick links', { variant: 'success' });
            } else {
                alert.show(errorMessage, { variant: 'danger' });
            }
        }).catch(() => {
            alert.show(errorMessage, { variant: 'danger' });
        });
    }, [removingId, updateDashboard, reExecuteMainQuery, reExecuteQuickLinksQuery, alert]);

    const quickLinksColumns = useMemo(() => [
        createNumberColumn<QuickLinksListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createStringColumn<QuickLinksListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createStringColumn<QuickLinksListItem, string | number>(
            'page',
            'From Page',
            (item) => item.pageDisplay,
        ),
        createActionColumn<HomeListItem, string | number>(
            'action',
            (item) => ({
                children: (
                    <Button
                        name={item.id}
                        onClick={handleRemoveClick}
                        styleVariant="action"
                    >
                        Remove
                    </Button>
                ),
            }),
        ),
    ], [handleRemoveClick]);

    const columns = useMemo(() => [
        createNumberColumn<HomeListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createStringColumn<HomeListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createStringColumn<HomeListItem, string | number>(
            'page',
            'From Page',
            (item) => item.pageDisplay,
        ),
        createActionColumn<HomeListItem, string | number>(
            'action',
            (item) => ({
                children: (
                    <Button
                        name={item.id}
                        onClick={handleAddToQuickLinks}
                        styleVariant="action"
                        disabled={dashboardLimitReached}
                        title={dashboardLimitReached
                            ? 'Dashboards that can be added to home should not exceed 6. You must remove at least one item to add more to Quick Links.'
                            : 'Add dashboard to home'}
                    >
                        Add to Quick Links
                    </Button>
                ),
            }),
        ),
    ], [handleAddToQuickLinks, dashboardLimitReached]);

    return (
        <Container
            withPadding
            heading="Home"
            headerDescription="Manage the quick links of the homepage for more impactful information"
        >
            {quickLinksResults && quickLinksResults.length > 0 && (
                <Container
                    withPadding
                    heading="Added to Quick Links"
                    headingLevel={4}
                >
                    <Table
                        filtered={filtered}
                        keySelector={idSelector}
                        columns={quickLinksColumns}
                        data={quickLinksTableData}
                        pending={quickLinksPending || pageOptionsPending}
                    />
                </Container>
            )}
            <Container
                withPadding
                filters={(
                    <>
                        <SelectInput
                            name="page"
                            placeholder="From Page"
                            value={filter.page}
                            onChange={setFilterField}
                            options={pageOptions}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                        />
                        <TextInput
                            name="search"
                            placeholder="Search by title"
                            value={rawFilter.search}
                            onChange={setFilterField}
                        />
                        <Button
                            name={undefined}
                            onClick={resetFilter}
                            title="Reset"
                            disabled={!filtered}
                        >
                            Reset
                        </Button>
                    </>
                )}
                footerActions={(
                    <Pager
                        activePage={page}
                        itemsCount={data?.externalDashboards?.totalCount ?? 0}
                        maxItemsPerPage={limit}
                        onActivePageChange={setPage}
                    />
                )}
            >
                <Table
                    filtered={filtered}
                    keySelector={idSelector}
                    columns={columns}
                    data={tableData}
                    pending={dashboardsPending || pageOptionsPending}
                />
            </Container>
            {isDefined(removingId) && (
                <Modal
                    heading="Remove from quick links?"
                    size="sm"
                    onClose={handleRemoveCancel}
                    closeOnEscape
                    footerActions={(
                        <ListView spacing="sm">
                            <Button
                                name={undefined}
                                onClick={handleRemoveCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                styleVariant="filled"
                                onClick={handleRemoveConfirm}
                            >
                                Remove
                            </Button>
                        </ListView>
                    )}
                >
                    {`Are you sure you want to remove "${quickLinksResults?.find((item) => item.id === removingId)?.title || 'this dashboard'}" from quick links?`}
                </Modal>
            )}
        </Container>
    );
}

export default Home;
