import {
    useCallback,
    useMemo,
    useState,
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
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';

import CategoryModal from '#components/CategoryModal';
import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    AdminAreaLevel,
    type ReportFilter,
    type ReportsQuery,
    ReportTypeEnum,
    useDeleteReportMutation,
    useReportsQuery,
    useThematicAreasQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRegionMap from '#hooks/useRegionMap';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import DataAndReportsFilters from './DataAndReportsFilters';

type ReportsListItem = NonNullable<NonNullable<ReportsQuery['reports']>['results'][number]> & { no: string };

export type DataAndReportsFilterType = Pick<ReportFilter, 'search' | 'thematicAreaId' | 'regions'>;

const defaultFilter: DataAndReportsFilterType = {
    search: undefined,
    thematicAreaId: undefined,
    regions: undefined,
};

function DataAndReports() {
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

    const [categoryModalShown, setCategoryModalShown] = useState(false);

    const [
        { data: thematicAreasData },
        reExecuteThematicAreas,
    ] = useThematicAreasQuery();

    const queryVariables = useMemo(() => ({
        pagination: {
            limit,
            offset,
        },
        filters: {
            reportType: ReportTypeEnum.Report,
            title: filter.search ? { iContains: filter.search } : undefined,
            thematicAreaId: filter.thematicAreaId || undefined,
            regions: filter.regions?.length ? filter.regions : undefined,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useReportsQuery({ variables: queryVariables });
    const [, deleteReport] = useDeleteReportMutation();

    const thematicAreaMap = useMemo(() => (
        listToMap(
            thematicAreasData?.thematicAreas?.results ?? [],
            (area) => area.id,
            (area) => area.name,
        )
    ), [thematicAreasData]);

    const thematicAreaOptions = thematicAreasData?.thematicAreas?.results;

    const regionMap = useRegionMap(AdminAreaLevel.Region);

    const tableData: ReportsListItem[] = useMemo(() => (
        (data?.reports?.results ?? []).map((report, index) => ({
            ...report,
            no: String((page - 1) * limit + index + 1),
        }))
    ), [page, data, limit]);

    const onDeleteClick = useCallback(
        (id: string) => {
            deleteReport({ id }).then((resp) => {
                const result = resp.data?.deleteReport;
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Report deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteReport, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<ReportsListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createDateColumn<ReportsListItem, string | number>(
            'publishedAt',
            'Published At',
            (item) => item.publishedAt,
        ),
        createStringColumn<ReportsListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createStringColumn<ReportsListItem, string | number>(
            'owner',
            'Created By',
            (item) => item.owner,
        ),
        createStringColumn<ReportsListItem, string | number>(
            'region',
            'Region',
            (item) => (isDefined(item.regionId) ? regionMap[item.regionId] : '-'),
        ),
        createStringColumn<ReportsListItem, string | number>(
            'category',
            'Category',
            (item) => (isDefined(item.thematicAreaId) ? thematicAreaMap[item.thematicAreaId] : '-'),
        ),
        createStringColumn<ReportsListItem, string | number>(
            'status',
            'Status',
            (item) => item.visibilityDisplay,
        ),
        createElementColumn<ReportsListItem, string | number, EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete: onDeleteClick,
                itemTitle: datum.title,
                to: 'editDataAndReports',
            }),
            { columnWidth: 150 },
        ),
    ], [onDeleteClick, thematicAreaMap, regionMap]);

    const handleViewCategoryClick = useCallback(() => {
        setCategoryModalShown(true);
    }, []);
    const handleCategoryModalClose = useCallback(() => {
        setCategoryModalShown(false);
    }, []);
    const handleCategoriesChange = useCallback(() => {
        reExecuteThematicAreas({ requestPolicy: 'network-only' });
    }, [reExecuteThematicAreas]);
    const handleCreateClick = useCallback(() => {
        navigate('createDataAndReports');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="Data & Reports"
            headerDescription="Manage, analyze, and generate reports from organizational data"
            filters={(
                <DataAndReportsFilters
                    value={rawFilter}
                    onChange={setFilterField}
                    thematicAreaOptions={thematicAreaOptions}
                />
            )}
            headerActions={(
                <ListView>
                    <Button
                        name={undefined}
                        onClick={handleViewCategoryClick}
                        styleVariant="outline"
                    >
                        View Category
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
            {categoryModalShown && (
                <CategoryModal
                    onClose={handleCategoryModalClose}
                    onCategoriesChange={handleCategoriesChange}
                />
            )}
        </Container>
    );
}

export default DataAndReports;
