import { useCallback } from 'react';
import {
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    ConfirmButton,
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
}

function EditDeleteActions(props: Props) {
    const {
        id,
        onDelete,
        itemTitle,
        to,
        member,
        dashboard,
    } = props;

    const navigate = useRouting();

    const handleEditClick = useCallback(() => {
        if (isDefined(dashboard)) {
            navigate(to, { id, dashboard });
        } else if (isDefined(member)) {
            navigate(to, { id, member });
        } else {
            navigate(to, { id });
        }
    }, [navigate, to, id, member, dashboard]);

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
            <ConfirmButton
                name={id}
                onConfirm={onDelete}
                confirmMessage={`Are you sure you want to delete ${`"${itemTitle}"` || 'this item'}? This action cannot be undone.`}
                title="Delete"
                styleVariant="action"
            >
                <DeleteBinLineIcon />
            </ConfirmButton>
        </TableActions>
    );
}

export default EditDeleteActions;
