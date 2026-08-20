import {
    cloneElement,
    useCallback,
    useRef,
    useState,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

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
    const moved = [...items];
    const [dragged] = moved.splice(dragIndex, 1);
    moved.splice(dropIndex, 0, dragged);

    return moved.map((item, index) => {
        const position = (page - 1) * limit + index + 1;
        return { ...item, no: String(position), order: position };
    });
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
    const [draggingIndex, setDraggingIndex] = useState<number | undefined>(undefined);
    const [dropTargetIndex, setDropTargetIndex] = useState<number | undefined>(undefined);

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
        const isDropTarget = isDefined(draggingIndex)
            && dropTargetIndex === index
            && draggingIndex !== index;

        return cloneElement(row, {
            onDragStart: (e: React.DragEvent<HTMLElement>) => {
                dragIndexRef.current = index;
                setDraggingIndex(index);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setDragImage(e.currentTarget, 16, 16);
            },
            onDragEnd: () => {
                setDraggingIndex(undefined);
                setDropTargetIndex(undefined);
            },
            onDragOver: (e: React.DragEvent) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDropTargetIndex(index);
            },
            onDrop: () => {
                setDraggingIndex(undefined);
                setDropTargetIndex(undefined);
                handleRowDrop(index);
            },
            style: {
                opacity: draggingIndex === index ? 0.4 : undefined,
                transition: 'opacity 0.15s ease',
                outline: isDropTarget ? '2px solid var(--go-ui-color-primary-red)' : undefined,
            },
        } as React.HTMLAttributes<HTMLElement>);
    }, [tableData, handleRowDrop, draggingIndex, dropTargetIndex]);

    return { tableData, rowModifier };
}

export default useDashboardReorder;
