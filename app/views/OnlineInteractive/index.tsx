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
    createDateColumn,
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type OnlineInteractivesQuery,
    type ReportFilter,
    ReportTypeEnum,
    useDeleteOnlineInteractiveMutation,
    useOnlineInteractivesQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import OnlineInteractiveFilter from './OnlineInteractiveFilter';

type OnlineInteractiveListItem = NonNullable<NonNullable<OnlineInteractivesQuery['reports']>['results'][number]> & { no: number };

export type OnlineInteractiveFilterType = Pick<ReportFilter, 'search'>;

const defaultFilter: OnlineInteractiveFilterType = {
    search: undefined,
};

function OnlineInteractive() {
    const {
        filter,
        rawFilter,
        filtered,
        setFilterField,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState({
        filter: defaultFilter,
    });

    const alert = useAlert();
    const navigate = useRouting();

    const queryVariables = useMemo(() => ({
        pagination: {
            limit,
            offset,
        },
        filters: {
            reportType: ReportTypeEnum.OnlineInteractive,
            title: filter.search ? { iContains: filter.search } : undefined,
        },
    }), [limit, offset, filter]);

    const [
        { fetching, data },
        reExecuteQuery,
    ] = useOnlineInteractivesQuery({ variables: queryVariables });
    const [, deleteOnlineInteractive] = useDeleteOnlineInteractiveMutation();

    const tableData: OnlineInteractiveListItem[] = useMemo(() => (
        (data?.reports?.results ?? []).map((report, index) => ({
            ...report,
            no: (page - 1) * limit + index + 1,
        }))
    ), [page, data, limit]);

    const onDeleteClick = useCallback(
        (id: string) => {
            deleteOnlineInteractive({ id }).then((resp) => {
                const result = resp.data?.deleteReport;
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Online interactive deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteOnlineInteractive, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createNumberColumn<OnlineInteractiveListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createDateColumn<OnlineInteractiveListItem, string | number>(
            'createdAt',
            'Created At',
            (item) => item.createdAt,
        ),
        createStringColumn<OnlineInteractiveListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createDateColumn<OnlineInteractiveListItem, string | number>(
            'updatedAt',
            'Updated At',
            (item) => item.updatedAt,
        ),
        createElementColumn<OnlineInteractiveListItem, string | number, EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete: onDeleteClick,
                itemTitle: datum.title,
                to: 'editOnlineInteractive',
            }),
            { columnWidth: 150 },
        ),
    ], [onDeleteClick]);

    const handleCreateClick = useCallback(() => {
        navigate('createOnlineInteractive');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Online Interactives"
            headerDescription="Manage online interactive reports"
            filters={(
                <OnlineInteractiveFilter
                    value={rawFilter}
                    onChange={setFilterField}
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
                    itemsCount={data?.reports?.totalCount ?? 0}
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

export default OnlineInteractive;
