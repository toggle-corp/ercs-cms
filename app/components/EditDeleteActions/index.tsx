import { useCallback } from 'react';
import {
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
import { TableActions } from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import DropdownMenuItem from '#components/DropdownMenuItem';
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
        <TableActions
            persistent
            extraActions={(
                <>
                    <DropdownMenuItem
                        name={undefined}
                        type="button"
                        before={<EditTwoLineIcon />}
                        onClick={handleEditClick}
                        persist
                    >
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        name={id}
                        onConfirm={onDelete}
                        type="confirm-button"
                        before={<DeleteBinLineIcon />}
                        confirmMessage={`Are you sure you want to delete ${`"${itemTitle}"` || 'this item'}? This action cannot be undone.`}
                        persist
                    >
                        Delete
                    </DropdownMenuItem>
                </>
            )}
        />
    );
}

export default EditDeleteActions;
