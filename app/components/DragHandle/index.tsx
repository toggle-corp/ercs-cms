import { DragDropLineIcon } from '@ifrc-go/icons';

function DragHandle() {
    return (
        <span
            draggable
            title="Drag to reorder"
            style={{ cursor: 'grab', display: 'inline-flex' }}
        >
            <DragDropLineIcon />
        </span>
    );
}

export default DragHandle;
