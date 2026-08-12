import {
    useCallback,
    useMemo,
} from 'react';
import { AddFillIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    Pager,
    Table,
} from '@ifrc-go/ui';
import {
    createDateColumn,
    createElementColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';

import EditDeleteActions, { type Props as EditDeleteActionsProps } from '#components/EditDeleteActions';
import {
    type GalleryAlbumFilter,
    type GalleryAlbumListQuery,
    useDeleteGalleryAlbumMutation,
    useGalleryAlbumListQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useFilterState from '#hooks/useFilterState';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
} from '#utils/common';

import GalleryFilter from './GalleryFilter';

type GalleryAlbumListItem = NonNullable<NonNullable<GalleryAlbumListQuery['galleryAlbums']>['results'][number] & { no: number }>;

export interface GalleryAlbumsFilterType extends Omit<GalleryAlbumFilter, 'createdAt'> {
    createdAtGte: string | undefined;
    createdAtLte: string | undefined;
}

const defaultFilter: GalleryAlbumsFilterType = {
    search: undefined,
    createdAtGte: undefined,
    createdAtLte: undefined,
};

function Galleries() {
    const {
        filter,
        rawFilter,
        filtered,
        setFilterField,
        resetFilter,
        page,
        setPage,
        limit,
        offset,
    } = useFilterState({
        filter: defaultFilter,
    });

    const alert = useAlert();
    const navigate = useRouting();

    const queryVariables = useMemo(() => ({
        offset,
        limit,
        filters: {
            search: filter.search,
            createdAt: (filter.createdAtGte || filter.createdAtLte) ? {
                gte: filter.createdAtGte,
                lte: filter.createdAtLte,
            } : undefined,
        },
    }), [limit, offset, filter]);

    const [{ fetching, data }, reExecuteQuery] = useGalleryAlbumListQuery({
        variables: queryVariables,
    });
    const [, deleteGalleryAlbum] = useDeleteGalleryAlbumMutation();

    const handleCreateClick = useCallback(() => {
        navigate('createGalleryAlbum');
    }, [navigate]);

    const onDeleteClick = useCallback(
        (albumId: string) => {
            deleteGalleryAlbum({ id: albumId }).then((resp) => {
                const result = resp.data?.deleteGalleryAlbum;
                if (result?.ok) {
                    reExecuteQuery();
                    alert.show('Gallery album deleted successfully', { variant: 'success' });
                } else {
                    alert.show(errorMessage, { variant: 'danger' });
                }
            }).catch(() => {
                alert.show(errorMessage, { variant: 'danger' });
            });
        },
        [deleteGalleryAlbum, reExecuteQuery, alert],
    );

    const tableData = useMemo(() => (
        data?.galleryAlbums.results.map((album, index) => {
            const no = (page - 1) * limit + index + 1;
            return {
                ...album,
                no,
            };
        })
    ), [page, data, limit]);

    const columns = useMemo(() => [
        createNumberColumn<GalleryAlbumListItem, string | number>(
            'no',
            'No.',
            (album) => album.no,
        ),
        createDateColumn<GalleryAlbumListItem, string | number>(
            'createdAt',
            'Created At',
            (album) => album.createdAt,
        ),
        createStringColumn<GalleryAlbumListItem, string | number>(
            'title',
            'Title',
            (album) => album.title,
        ),
        createNumberColumn<GalleryAlbumListItem, string | number>(
            'imagesCount',
            '# of Images',
            (album) => album.imagesCount,
        ),
        createStringColumn<GalleryAlbumListItem, string | number>(
            'createdBy',
            'Created By',
            (album) => album.createdBy.fullName,
        ),
        createDateColumn<GalleryAlbumListItem, string | number>(
            'updatedAt',
            'Updated At',
            (album) => album.updatedAt,
        ),
        createElementColumn<GalleryAlbumListItem, string | number, EditDeleteActionsProps>(
            'actions',
            '',
            EditDeleteActions,
            (_, datum) => ({
                id: datum.id,
                onDelete: onDeleteClick,
                itemTitle: datum.title,
                to: 'editGalleryAlbum',
            }),
            { columnWidth: 100 },
        ),
    ], [onDeleteClick]);

    return (
        <Container
            withPadding
            heading="Galleries"
            headerDescription="Manage and organize images and media across the platform"
            filters={(
                <GalleryFilter
                    value={rawFilter}
                    onChange={setFilterField}
                    filtered={filtered}
                    onReset={resetFilter}
                />
            )}
            footerActions={(
                <Pager
                    activePage={page}
                    itemsCount={data?.galleryAlbums.totalCount ?? 0}
                    maxItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
            headerActions={(
                <Button
                    name={undefined}
                    onClick={handleCreateClick}
                    before={(<AddFillIcon />)}
                    styleVariant="filled"
                >
                    Create
                </Button>
            )}
        >
            <Table
                keySelector={idSelector}
                columns={columns}
                data={tableData}
                filtered={filtered}
                pending={fetching}
            />
        </Container>
    );
}

export default Galleries;
