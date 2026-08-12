import {
    cloneElement,
    useCallback,
    useRef,
    useState,
} from 'react';

import { useBulkUpdateExternalDashboardsMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import { errorMessage } from '#utils/common';

interface ReorderItem {
    id: string;
    no: string;
    order: number;
}

export function reorderWithinPage<T extends ReorderItem>(
    items: T[],
    dragIndex: number,
    dropIndex: number,
    page: number,
    limit: number,
): T[] {
    const slots = items.map((item) => item.order).sort((a, b) => a - b);

    const moved = [...items];
    const [dragged] = moved.splice(dragIndex, 1);
    moved.splice(dropIndex, 0, dragged);

    return moved.map((item, index) => ({
        ...item,
        no: String((page - 1) * limit + index + 1),
        order: slots[index],
    }));
}

function useDashboardReorder<T extends ReorderItem>(
    serverData: T[],
    page: number,
    limit: number,
    onReorderSuccess?: () => void,
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
        const reorderedData = reorderWithinPage(tableData, dragIndex, dropIndex, page, limit);
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
                onReorderSuccess?.();
            } else {
                setTableData(serverData);
                alert.show(errorMessage, { variant: 'danger' });
            }
        }).catch(() => {
            setTableData(serverData);
            alert.show(errorMessage, { variant: 'danger' });
        });
    }, [
        tableData,
        serverData,
        page,
        limit,
        bulkUpdateExternalDashboards,
        alert,
        onReorderSuccess,
    ]);

    const rowModifier = useCallback(({ row, datum }: {
        row: React.ReactElement;
        datum: T;
    }) => {
        const index = tableData.indexOf(datum);
        return cloneElement(row, {
            draggable: true,
            style: { cursor: 'grab' },
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
