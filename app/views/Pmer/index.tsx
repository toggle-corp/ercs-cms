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
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type PmerReportCategory,
    type PmerReportDocumentType,
    type PmerReportsQuery,
    useDeletePmerReportMutation,
    usePmerReportsQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import PmerFilters from './PmerFilters';

type PmerListItem = NonNullable<NonNullable<PmerReportsQuery['pmerReports']>['results'][number]> & { no: string };

export interface PmerFilterType {
    search: string | undefined;
    region: string | undefined;
    category: PmerReportCategory | undefined;
    reportType: PmerReportDocumentType | undefined;
}

const defaultFilter: PmerFilterType = {
    search: undefined,
    region: undefined,
    category: undefined,
    reportType: undefined,
};

function Pmer() {
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
            search: filter.search || undefined,
            regionId: filter.region || undefined,
            category: filter.category || undefined,
            reportType: filter.reportType || undefined,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = usePmerReportsQuery({
        variables: queryVariables,
    });
    const [, deletePmerReport] = useDeletePmerReportMutation();

    const tableData: PmerListItem[] = useMemo(() => (
        (data?.pmerReports?.results ?? []).map((report, index) => ({
            ...report,
            no: String((page - 1) * limit + index + 1),
        }))
    ), [page, data, limit]);

    const handleDeleteClick = useCallback(
        (id: string) => {
            deletePmerReport({ id }).then((resp) => {
                const result = resp.data?.deletePmerReport;
                if (result?.ok) {
                    reExecuteQuery({ requestPolicy: 'network-only' });
                    alert.show('PMER deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deletePmerReport, reExecuteQuery, alert],
    );

    const columns = useMemo(() => [
        createStringColumn<PmerListItem, string | number>(
            'no',
            'No.',
            (item) => item.no,
        ),
        createStringColumn<PmerListItem, string | number>(
            'title',
            'Title',
            (item) => item.title,
        ),
        createStringColumn<PmerListItem, string | number>(
            'category',
            'Report Category',
            (item) => item.categoryDisplay,
        ),
        createStringColumn<PmerListItem, string | number>(
            'reportType',
            'Report Type',
            (item) => item.reportTypeDisplay,
        ),
        createStringColumn<PmerListItem, string | number>(
            'department',
            'Department / Sector',
            (item) => item.department,
        ),
        createStringColumn<PmerListItem, string | number>(
            'region',
            'Region',
            (item) => item.region?.name,
        ),
        createStringColumn<PmerListItem, string | number>(
            'project',
            'Project',
            (item) => item.project,
        ),
        createStringColumn<PmerListItem, string | number>(
            'visibility',
            'Status',
            (item) => item.visibilityDisplay,
        ),
        createElementColumn<PmerListItem, string | number, EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete: handleDeleteClick,
                itemTitle: datum.title,
                to: 'editPmer',
            }),
            { columnWidth: 150 },
        ),
    ], [handleDeleteClick]);

    const handleCreateClick = useCallback(() => {
        navigate('createPmer');
    }, [navigate]);

    return (
        <Container
            withPadding
            heading="PMER"
            headerDescription="Manage planning, monitoring, evaluation and reporting documents"
            filters={(
                <PmerFilters
                    value={rawFilter}
                    onChange={setFilterField}
                    onReset={resetFilter}
                    filtered={filtered}
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
                    itemsCount={data?.pmerReports?.totalCount ?? 0}
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

export default Pmer;
