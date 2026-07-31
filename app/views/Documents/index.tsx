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
    Description,
    InlineLayout,
    ListView,
    Pager,
    Tab,
    Table,
    TabList,
    TabPanel,
    Tabs,
} from '@ifrc-go/ui';
import {
    createDateColumn,
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type DocumentsQuery,
    type ReportFilter,
    ReportTypeEnum,
    useDeleteDocumentMutation,
    useDocumentsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useUrlSearchState from '#hooks/useUrlSearchState';
import routes from '#root/config/routes';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import DocumentsFilters from './DocumentsFilters';

type ReportsListItem = NonNullable<NonNullable<DocumentsQuery['reports']>['results'][number]> & { no: number };

export type DocumentFilterType = Pick<ReportFilter, 'search' | 'regions'> & {
    createdAtGte: string | undefined;
    createdAtLte: string | undefined;
};

const defaultFilter: DocumentFilterType = {
    search: undefined,
    createdAtGte: undefined,
    createdAtLte: undefined,
};

const tabs = [
    { key: ReportTypeEnum.Manual, label: 'Manuals' },
    { key: ReportTypeEnum.Policy, label: 'Policies' },
    { key: ReportTypeEnum.Guideline, label: 'Guidelines' },
];

function Documents() {
    const {
        rawFilter,
        filter,
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

    const [activeTab, setActiveTab] = useUrlSearchState<ReportTypeEnum>(
        'tab',
        (tab) => (tab as ReportTypeEnum) ?? ReportTypeEnum.Manual,
        (tab) => tab,
    );

    const queryVariables = useMemo(() => ({
        pagination: {
            limit,
            offset,
        },
        filters: {
            reportType: activeTab,
            search: filter.search || undefined,
            createdAt: (filter.createdAtGte || filter.createdAtLte) ? {
                gte: filter.createdAtGte,
                lte: filter.createdAtLte,
            } : undefined,
        },
    }), [limit, offset, filter, activeTab]);

    const [{ fetching, data }, reExecuteQuery] = useDocumentsQuery({ variables: queryVariables });
    const [, deleteDocument] = useDeleteDocumentMutation();

    const tableData: ReportsListItem[] = useMemo(() => (
        (data?.reports?.results ?? []).map((report, index) => ({
            ...report,
            no: (page - 1) * limit + index + 1,
        }))
    ), [page, data, limit]);

    const handleDeleteClick = useCallback(
        (id: string) => {
            deleteDocument({ id }).then((response) => {
                const result = response.data?.deleteReport;
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Document deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteDocument, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createNumberColumn<ReportsListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createDateColumn<ReportsListItem, string | number>(
            'createdAt',
            'Created At',
            (item) => item.createdAt,
        ),
        createStringColumn<ReportsListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createElementColumn<ReportsListItem, string | number, EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete: handleDeleteClick,
                itemTitle: datum.title,
                to: 'editDocument',
            }),
            { columnWidth: 150 },
        ),
    ], [handleDeleteClick]);

    const handleTabChange = useCallback((tab: ReportTypeEnum) => {
        setActiveTab(tab);
        setPage(1);
    }, [setActiveTab, setPage]);

    const handleCreateClick = useCallback(() => {
        navigate({
            pathname: routes.createDocument.path,
            search: createSearchParams({ type: activeTab }).toString(),
        });
    }, [navigate, activeTab]);

    return (

        <Tabs
            value={activeTab}
            onChange={handleTabChange}
        >

            <Container
                withPadding
                heading="Documents"
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
                filters={(
                    <DocumentsFilters
                        value={rawFilter}
                        onChange={setFilterField}
                    />

                )}
                headerDescription={(
                    <ListView
                        layout="block"
                    >
                        <Description>
                            Upload, store, and organize documents for easy access across the system
                        </Description>
                        <InlineLayout
                            before={(

                                <TabList>
                                    {tabs.map((tab) => (
                                        <Tab
                                            key={tab.key}
                                            name={tab.key}
                                        >
                                            {tab.label}
                                        </Tab>
                                    ))}
                                </TabList>
                            )}
                        />
                    </ListView>

                )}
            >
                {tabs.map((tab) => (
                    <TabPanel
                        key={tab.key}
                        name={tab.key}
                    >
                        <Table
                            keySelector={idSelector}
                            columns={columns}
                            data={tableData}
                            filtered={filtered}
                            pending={fetching}
                        />
                    </TabPanel>
                ))}
            </Container>

        </Tabs>

    );
}

export default Documents;
