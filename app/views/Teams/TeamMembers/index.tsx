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
import {
    AdminAreaLevel,
    type TeamMemberFilter,
    type TeamMembersQuery,
    useDeleteTeamMemberMutation,
    useTeamDetailQuery,
    useTeamMembersQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRegionMap from '#hooks/useRegionMap';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import TeamMembersFilters from './TeamMembersFilters';

type TeamMembersListItem = NonNullable<NonNullable<TeamMembersQuery['teamMembers']>['results'][number] & { no: string }>;

const defaultFilter: TeamMemberFilter = {
    search: undefined,
};

function TeamMembers() {
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

    const { id } = useParams();

    const [{ data: teamData, fetching: teamDetailFetch }] = useTeamDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
    });

    const regionMap = useRegionMap(AdminAreaLevel.Region);
    const woredaMap = useRegionMap(AdminAreaLevel.Woreda);

    const [, deleteTeamMember] = useDeleteTeamMemberMutation();
    const [{ fetching, data }, reExecuteQuery] = useTeamMembersQuery({
        variables: {
            filters: {
                teamId: id,
                search: filter.search,
            },
            pagination: {
                limit,
                offset,
            },
        },
        pause: !id,
    });

    const tableData = useMemo(() => (
        data?.teamMembers.results.map((user, index) => {
            const no = (page - 1) * limit + index + 1;
            return {
                ...user,
                no,
            };
        }) as unknown as TeamMembersListItem[]), [page, data, limit]);

    const onDeleteClick = useCallback(
        (memberId: string) => {
            deleteTeamMember({ id: memberId }).then((resp) => {
                const result = resp.data?.deleteTeamMember;
                if (result && 'ok' in result && result.ok) {
                    reExecuteQuery();
                    alert.show('Team Member deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch((error) => {
                alert.show(error ?? errorMessage, { variant: 'danger' });
            });
        },
        [deleteTeamMember, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<TeamMembersListItem, string | number>(
            'no',
            'No.',
            (team) => team.no,
        ),
        createStringColumn<TeamMembersListItem, string | number>(
            'name',
            'Full Name',
            (team) => team.name,
        ),
        createStringColumn<TeamMembersListItem, string | number>(
            'sex',
            'Sex',
            (team) => team.sexDisplay,
        ),
        createStringColumn<TeamMembersListItem, string | number>(
            'region',
            'Region/Zone',
            (team) => (isDefined(team.region) ? regionMap[team.region] : '-'),
        ),
        createStringColumn<TeamMembersListItem, string | number>(
            'woreda',
            'Woreda',
            (team) => (isDefined(team.woreda) ? woredaMap[team.woreda] : '-'),
        ),
        createStringColumn<TeamMembersListItem, string | number>(
            'phoneNumber',
            'Number',
            (team) => team.phoneNumber,
        ),
        createStringColumn<TeamMembersListItem, string | number>(
            'training',
            'Training',
            (team) => team.training,
        ),
        createStringColumn<TeamMembersListItem, string | number>(
            'fieldOfStudy',
            'Field of Study',
            (team) => team.fieldOfStudy,
        ),
        createElementColumn<TeamMembersListItem, string | number,
            EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: id ?? '',
                    onDelete: () => onDeleteClick(datum.id),
                    itemTitle: datum.name,
                    member: datum.id,
                    to: 'editTeamMember',
                }),
                { columnWidth: 150 },
            ),
    ], [onDeleteClick, id, regionMap, woredaMap]);

    const handleCreateClick = useCallback(() => {
        if (isDefined(id)) {
            navigate('createTeamMember', { id });
        }
    }, [navigate, id]);

    return (
        <Container
            withPadding
            heading={teamData?.team.name}
            headerDescription="These teams are specialized volunteer groups trained to respond to disasters at the local, regional, or zonal level within the Red Cross structure."
            filters={(
                <TeamMembersFilters
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.teamMembers.totalCount ?? 0}
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
                filtered={filtered}
                data={tableData}
                pending={fetching || teamDetailFetch}
            />
        </Container>
    );
}

export default TeamMembers;
