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
import Link, { type Props as LinkProps } from '#components/Link';
import {
    type TeamFilter,
    type TeamsQuery,
    useDeleteTeamMutation,
    useTeamsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import TeamsFilters from './TeamsFilters';

type TeamsListItem = NonNullable<NonNullable<TeamsQuery['teams']>['results'][number]> & { no: number };

export interface TeamsFilterType extends Omit<TeamFilter, 'createdAt'> {
    createdAtGte: string | undefined;
    createdAtLte: string | undefined;
}

const defaultFilter: TeamsFilterType = {
    search: undefined,
    createdAtGte: undefined,
    createdAtLte: undefined,
};

function Teams() {
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

    const [{ fetching, data }, reExecuteQuery] = useTeamsQuery({ variables: queryVariables });
    const [, deleteTeam] = useDeleteTeamMutation();

    const tableData: TeamsListItem[] = useMemo(() => (
        (data?.teams?.results ?? []).map((team, index) => ({
            ...team,
            no: (page - 1) * limit + index + 1,
        }))
    ), [page, data, limit]);

    const onDeleteClick = useCallback(
        (id: string) => {
            deleteTeam({ id }).then((resp) => {
                const result = resp.data?.deleteTeam;
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Team deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteTeam, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createNumberColumn<TeamsListItem, string | number>(
            'no',
            'No.',
            (team) => team.no,
        ),
        createDateColumn<TeamsListItem, string | number>(
            'createdAt',
            'Created At',
            (team) => team.createdAt,
        ),
        createElementColumn<TeamsListItem, string | number,
            LinkProps>(
                'name',
                'Team Name',
                Link,
                (_, team) => ({
                    children: team.name,
                    to: 'teamMembers',
                    attrs: { id: team.id },
                }),
            ),
        createStringColumn<TeamsListItem, string | number>(
            'description',
            'Description',
            (team) => team.description,
        ),
        createDateColumn<TeamsListItem, string | number>(
            'updatedAt',
            'Updated At',
            (team) => team.updatedAt,
        ),
        createElementColumn<TeamsListItem, string | number,
            EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete: onDeleteClick,
                    itemTitle: datum.name,
                    to: 'editTeam',

                }),
                { columnWidth: 150 },
            ),
    ], [onDeleteClick]);

    const handleCreateClick = useCallback(() => {
        navigate('createTeam');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Teams"
            headerDescription="Manage a dedicated team committed to delivering impactful solutions"
            filters={(
                <TeamsFilters
                    value={rawFilter}
                    onChange={setFilterField}
                    onReset={resetFilter}
                    filtered={filtered}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.teams.totalCount ?? 0}
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

export default Teams;
