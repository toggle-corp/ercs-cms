import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import { useParams } from 'react-router';
import {
    BlockLoading,
    Button,
    Container,
    InputSection,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    type PartialForm,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import CoverImageInput from '#components/CoverImageInput';
import FileInput from '#components/FileInput';
import NonFieldError from '#components/NonFieldError';
import {
    ReportContentType,
    type ReportCreateInput,
    ReportTypeEnum,
    type ReportUpdateInput,
    useCreateOnlineInteractiveMutation,
    useOnlineInteractiveDetailQuery,
    useUpdateOnlineInteractiveMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    transformToFormError,
} from '#utils/common';

type FormFields = Pick<ReportCreateInput, 'title' | 'file' | 'coverImage' | 'contentType' | 'reportType'>;
type PartialFormType = PartialForm<FormFields>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

function getOnlineInteractiveSchema(isEditing: boolean): FormSchema {
    return {
        fields: (): FormSchemaFields => ({
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            contentType: {
                required: true,
            },
            reportType: {
                required: true,
            },
            file: {
                required: !isEditing,
            },
            coverImage: {},
        }),
    };
}

const defaultFormValue: PartialFormType = {
    contentType: ReportContentType.File,
    reportType: ReportTypeEnum.OnlineInteractive,
};

function OnlineInteractiveForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const alert = useAlert();

    const isEditing = isDefined(id);

    const schema = useMemo(() => getOnlineInteractiveSchema(isEditing), [isEditing]);

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(schema, { value: defaultFormValue });

    const [{ data: detailData, fetching: detailFetching }] = useOnlineInteractiveDetailQuery({
        variables: { id: isDefined(id) ? id : '' },
        pause: isNotDefined(id),
    });

    const [{ fetching: creating }, createOnlineInteractive] = useCreateOnlineInteractiveMutation();
    const [{ fetching: updating }, updateOnlineInteractive] = useUpdateOnlineInteractiveMutation();

    const pending = creating || updating || detailFetching;

    const fileName = value.file instanceof File
        ? value.file.name
        : detailData?.report?.file?.name?.split('/').pop();

    const handleFileChange = useCallback(
        (file: File | undefined, name: 'file') => {
            setFieldValue(file, name);
        },
        [setFieldValue],
    );

    const handleCoverImageChange = useCallback(
        (file: File | undefined, name: 'coverImage') => {
            setFieldValue(file, name);
        },
        [setFieldValue],
    );

    const handleResult = useCallback((
        result: {
            ok?: boolean | null;
            errors?: Parameters<typeof transformToFormError>[0] | null;
        } | undefined | null,
        successMessage: string,
    ) => {
        if (isDefined(result) && result.ok) {
            navigate('onlineInteractive');
            alert.show(successMessage, { variant: 'success' });
        } else if (isDefined(result) && isDefined(result.errors)) {
            setError(transformToFormError(result.errors));
            alert.show(errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [navigate, alert, setError]);

    const handleCreate = useCallback(async (formValues: PartialFormType) => {
        const { file, coverImage, ...rest } = formValues;

        const res = await createOnlineInteractive({
            data: {
                ...rest,
                ...(isDefined(file) ? { file } : {}),
                ...(isDefined(coverImage) ? { coverImage } : {}),
            } as ReportCreateInput,
        });

        handleResult(res.data?.createReport, 'Online interactive created successfully');
    }, [createOnlineInteractive, handleResult]);

    const handleUpdate = useCallback(async (formValues: PartialFormType) => {
        if (isNotDefined(id)) {
            return;
        }
        const { file, coverImage, title } = formValues;

        const res = await updateOnlineInteractive({
            id,
            data: {
                title,
                ...(isDefined(file) ? { file } : {}),
                ...(isDefined(coverImage) ? { coverImage } : {}),
            } as ReportUpdateInput,
        });

        handleResult(res.data?.updateReport, 'Online interactive updated successfully');
    }, [id, updateOnlineInteractive, handleResult]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            isDefined(id) ? handleUpdate : handleCreate,
        )(),
        [validate, setError, id, handleUpdate, handleCreate],
    );

    const handleCancel = useCallback(() => {
        navigate('onlineInteractive');
    }, [navigate]);

    const error = getErrorObject(formError);

    useEffect(() => {
        if (isNotDefined(detailData?.report)) {
            return;
        }
        setValue({
            ...defaultFormValue,
            title: detailData.report.title,
        });
    }, [detailData, setValue]);

    if (detailFetching) {
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
            heading={isEditing ? 'Edit Online Interactive' : 'Create Online Interactive'}
            headerDescription={isEditing
                ? 'Manage and update the online interactive'
                : 'Create a new online interactive'}
            withPadding
            footerActions={(
                <ListView>
                    <Button
                        name={undefined}
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                        disabled={pending}
                    >
                        Save
                    </Button>
                </ListView>
            )}
        >
            <ListView layout="block">
                <NonFieldError
                    error={formError}
                    withFallbackError
                />
                <InputSection
                    title="Title"
                    description="Enter the title of the online interactive"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="title"
                        value={value.title}
                        onChange={setFieldValue}
                        error={error?.title}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="File"
                    description="Upload the online interactive file (max 5MB)"
                    withAsteriskOnTitle
                >
                    <FileInput
                        name="file"
                        fileName={fileName}
                        onChange={handleFileChange}
                        error={error?.file}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="Cover Image"
                    description="Upload a cover image for the online interactive"
                >
                    <CoverImageInput
                        name="coverImage"
                        value={value.coverImage instanceof File ? value.coverImage : undefined}
                        existingUrl={detailData?.report?.coverImage?.url}
                        onChange={handleCoverImageChange}
                        error={error?.coverImage}
                        disabled={pending}
                    />
                </InputSection>
            </ListView>
        </Container>
    );
}

export default OnlineInteractiveForm;
