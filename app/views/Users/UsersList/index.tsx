import {
    useCallback,
    useMemo,
} from 'react';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    ListView,
    Pager,
    Table,
} from '@ifrc-go/ui';
import {
    createDateColumn,
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import DateTime, { type DateTimeProps } from '#components/DateTime';
import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import Link from '#components/Link';
import {
    useDeleteUserMutation,
    type UserRole,
    type UsersQuery,
    useUsersQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRegionMap from '#hooks/useRegionMap';
import useRouting from '#hooks/useRouting';
import { idSelector } from '#utils/common';

import UserFilter from './UserFilter';

import styles from './styles.module.css';

type UsersListItem = NonNullable<NonNullable<UsersQuery['users']>['results'][number]> & { no: string };

interface UserInfoCellProps {
    fullName: string;
    email: string;
}

function UserInfoCell({ fullName, email }: UserInfoCellProps) {
    return (
        <ListView
            layout="block"
            spacing="2xs"
        >
            <span>{fullName}</span>
            {email ? (
                <Link
                    external
                    href={`mailto:${email}`}
                    withUnderline
                    styleVariant="action"
                    colorVariant="text"
                >
                    {email}
                </Link>
            ) : (
                <span>-</span>
            )}
        </ListView>
    );
}

function StatusCell({ isActive }: { isActive: boolean }) {
    return (
        <ListView
            layout="inline"
            spacing="sm"
        >
            <span
                className={isActive
                    ? styles.statusIndicatorActive
                    : styles.statusIndicatorInactive}
            />
            <span>{isActive ? 'Active' : 'Inactive'}</span>
        </ListView>
    );
}

export interface UsersFilterType {
    region: string | undefined;
    role: string | undefined;
    isActive: string | undefined;
    search: string | undefined;
}

const defaultFilter: UsersFilterType = {
    region: undefined,
    role: undefined,
    isActive: undefined,
    search: undefined,
};

function UsersList() {
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
            regions: filter.region ? [filter.region] : undefined,
            role: (filter.role as UserRole) ?? undefined,
            isActive: filter.isActive !== undefined ? filter.isActive === 'true' : undefined,
            search: filter.search || undefined,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useUsersQuery({
        variables: queryVariables,
    });
    const [, deleteUser] = useDeleteUserMutation();

    const regionMap = useRegionMap();

    const pageSize = limit;

    const tableData = useMemo(() => (
        (data?.users?.results ?? []).map((user, index) => {
            const no = (page - 1) * pageSize + index + 1;
            return {
                ...user,
                no,
            };
        }) as unknown as UsersListItem[]), [page, data, pageSize]);

    const onDeleteClick = useCallback(
        (id: string) => {
            deleteUser({ id }).then((resp) => {
                if (resp.data?.deleteUser) {
                    reExecuteQuery();
                    alert.show('User deleted successfully', { variant: 'success' });
                }
            });
        },
        [deleteUser, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<UsersListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createDateColumn<UsersListItem, string | number>(
            'createdAt',
            'Created At',
            (item) => item.createdAt,
        ),
        createElementColumn<UsersListItem, string | number, UserInfoCellProps>(
            'fullName',
            'Full Name',
            UserInfoCell,
            (_, datum) => ({
                fullName: datum.fullName,
                email: datum.email,
            }),
        ),
        createStringColumn<UsersListItem, string | number>(
            'roleDisplay',
            'Role',
            (item) => item.roleDisplay ?? '-',
        ),
        createStringColumn<UsersListItem, string | number>(
            'regionId',
            'Region',
            (item) => (item.regionId ? regionMap[item.regionId] : undefined) ?? '-',
        ),
        createElementColumn<UsersListItem, string | number, DateTimeProps>(
            'lastLogin',
            'Last Login',
            DateTime,
            (_, datum) => ({
                dateString: datum.lastLogin,
            }),
        ),
        createElementColumn<UsersListItem, string | number,
            { isActive: boolean }>(
                'status',
                'Status',
                StatusCell,
                (_, datum) => ({
                    isActive: datum.isActive ?? false,
                }),
            ),
        createElementColumn<UsersListItem, string | number,
            EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete: onDeleteClick,
                    itemTitle: datum.fullName,
                    to: 'editUser',
                }),
                { columnWidth: 150 },
            ),
    ], [onDeleteClick, regionMap]);

    const handleCreateClick = useCallback(() => {
        navigate('createUser');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Users"
            filters={(
                <UserFilter
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            headerDescription="Manage authenticated users and control access"
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
                    itemsCount={data?.users.totalCount ?? 0}
                    maxItemsPerPage={pageSize}
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

export default UsersList;
