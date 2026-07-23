import {
    useCallback,
    useMemo,
} from 'react';
import { useParams } from 'react-router';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import {
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import StatusCell from '#components/StatusCell';
import {
    AdminAreaLevel,
    type ExternalDashboardFilter,
    Ordering,
    type ResourceDashboardsQuery,
    useCapacityAndResourceDetailQuery,
    useDeleteResourceDashboardMutation,
    useResourceDashboardsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useDashboardReorder, { createDragHandleColumn } from '#hooks/useDashboardReorder';
import useFilterState from '#hooks/useFilterState';
import useRegionMap from '#hooks/useRegionMap';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import ResourceDashboardsFilters from './ResourceDashboardsFilters';

type DashboardListItem = NonNullable<NonNullable<ResourceDashboardsQuery['externalDashboards']>['results'][number]> & { no: string };

export interface DashboardFilterType extends Omit<ExternalDashboardFilter, 'isActive'> {
    isActive: string | undefined;
}

const defaultFilter: DashboardFilterType = {
    isActive: undefined,
    search: undefined,
    regions: undefined,
};

function ResourceDashboards() {
    const { id } = useParams();

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
    const navigate = useRouting();

    const regionMap = useRegionMap(AdminAreaLevel.Region);

    const [{ data: detailData }] = useCapacityAndResourceDetailQuery({
        variables: { id: id ?? '' },
        pause: !id,
    });

    const [, deleteResourceDashboard] = useDeleteResourceDashboardMutation();
    const [{ fetching, data }, reExecuteQuery] = useResourceDashboardsQuery({
        variables: {
            filters: {
                capacityAndResources: isDefined(id) ? [id] : undefined,
                isActive: isDefined(filter.isActive) ? filter.isActive === 'true' : undefined,
                search: filter.search,
                regions: filter.regions?.length === 0 ? undefined : filter.regions,
            },
            pagination: {
                limit,
                offset,
            },
            order: { order: Ordering.Asc },
        },
        pause: !id,
    });

    const serverData: DashboardListItem[] = useMemo(() => (
        (data?.externalDashboards?.results ?? []).map((dashboard, index) => ({
            ...dashboard,
            no: String((page - 1) * limit + index + 1),
        }))
    ), [page, data, limit]);

    const { tableData, rowModifier } = useDashboardReorder(serverData, page, limit);

    const onDeleteClick = useCallback(
        (dashboardId: string) => {
            deleteResourceDashboard({ id: dashboardId }).then((resp) => {
                const result = resp.data?.deleteExternalDashboard;
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Dashboard deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteResourceDashboard, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createDragHandleColumn<DashboardListItem>(),
        createStringColumn<DashboardListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createStringColumn<DashboardListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createStringColumn<DashboardListItem, string | number>(
            'operation',
            'Operation',
            (item) => item.pageDisplay,
        ),
        createStringColumn<DashboardListItem, string | number>(
            'region',
            'Region',
            (item) => (isDefined(item.regionId) ? regionMap[item.regionId] : '-'),
        ),
        createStringColumn<DashboardListItem, string | number>(
            'order',
            'Display Order',
            (item) => (isDefined(item.order) ? String(item.order) : '-'),
        ),
        createElementColumn<DashboardListItem, string | number, { isActive: boolean }>(
            'status',
            'Status',
            StatusCell,
            (_, datum) => ({
                isActive: datum.isActive,
            }),
        ),
        createElementColumn<DashboardListItem, string | number, EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: id ?? '',
                dashboard: datum.id,
                onDelete: () => onDeleteClick(datum.id),
                itemTitle: datum.title,
                to: 'editResourceDashboard',
            }),
            { columnWidth: 150 },
        ),
    ], [onDeleteClick, id, regionMap]);

    const handleCreateClick = useCallback(() => {
        if (isDefined(id)) {
            navigate('createResourceDashboard', { id });
        }
    }, [navigate, id]);

    return (
        <Container
            withPadding
            heading={isDefined(detailData?.capacityAndResource?.title)
                ? `${detailData.capacityAndResource.title} Dashboards`
                : 'Dashboards'}
            headerDescription="Track, organize, and update the dashboards for this capacity and resource"
            filters={(
                <ResourceDashboardsFilters
                    value={rawFilter}
                    onChange={setFilterField}
                    filtered={filtered}
                    onReset={resetFilter}
                />
            )}
            headerActions={(
                <Button
                    name={undefined}
                    onClick={handleCreateClick}
                    before={(<AddFillIcon />)}
                    styleVariant="filled"
                >
                    Create
                </Button>
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
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={filtered}
                pending={fetching}
                rowModifier={rowModifier}
            />
        </Container>
    );
}

export default ResourceDashboards;
