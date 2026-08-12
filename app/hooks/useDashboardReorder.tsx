import {
    cloneElement,
    useCallback,
    useRef,
    useState,
} from 'react';
import { DragDropLineIcon } from '@ifrc-go/icons';
import { createElementColumn } from '@ifrc-go/ui/utils';

import { useBulkUpdateExternalDashboardsMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import { errorMessage } from '#utils/common';

// eslint-disable-next-line react-refresh/only-export-components
function DragHandleCell() {
    return <DragDropLineIcon title="Drag to reorder" />;
}

export function createDragHandleColumn<T>() {
    return createElementColumn<T, string | number, object>(
        'dragHandle',
        '',
        DragHandleCell,
        () => ({}),
        { columnWidth: 40 },
    );
}

interface ReorderItem {
    id: string;
    no: string;
    order: number;
}

function useDashboardReorder<T extends ReorderItem>(
    serverData: T[],
    page: number,
    limit: number,
) {
    const alert = useAlert();
    const [, bulkUpdateExternalDashboards] = useBulkUpdateExternalDashboardsMutation();

    const [tableData, setTableData] = useState(serverData);
    const [prevServerData, setPrevServerData] = useState(serverData);
    if (serverData !== prevServerData) {
        setPrevServerData(serverData);
        setTableData(serverData);
    }

    const dragIndexRef = useRef<number | undefined>(undefined);

    const handleRowDrop = useCallback((dropIndex: number) => {
        const dragIndex = dragIndexRef.current;
        dragIndexRef.current = undefined;
        if (dragIndex === undefined || dragIndex === dropIndex) {
            return;
        }
        const newData = [...tableData];
        const [moved] = newData.splice(dragIndex, 1);
        newData.splice(dropIndex, 0, moved);
        const reorderedData = newData.map((item, index) => ({
            ...item,
            no: String((page - 1) * limit + index + 1),
            order: (page - 1) * limit + index + 1,
        }));
        setTableData(reorderedData);
        bulkUpdateExternalDashboards({
            data: reorderedData.map((item) => ({
                id: item.id,
                order: item.order,
            })),
        }).then((resp) => {
            const result = resp.data?.bulkUpdateExternalDashboards;
            if (result?.ok) {
                alert.show('Dashboard order updated successfully', { variant: 'success' });
            } else {
                setTableData(serverData);
                alert.show(errorMessage, { variant: 'danger' });
            }
        }).catch(() => {
            setTableData(serverData);
            alert.show(errorMessage, { variant: 'danger' });
        });
    }, [tableData, serverData, page, limit, bulkUpdateExternalDashboards, alert]);

    const rowModifier = useCallback(({ row, datum }: {
        row: React.ReactElement;
        datum: T;
    }) => {
        const index = tableData.indexOf(datum);
        return cloneElement(row, {
            draggable: true,
            style: { cursor: 'grab' },
            title: 'Drag to reorder',
            onDragStart: () => {
                dragIndexRef.current = index;
            },
            onDragOver: (e: React.DragEvent) => {
                e.preventDefault();
            },
            onDrop: () => {
                handleRowDrop(index);
            },
        } as React.HTMLAttributes<HTMLElement>);
    }, [tableData, handleRowDrop]);

    return { tableData, rowModifier };
}

export default useDashboardReorder;
