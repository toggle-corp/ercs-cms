import { DragDropLineIcon } from '@ifrc-go/icons';
import { createElementColumn } from '@ifrc-go/ui/utils';

function createDragHandleColumn<T>() {
    return createElementColumn<T, string | number, { title: string }>(
        'dragHandle',
        '',
        DragDropLineIcon,
        () => ({ title: 'Drag to reorder' }),
        { columnWidth: 40 },
    );
}

export default createDragHandleColumn;
