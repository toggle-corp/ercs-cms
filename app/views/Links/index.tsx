import {
    useCallback,
    useMemo,
} from 'react';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateInput,
    Pager,
    Table,
    TextInput,
} from '@ifrc-go/ui';
import {
    createDateColumn,
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type InternalLinksQuery,
    type LinkFilter,
    useDeleteLinkMutation,
    useInternalLinksQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

type InternalLinkListItem = NonNullable<NonNullable<InternalLinksQuery['internalLinks']>['results'][number]> & { no: string }

interface LinkFilterType extends Omit<LinkFilter, 'createdAt'> {
    createdAtGte: string | undefined;
    createdAtLte: string | undefined;
}

const defaultFilter: LinkFilterType = {
    search: undefined,
    createdAtGte: undefined,
    createdAtLte: undefined,
};
function Links() {
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
            search: filter.search,
            createdAt: (filter.createdAtGte || filter.createdAtLte) ? {
                gte: filter.createdAtGte,
                lte: filter.createdAtLte,
            } : undefined,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useInternalLinksQuery(
        { variables: queryVariables },
    );
    const [, deleteLink] = useDeleteLinkMutation();

    const onDeleteClick = useCallback(
        (id: string) => {
            deleteLink({ id }).then((resp) => {
                const result = resp.data?.deleteLink;
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Link deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteLink, reExecuteQuery, alert],
    );

    const tableData = useMemo(() => (
        data?.internalLinks.results.map((user, index) => {
            const no = (page - 1) * limit + index + 1;
            return {
                ...user,
                no,
            };
        }) as unknown as InternalLinkListItem[]), [page, data, limit]);

    const columns = useMemo(() => [
        createStringColumn<InternalLinkListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createDateColumn<InternalLinkListItem, string | number>(
            'createdAt',
            'Created At',
            (item) => item.createdAt,
        ),
        createStringColumn<InternalLinkListItem, string | number>(
            'title',
            'Title',
            (item) => item.title ?? '-',
        ),
        createElementColumn<InternalLinkListItem, string | number,
            EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete: onDeleteClick,
                    itemTitle: datum.title,
                    to: 'editUser',
                }),
                { columnWidth: 150 },
            ),
    ], [onDeleteClick]);

    const handleCreateClick = useCallback(() => {
        navigate('createLink');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Links"
            headerDescription="Control and manage public-facing resource links"
            filters={(
                <>
                    <DateInput
                        name="createdAtGte"
                        label="Created at start date"
                        value={rawFilter.createdAtGte}
                        onChange={setFilterField}
                    />
                    <DateInput
                        name="createdAtLte"
                        label="Created at end date"
                        value={rawFilter.createdAtLte}
                        onChange={setFilterField}
                    />
                    <TextInput
                        name="search"
                        placeholder="Search"
                        value={rawFilter.search}
                        onChange={setFilterField}
                    />
                </>
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.internalLinks.totalCount ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
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

export default Links;
