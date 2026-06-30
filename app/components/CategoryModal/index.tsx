import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    CloseLineIcon,
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
import {
    Button,
    IconButton,
    InlineLayout,
    ListView,
    Modal,
    Pager,
    Table,
    TextInput,
} from '@ifrc-go/ui';
import {
    createElementColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import {
    type ThematicAreasQuery,
    useCreateThematicAreaMutation,
    useDeleteThematicAreaMutation,
    useThematicAreasQuery,
    useUpdateThematicAreaMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

type ThematicArea = NonNullable<NonNullable<ThematicAreasQuery['thematicAreas']>['results'][number]>;

interface CategoryFilterType {
    search: string | undefined;
}

const defaultFilter: CategoryFilterType = {
    search: undefined,
};

interface CategoryActionsProps {
    id: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    disabled: boolean;
}

function CategoryActions(props: CategoryActionsProps) {
    const {
        id,
        onEdit,
        onDelete,
        disabled,
    } = props;

    return (
        <InlineLayout
            after={(
                <ListView
                    layout="inline"
                    spacing="sm"
                >
                    <Button
                        name={id}
                        aria-label="Edit category"
                        title="Edit category"
                        styleVariant="transparent"
                        colorVariant="text"
                        spacing="3xs"
                        onClick={onEdit}
                        disabled={disabled}
                    >
                        <EditTwoLineIcon />
                    </Button>
                    <Button
                        name={id}
                        aria-label="Delete category"
                        title="Delete category"
                        styleVariant="transparent"
                        colorVariant="text"
                        spacing="3xs"
                        onClick={onDelete}
                        disabled={disabled}
                    >
                        <DeleteBinLineIcon />
                    </Button>
                </ListView>
            )}
        />
    );
}

export interface Props {
    onClose: () => void;
    onCategoriesChange: () => void;
}

function CategoryModal(props: Props) {
    const {
        onClose,
        onCategoriesChange,
    } = props;

    const alert = useAlert();

    const {
        rawFilter,
        filter,
        filtered,
        setFilterField,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState({
        filter: defaultFilter,
    });

    const [categoryName, setCategoryName] = useState<string | undefined>();
    const [editingId, setEditingId] = useState<string | undefined>();

    const [{ fetching, data, error }, reExecuteQuery] = useThematicAreasQuery({
        variables: {
            pagination: { limit, offset },
            filters: { search: filter.search || undefined },
        },
    });
    const [{ fetching: createPending }, createThematicArea] = useCreateThematicAreaMutation();
    const [{ fetching: updatePending }, updateThematicArea] = useUpdateThematicAreaMutation();
    const [{ fetching: deletePending }, deleteThematicArea] = useDeleteThematicAreaMutation();

    const categories = data?.thematicAreas?.results;
    const actionPending = createPending || updatePending || deletePending;

    const handleResult = useCallback((
        ok: boolean | undefined,
        successMessage: string,
    ) => {
        if (!ok) {
            alert.show(errorMessage, { variant: 'danger' });
            return;
        }
        setCategoryName(undefined);
        setEditingId(undefined);
        reExecuteQuery({ requestPolicy: 'network-only' });
        onCategoriesChange();
        alert.show(successMessage, { variant: 'success' });
    }, [alert, reExecuteQuery, onCategoriesChange]);

    const handleCreate = useCallback(() => {
        const name = categoryName?.trim();
        if (!name) {
            return;
        }
        createThematicArea({ data: { name } }).then((resp) => {
            handleResult(resp.data?.createThematicArea?.ok, 'Category added successfully');
        }).catch(() => {
            alert.show(errorMessage, { variant: 'danger' });
        });
    }, [categoryName, createThematicArea, handleResult, alert]);

    const handleUpdate = useCallback(() => {
        const name = categoryName?.trim();
        if (!name || isNotDefined(editingId)) {
            return;
        }
        updateThematicArea({ id: editingId, data: { name } }).then((resp) => {
            handleResult(resp.data?.updateThematicArea?.ok, 'Category updated successfully');
        }).catch(() => {
            alert.show(errorMessage, { variant: 'danger' });
        });
    }, [categoryName, editingId, updateThematicArea, handleResult, alert]);

    const handleEdit = useCallback((id: string) => {
        setEditingId(id);
        setCategoryName(categories?.find((item) => item.id === id)?.name);
    }, [categories]);

    const handleCancelEdit = useCallback(() => {
        setEditingId(undefined);
        setCategoryName(undefined);
    }, []);

    const handleDelete = useCallback((id: string) => {
        deleteThematicArea({ id }).then((resp) => {
            handleResult(resp.data?.deleteThematicArea?.ok, 'Category deleted successfully');
        }).catch(() => {
            alert.show(errorMessage, { variant: 'danger' });
        });
    }, [deleteThematicArea, handleResult, alert]);

    const columns = useMemo(() => [
        createStringColumn<ThematicArea, string | number>(
            'name',
            'Category name',
            (item) => item.name,
        ),
        createElementColumn<ThematicArea, string | number, CategoryActionsProps>(
            'actions',
            '',
            CategoryActions,
            (_, datum) => ({
                id: datum.id,
                onEdit: handleEdit,
                onDelete: handleDelete,
                disabled: actionPending,
            }),
            { columnWidth: 100 },
        ),
    ], [handleEdit, handleDelete, actionPending]);

    const isEditing = isDefined(editingId);

    return (
        <Modal
            heading="Categories"
            size="sm"
            onClose={onClose}
            footer={(
                <InlineLayout
                    spacing="sm"
                    after={(
                        <Button
                            name={undefined}
                            styleVariant="filled"
                            disabled={isNotDefined(categoryName) || actionPending}
                            onClick={isEditing ? handleUpdate : handleCreate}
                        >
                            {isEditing ? 'Update' : 'Add'}
                        </Button>
                    )}
                >
                    <TextInput
                        name="categoryName"
                        placeholder={isEditing ? 'Edit category name' : 'Add new category'}
                        value={categoryName}
                        onChange={setCategoryName}
                        actions={isEditing && (
                            <IconButton
                                name={undefined}
                                ariaLabel="Cancel edit"
                                title="Cancel edit"
                                variant="tertiary"
                                onClick={handleCancelEdit}
                            >
                                <CloseLineIcon />
                            </IconButton>
                        )}
                    />
                </InlineLayout>
            )}
        >
            <ListView layout="block">
                <TextInput
                    name="search"
                    placeholder="Search category"
                    value={rawFilter.search}
                    onChange={setFilterField}
                />
                <Table
                    data={categories}
                    keySelector={idSelector}
                    columns={columns}
                    pending={fetching}
                    errored={isDefined(error)}
                    filtered={filtered}
                />
                <Pager
                    activePage={page}
                    itemsCount={data?.thematicAreas?.totalCount ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            </ListView>
        </Modal>
    );
}

export default CategoryModal;
