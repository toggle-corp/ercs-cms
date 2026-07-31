import {
    useCallback,
    useMemo,
} from 'react';
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
import Link, { type Props as LinkProps } from '#components/Link';
import StatusCell from '#components/StatusCell';
import {
    type CapacityAndResourceFilter,
    type CapacityAndResourcesQuery,
    useCapacityAndResourcesQuery,
    useDeleteCapacityAndResourceMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import CapacityAndResourcesFilter from './CapacityAndResourcesFilter';

type ResourcesListItem = NonNullable<NonNullable<CapacityAndResourcesQuery['capacityAndResources']>['results'][number]> & { no: string };

export interface ResourcesFilterType extends Omit<CapacityAndResourceFilter, 'isActive' | 'title'> {
    isActive: string | undefined;
    title: string | undefined;
}

const defaultFilter: ResourcesFilterType = {
    isActive: undefined,
    title: undefined,
};

function CapacityAndResourcesList() {
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

    const [, deleteCapacityAndResource] = useDeleteCapacityAndResourceMutation();
    const [{ fetching, data }, reExecuteQuery] = useCapacityAndResourcesQuery({
        variables: {
            filters: {
                isActive: isDefined(filter.isActive) ? filter.isActive === 'true' : undefined,
                title: filter.title ? { iContains: filter.title } : undefined,
            },
            pagination: {
                limit,
                offset,
            },
        },
    });

    const tableData: ResourcesListItem[] = useMemo(() => (
        (data?.capacityAndResources?.results ?? []).map((resource, index) => ({
            ...resource,
            no: String((page - 1) * limit + index + 1),
        }))
    ), [page, data, limit]);

    const onDeleteClick = useCallback(
        (id: string) => {
            deleteCapacityAndResource({ id }).then((resp) => {
                const result = resp.data?.deleteCapacityAndResource;
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Resource deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteCapacityAndResource, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<ResourcesListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createElementColumn<ResourcesListItem, string | number, LinkProps>(
            'title',
            'Title',
            Link,
            (_, item) => ({
                children: item.title,
                to: 'resourceDashboards',
                attrs: { id: item.id },
            }),
        ),
        createStringColumn<ResourcesListItem, string | number>(
            'dashboardsCount',
            'Dashboards Count',
            (item) => (isDefined(item.dashboardsCount) ? String(item.dashboardsCount) : '-'),
        ),
        createElementColumn<ResourcesListItem, string | number, { isActive: boolean }>(
            'status',
            'Status',
            StatusCell,
            (_, datum) => ({
                isActive: datum.isActive,
            }),
        ),
        createElementColumn<ResourcesListItem, string | number, EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete: onDeleteClick,
                itemTitle: datum.title,
                to: 'editResources',
            }),
            { columnWidth: 150 },
        ),
    ], [onDeleteClick]);

    const handleCreateClick = useCallback(() => {
        navigate('createResources');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Capacity and Resources"
            filters={(
                <CapacityAndResourcesFilter
                    value={rawFilter}
                    onChange={setFilterField}
                    filtered={filtered}
                    onReset={resetFilter}
                />
            )}
            headerDescription="Track, organize, and update capacity and resources"
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
                    itemsCount={data?.capacityAndResources?.totalCount ?? 0}
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
            />
        </Container>
    );
}

export default CapacityAndResourcesList;
