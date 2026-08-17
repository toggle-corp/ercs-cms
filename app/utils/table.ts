import { createElementColumn } from '@ifrc-go/ui/utils';

import DragHandle from '#components/DragHandle';

function createDragHandleColumn<T>() {
    return createElementColumn<T, string | number, object>(
        'dragHandle',
        '',
        DragHandle,
        () => ({}),
        { columnWidth: 40 },
    );
}

export default createDragHandleColumn;
