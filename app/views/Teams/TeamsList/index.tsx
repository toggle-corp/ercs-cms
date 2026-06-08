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
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type TeamsQuery,
    useDeleteTeamMutation,
    useTeamsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import usePagination from '#hooks/usePagination';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

type TeamsListItem = NonNullable<NonNullable<TeamsQuery['teams']>['results'][number] & { no: string }>;

function Teams() {
    const {
        page,
        setPage,
        pageSize,
        variables,
    } = usePagination();

    const alert = useAlert();
    const navigate = useRouting();

    const [{ fetching, data }, reExecuteQuery] = useTeamsQuery({ variables });
    const [, deleteTeam] = useDeleteTeamMutation();

    const tableData = useMemo(() => (
        data?.teams.results.map((user, index) => {
            const no = (page - 1) * pageSize + index + 1;
            return {
                ...user,
                no,
            };
        }) as unknown as TeamsListItem[]), [page, data, pageSize]);

    const onDeleteClick = useCallback(
        (id: string) => {
            deleteTeam({ id }).then((resp) => {
                if (resp.data?.deleteTeam) {
                    reExecuteQuery();
                    alert.show('Team deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteTeam, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<TeamsListItem, string | number>(
            'no',
            'No.',
            (team) => team.no,
        ),
        createDateColumn<TeamsListItem, string | number>(
            'createdAt',
            'Created At',
            (team) => team.createdAt,
        ),
        createStringColumn<TeamsListItem, string | number>(
            'name',
            'Team Name',
            (team) => team.name,
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
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.teams.totalCount ?? 0}
                    maxItemsPerPage={pageSize}
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
                filtered={false}
                pending={fetching}
            />
        </Container>
    );
}

export default Teams;
