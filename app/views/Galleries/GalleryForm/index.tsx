import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useParams } from 'react-router';
import {
    CloseLineIcon,
    UploadLineIcon,
} from '@ifrc-go/icons';
import {
    BlockLoading,
    Button,
    Container,
    Heading,
    IconButton,
    Image,
    InputError,
    InputSection,
    ListView,
    RawFileInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import {
    type GalleryAlbumCreateInput,
    type GalleryAlbumUpdateInput,
    useCreateGalleryAlbumMutation,
    useCreateGalleryImageMutation,
    useDeleteGalleryImageMutation,
    useGalleryAlbumDetailQuery,
    useGalleryImageListQuery,
    useUpdateGalleryAlbumMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { errorMessage } from '#utils/common';

import styles from './styles.module.css';

type PartialFormType = PartialForm<GalleryAlbumCreateInput>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const GalleryAlbumSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        title: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

const defaultEditFormValue: PartialFormType = {};

// Maximum number of images to load for an album in the edit view.
const MAX_IMAGES = 100;

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function getDisplayName(name: string) {
    return name.split('/').pop()?.replace(/\.[^.]+$/, '') ?? name;
}

interface ExistingImage {
    id: string;
    name: string;
    size: number;
    url: string;
}

function GalleryForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const alert = useAlert();

    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(GalleryAlbumSchema, { value: defaultEditFormValue });

    const [{ data, fetching: albumDetailFetch }] = useGalleryAlbumDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
    });

    const [{ data: imagesData, fetching: imagesFetch }] = useGalleryImageListQuery({
        variables: { filters: { albumId: id ?? '' }, offset: 0, limit: MAX_IMAGES },
        pause: !id,
        requestPolicy: 'network-only',
    });

    const [{ fetching: createGalleryPending }, createAlbum] = useCreateGalleryAlbumMutation();
    const [{ fetching: updateGalleryPending }, updateAlbum] = useUpdateGalleryAlbumMutation();
    const [, addImagesToGallery] = useCreateGalleryImageMutation();
    const [, deleteImagesFromGallery] = useDeleteGalleryImageMutation();

    const albumData = data?.galleryAlbum;

    useEffect(() => {
        if (!albumDetailFetch && isDefined(albumData)) {
            setValue(removeNull({
                title: albumData.title,
            }));
        }
    }, [albumDetailFetch, albumData, setValue]);

    const existingImages: ExistingImage[] = useMemo(() => (
        (imagesData?.galleryImages.results ?? [])
            .filter((image) => !removedImageIds.includes(image.id))
            .map((image) => ({
                id: image.id,
                name: image.image.name,
                size: image.image.size,
                url: image.image.url,
            }))
    ), [imagesData, removedImageIds]);

    const newFilePreviews = useMemo(
        () => newFiles.map((file) => URL.createObjectURL(file)),
        [newFiles],
    );

    useEffect(() => () => {
        newFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    }, [newFilePreviews]);

    const handleFilesSelect = useCallback((files: File[] | undefined) => {
        if (files && files.length > 0) {
            setNewFiles((prev) => [...prev, ...files]);
        }
    }, []);

    const handleRemoveExistingImage = useCallback((imageId: string) => {
        setRemovedImageIds((prev) => [...prev, imageId]);
    }, []);

    const handleRemoveNewFile = useCallback((index: number) => {
        setNewFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
    }, []);

    const handleGalleryImages = useCallback(async (albumId: string) => {
        const deleteResponses = await Promise.all(
            removedImageIds.map((imageId) => deleteImagesFromGallery({ id: imageId })),
        );
        const deleteFailed = deleteResponses.some(
            (res) => !res.data?.deleteGalleryImage?.ok,
        );

        const uploadResponses = await Promise.all(
            newFiles.map((file, index) => addImagesToGallery({
                data: {
                    album: albumId,
                    image: file,
                    order: existingImages.length + index,
                },
            })),
        );
        const uploadFailed = uploadResponses.some(
            (res) => !res.data?.createGalleryImage?.ok,
        );

        const uploadedImageIds = uploadResponses
            .map((res) => res.data?.createGalleryImage?.result?.id)
            .filter(isDefined);
        const coverImageId = existingImages[0]?.id ?? uploadedImageIds[0];

        let coverFailed = false;
        if (coverImageId) {
            const coverRes = await updateAlbum({
                id: albumId,
                data: { coverImage: coverImageId },
            });
            coverFailed = !coverRes.data?.updateGalleryAlbum?.ok;
        }

        return deleteFailed || uploadFailed || coverFailed;
    }, [
        updateAlbum,
        addImagesToGallery,
        deleteImagesFromGallery,
        removedImageIds,
        existingImages,
        newFiles,
    ]);

    const handleCreateGallery = useCallback(async (formData: PartialFormType) => {
        setSubmitting(true);
        try {
            const res = await createAlbum({
                data: formData as GalleryAlbumCreateInput,
            });
            const result = res.data?.createGalleryAlbum;
            if (!result?.ok || !result.result?.id) {
                if (result?.errors) {
                    setError(result.errors);
                }
                alert.show(result?.errors ?? errorMessage, { variant: 'danger' });
                return;
            }

            const imagesFailed = await handleGalleryImages(result.result.id);
            if (imagesFailed) {
                alert.show(
                    'Gallery saved, but some images could not be updated. Please review and try again.',
                    { variant: 'warning' },
                );
            } else {
                alert.show('Gallery created successfully', { variant: 'success' });
            }
            navigate('galleries');
        } catch {
            alert.show(errorMessage, { variant: 'danger' });
        } finally {
            setSubmitting(false);
        }
    }, [
        alert,
        navigate,
        setError,
        createAlbum,
        handleGalleryImages,
    ]);

    const handleUpdateGallery = useCallback(async (formData: PartialFormType) => {
        if (!id) {
            return;
        }
        setSubmitting(true);
        try {
            const res = await updateAlbum({
                id,
                data: formData as GalleryAlbumUpdateInput,
            });
            const result = res.data?.updateGalleryAlbum;
            if (!result?.ok) {
                if (result?.errors) {
                    setError(result.errors);
                }
                alert.show(result?.errors ?? errorMessage, { variant: 'danger' });
                return;
            }

            const imagesFailed = await handleGalleryImages(id);
            if (imagesFailed) {
                alert.show(
                    'Gallery saved, but some images could not be updated. Please review and try again.',
                    { variant: 'warning' },
                );
            } else {
                alert.show('Gallery updated successfully', { variant: 'success' });
            }
            navigate('galleries');
        } catch {
            alert.show(errorMessage, { variant: 'danger' });
        } finally {
            setSubmitting(false);
        }
    }, [
        id,
        alert,
        navigate,
        setError,
        updateAlbum,
        handleGalleryImages,
    ]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            isDefined(id) ? handleUpdateGallery : handleCreateGallery,
        )(),
        [validate, setError, id, handleUpdateGallery, handleCreateGallery],
    );

    const handleCancelClick = useCallback(() => {
        navigate('galleries');
    }, [navigate]);

    const error = getErrorObject(formError);
    const hasOversizedFile = newFiles.some((file) => file.size > MAX_FILE_SIZE);

    if (albumDetailFetch || imagesFetch) {
        return (
            <BlockLoading
                withoutBorder
                compact
                message="Loading"
            />
        );
    }

    return (
        <Container
            heading={id ? 'Edit Gallery' : 'Create New Galleries'}
            headerDescription="Build a new gallery by adding images and relevant details to showcase visual content in a clear and organized manner"
            withPadding
            footerActions={(
                <ListView>
                    <Button
                        name={undefined}
                        onClick={handleCancelClick}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                        disabled={
                            submitting
                            || createGalleryPending
                            || updateGalleryPending
                            || hasOversizedFile
                        }
                    >
                        Save
                    </Button>
                </ListView>
            )}
        >
            <ListView layout="block">
                <InputSection
                    title="Event Name"
                    description="Enter the name of the event"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="title"
                        value={value.title}
                        onChange={setFieldValue}
                        error={error?.title}
                    />
                </InputSection>
                <InputSection
                    title="Add Content"
                    description="Upload Images for the event"
                >
                    <ListView
                        layout="grid"
                        numPreferredGridColumns={5}
                    >
                        {existingImages.map((image) => (
                            <div className={styles.fileItem} key={image.id}>
                                <Image
                                    imgElementClassName={styles.imageElement}
                                    src={image.url}
                                    alt={image.name}
                                    caption={(
                                        <Heading level={6} ellipsize>
                                            {getDisplayName(image.name)}
                                        </Heading>
                                    )}
                                    size="md"
                                />
                                <IconButton
                                    className={styles.removeButton}
                                    name={image.id}
                                    title="Remove image"
                                    ariaLabel="Remove image"
                                    onClick={handleRemoveExistingImage}
                                    variant="secondary"
                                    disabled={submitting}
                                >
                                    <CloseLineIcon />
                                </IconButton>
                            </div>
                        ))}
                        {newFiles.map((file, index) => (
                            <div
                                // eslint-disable-next-line react/no-array-index-key
                                key={`${file.name}-${index}`}
                                className={styles.fileItem}
                            >
                                <Image
                                    imgElementClassName={styles.imageElement}
                                    src={newFilePreviews[index]}
                                    alt={file.name}
                                    caption={(
                                        <Heading level={6} ellipsize>
                                            {getDisplayName(file.name)}
                                        </Heading>
                                    )}
                                    size="md"
                                    withContainedFit
                                />
                                <IconButton
                                    className={styles.removeButton}
                                    name={index}
                                    title="Remove image"
                                    ariaLabel="Remove image"
                                    onClick={handleRemoveNewFile}
                                    variant="secondary"
                                    disabled={submitting}
                                >
                                    <CloseLineIcon />
                                </IconButton>
                                {file.size > MAX_FILE_SIZE && (
                                    <InputError>
                                        File size exceeds 2MB limit.
                                    </InputError>
                                )}
                            </div>
                        ))}
                        <RawFileInput
                            name={undefined}
                            multiple
                            accept="image/*"
                            disabled={submitting}
                            onChange={handleFilesSelect}
                            className={_cs(
                                styles.uploadTile,
                                submitting && styles.disabled,
                            )}
                            childrenContainerClassName={styles.uploadTileContent}
                            styleVariant="action"
                            withoutPadding
                        >
                            <UploadLineIcon className={styles.uploadIcon} />
                            <Heading level={5}>
                                Click to upload images
                            </Heading>
                        </RawFileInput>
                    </ListView>
                    {hasOversizedFile && (
                        <InputError>
                            Please remove or replace the images that exceed the 2MB
                            limit before saving.
                        </InputError>
                    )}
                </InputSection>
            </ListView>
        </Container>
    );
}

export default GalleryForm;
