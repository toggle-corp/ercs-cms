import {
    type ReactNode,
    useCallback,
    useState,
} from 'react';
import {
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ListView,
    Modal,
    TableActions,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import useRouting, { type RoutesMap } from '#hooks/useRouting';

export interface Props {
    id: string;
    member?: string;
    dashboard?: string;
    onDelete: (id: string) => void;
    itemTitle: string;
    to: keyof RoutesMap;
    deleteMode?: 'delete' | 'deactivate';
    deleteHeading?: string;
    deleteMessage?: ReactNode;
}

const deleteCopy = {
    delete: {
        actionLabel: 'Delete',
        heading: 'Delete item?',
        message: (title: string) => `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    },
    deactivate: {
        actionLabel: 'Deactivate',
        heading: 'Deactivate user?',
        message: (title: string) => `Are you sure you want to deactivate "${title}"? They will lose access, and you can reactivate them later.`,
    },
};

function EditDeleteActions(props: Props) {
    const {
        id,
        onDelete,
        itemTitle,
        to,
        member,
        dashboard,
        deleteMode = 'delete',
        deleteHeading,
        deleteMessage,
    } = props;

    const copy = deleteCopy[deleteMode];

    const navigate = useRouting();

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const deleteId = dashboard ?? member ?? id;

    const handleEditClick = useCallback(() => {
        if (isDefined(dashboard)) {
            navigate(to, { id, dashboard });
        } else if (isDefined(member)) {
            navigate(to, { id, member });
        } else {
            navigate(to, { id });
        }
    }, [navigate, to, id, member, dashboard]);

    const handleDeleteClick = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    const handleDeleteCancel = useCallback(() => {
        setShowDeleteModal(false);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        setShowDeleteModal(false);
        onDelete(deleteId);
    }, [onDelete, deleteId]);

    return (
        <TableActions>
            <Button
                name={undefined}
                onClick={handleEditClick}
                title="Edit"
                styleVariant="action"
            >
                <EditTwoLineIcon />
            </Button>
            <Button
                name={undefined}
                onClick={handleDeleteClick}
                title={copy.actionLabel}
                styleVariant="action"
            >
                <DeleteBinLineIcon />
            </Button>
            {showDeleteModal && (
                <Modal
                    heading={deleteHeading ?? copy.heading}
                    size="sm"
                    onClose={handleDeleteCancel}
                    closeOnEscape
                    footerActions={(
                        <ListView spacing="sm">
                            <Button
                                name={undefined}
                                onClick={handleDeleteCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                name={undefined}
                                styleVariant="filled"
                                onClick={handleDeleteConfirm}
                            >
                                {copy.actionLabel}
                            </Button>
                        </ListView>
                    )}
                >
                    {deleteMessage ?? copy.message(itemTitle || 'this item')}
                </Modal>
            )}
        </TableActions>
    );
}

export default EditDeleteActions;
