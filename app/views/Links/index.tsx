import {
    useCallback,
    useMemo,
} from 'react';
import {
    createSearchParams,
    useNavigate,
} from 'react-router';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    DateInput,
    Description,
    InlineLayout,
    ListView,
    Pager,
    Tab,
    Table,
    TabList,
    Tabs,
    TextInput,
} from '@ifrc-go/ui';
import {
    createDateColumn,
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type LinkFilter,
    type LinkType,
    LinkTypeEnum,
    useDeleteLinkMutation,
    useLinksQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useUrlSearchState from '#hooks/useUrlSearchState';
import routes from '#root/config/routes';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

type LinkListItem = NonNullable<LinkType> & { no: string }

interface LinkFilterType extends Omit<LinkFilter, 'createdAt' | 'linkType'> {
    createdAtGte: string | undefined;
    createdAtLte: string | undefined;
}

const defaultFilter: LinkFilterType = {
    search: undefined,
    createdAtGte: undefined,
    createdAtLte: undefined,
};
function Links() {
    const [activeTab, setActiveTab] = useUrlSearchState<LinkTypeEnum>(
        'tab',
        (tab) => (tab as LinkTypeEnum) ?? LinkTypeEnum.Internal,
        (tab) => tab,
    );
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
    const navigate = useNavigate();

    const queryVariables = useMemo(() => ({
        pagination: {
            limit,
            offset,
        },
        filters: {
            linkType: activeTab,
            search: filter.search,
            createdAt: (filter.createdAtGte || filter.createdAtLte) ? {
                gte: filter.createdAtGte,
                lte: filter.createdAtLte,
            } : undefined,
        },
    }), [limit, offset, filter, activeTab]);

    const [{ fetching, data }, reExecuteQuery] = useLinksQuery(
        { variables: queryVariables },
    );

    const handleTabChanges = useCallback(
        (name: LinkTypeEnum) => {
            setActiveTab(name);
            setPage(1);
        },
        [setActiveTab, setPage],
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
        data?.publicLinks.results.map((user, index) => {
            const no = (page - 1) * limit + index + 1;
            return {
                ...user,
                no,
            };
        }) as unknown as LinkListItem[]), [page, data, limit]);

    const columns = useMemo(() => [
        createStringColumn<LinkListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createDateColumn<LinkListItem, string | number>(
            'createdAt',
            'Created At',
            (item) => item.createdAt,
        ),
        createStringColumn<LinkListItem, string | number>(
            'title',
            'Title',
            (item) => item.title ?? '-',
        ),
        createStringColumn<LinkListItem, string | number>(
            'linkType',
            'Link Type',
            (item) => item.linkTypeDisplay ?? '-',
        ),
        createElementColumn<LinkListItem, string | number,
            EditDeleteActionsProps>(
                'actions',
                '',
                EditDeleteActions,
                (_, datum) => ({
                    id: datum.id,
                    onDelete: onDeleteClick,
                    itemTitle: datum.title,
                    to: 'editLink',
                }),
                { columnWidth: 150 },
            ),
    ], [onDeleteClick]);

    const handleCreateClick = useCallback(() => {
        navigate({
            pathname: routes.createLink.path,
            search: createSearchParams({ type: activeTab }).toString(),
        });
    }, [navigate, activeTab]);

    return (
        <Tabs
            onChange={handleTabChanges}
            value={activeTab}
        >
            <Container
                withPadding
                heading="Links"
                headerDescription={(
                    <ListView layout="block">
                        <Description>
                            Control and manage public-facing resource links
                        </Description>
                        <InlineLayout
                            before={(
                                <TabList>
                                    <Tab
                                        name={LinkTypeEnum.Internal}
                                    >
                                        Internal Links
                                    </Tab>
                                    <Tab
                                        name={LinkTypeEnum.External}
                                    >
                                        External Links
                                    </Tab>
                                </TabList>
                            )}
                        />
                    </ListView>
                )}
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
                        itemsCount={data?.publicLinks.totalCount ?? 0}
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
        </Tabs>
    );
}

export default Links;
