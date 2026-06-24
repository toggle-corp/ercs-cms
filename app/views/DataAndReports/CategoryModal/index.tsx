import {
    useCallback,
    useState,
} from 'react';
import {
    AddLineIcon,
    CheckLineIcon,
    CloseLineIcon,
    DeleteBinLineIcon,
    EditTwoLineIcon,
} from '@ifrc-go/icons';
import {
    IconButton,
    InlineLayout,
    List,
    ListView,
    Modal,
    Pager,
    TextInput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

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

interface CategoryItemProps {
    category: ThematicArea;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    disabled: boolean;
}

function CategoryItem(props: CategoryItemProps) {
    const {
        category,
        onEdit,
        onDelete,
        disabled,
    } = props;

    return (
        <ListView
            layout="inline"
            spacing="sm"
            withSpaceBetweenContents
        >
            {category.name}
            <ListView
                layout="inline"
                spacing="sm"
            >
                <IconButton
                    name={category.id}
                    ariaLabel="Edit category"
                    title="Edit category"
                    variant="tertiary"
                    onClick={onEdit}
                    disabled={disabled}
                >
                    <EditTwoLineIcon />
                </IconButton>
                <IconButton
                    name={category.id}
                    ariaLabel="Delete category"
                    title="Delete category"
                    variant="tertiary"
                    onClick={onDelete}
                    disabled={disabled}
                >
                    <DeleteBinLineIcon />
                </IconButton>
            </ListView>
        </ListView>
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

    const handleSave = useCallback(() => {
        const name = categoryName?.trim();
        if (!name) {
            return;
        }
        if (isDefined(editingId)) {
            updateThematicArea({ id: editingId, data: { name } }).then((resp) => {
                handleResult(resp.data?.updateThematicArea?.ok, 'Category updated successfully');
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        } else {
            createThematicArea({ data: { name } }).then((resp) => {
                handleResult(resp.data?.createThematicArea?.ok, 'Category added successfully');
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        }
    }, [categoryName, editingId, createThematicArea, updateThematicArea, handleResult, alert]);

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

    const rendererParams = useCallback((_: string, category: ThematicArea) => ({
        category,
        onEdit: handleEdit,
        onDelete: handleDelete,
        disabled: actionPending,
    }), [handleEdit, handleDelete, actionPending]);

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
                        <ListView layout="inline" spacing="sm">
                            {isEditing && (
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
                            <IconButton
                                name={undefined}
                                ariaLabel={isEditing ? 'Update category' : 'Add category'}
                                title={isEditing ? 'Update category' : 'Add category'}
                                variant="primary"
                                disabled={!categoryName?.trim() || actionPending}
                                onClick={handleSave}
                            >
                                {isEditing ? <CheckLineIcon /> : <AddLineIcon />}
                            </IconButton>
                        </ListView>
                    )}
                >
                    <TextInput
                        name="categoryName"
                        placeholder={isEditing ? 'Edit category name' : 'Add new category'}
                        value={categoryName}
                        onChange={setCategoryName}
                    />
                </InlineLayout>
            )}
        >
            <TextInput
                name="search"
                placeholder="Search category"
                value={rawFilter.search}
                onChange={setFilterField}
            />
            <List
                data={categories}
                keySelector={idSelector}
                renderer={CategoryItem}
                rendererParams={rendererParams}
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
        </Modal>
    );
}

export default CategoryModal;
