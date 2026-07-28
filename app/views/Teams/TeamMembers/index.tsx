import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useParams } from 'react-router';
import {
    AddFillIcon,
    DownloadTwoFillIcon,
    DrefTwoIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    ListView,
    Modal,
    Pager,
    RawFileInput,
    Table,
} from '@ifrc-go/ui';
import {
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import FileInput from '#components/FileInput';
import Link from '#components/Link';
import {
    AdminAreaLevel,
    type TeamMemberFilter,
    type TeamMembersQuery,
    useDeleteTeamMemberMutation,
    useTeamDetailQuery,
    useTeamMembersQuery,
    useTeamMembersTemplateQuery,
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
    regions: undefined,
    woredas: undefined,
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
    const [openImportModal, setOpenImportModal] = useState(false);

    const { id } = useParams();

    const [{ data: template, fetching: templateFetch }] = useTeamMembersTemplateQuery();
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
                regions: filter.regions?.length === 0 ? undefined : filter.regions,
                woredas: filter.woredas?.length === 0 ? undefined : filter.woredas,
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
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Team member deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
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

    const handleTemplateFileChange = useCallback((file: File | undefined) => {
        console.log('file', file);
    }, []);

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
                <ListView layout="inline">
                    <Button
                        name={undefined}
                        before={(<DownloadTwoFillIcon />)}
                        onClick={() => setOpenImportModal(true)}
                    >
                        Import
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleCreateClick}
                        before={(<AddFillIcon />)}
                        styleVariant="filled"
                    >
                        Create
                    </Button>
                </ListView>
            )}
        >
            <Table
                keySelector={idSelector}
                columns={columns}
                filtered={filtered}
                data={tableData}
                pending={fetching || teamDetailFetch || templateFetch}
            />
            {openImportModal && (
                <Modal
                    heading={`IMPORT TEAM MEMBERS FOR ${teamData?.team.name}`}
                    headerDescription="Please upload team member in xlxs format"
                    onClose={() => setOpenImportModal(false)}
                >
                    <RawFileInput
                        name="file"
                        accept=".xlsx, .xlsm"
                        onChange={handleTemplateFileChange}
                        styleVariant="outline"
                        colorVariant="primary"
                        disabled={fetching || teamDetailFetch || templateFetch}
                        before={<DrefTwoIcon />}
                    >
                        Select a file to upload
                    </RawFileInput>
                    <span>
                        <ListView layout="inline" spacing="4xs">
                            The contents in the xlsx should follow the structure provided in
                            <Link
                                href={template?.createTeamMemberTemplate ?? ''}
                                external
                                withUnderline
                            >
                                this template
                            </Link>
                        </ListView>
                    </span>
                </Modal>
            )}
        </Container>
    );
}

export default TeamMembers;
