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
    DateInput,
    Description,
    Image,
    InlineLayout,
    InputError,
    InputSection,
    ListView,
    RadioInput,
    RawFileInput,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import {
    createSubmitHandler,
    getErrorObject,
    getErrorString,
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import EmbedPreview from '#components/EmbedPreview';
import NonFieldError from '#components/NonFieldError';
import RegionSelectInput from '#components/RegionSelectInput';
import {
    AdminAreaLevel,
    ReportContentType,
    type ReportCreateInput,
    ReportTypeEnum,
    type ReportUpdateInput,
    ReportVisibility,
    useCreateReportMutation,
    useReportDetailQuery,
    useReportEnumsQuery,
    useThematicAreasQuery,
    useUpdateReportMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    idSelector,
    keySelector,
    labelSelector,
    nameSelector,
    omitKeys,
    safeUrlCondition,
    transformToFormError,
} from '#utils/common';

type PartialFormType = PartialForm<ReportCreateInput>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

// NOTE: file/iframeUrl are required only on create.
function getReportSchema(isEditing: boolean): FormSchema {
    return {
        fields: (value): FormSchemaFields => {
            const baseFields: FormSchemaFields = {
                title: {
                    required: true,
                    requiredValidation: requiredStringCondition,
                },
                contentType: {
                    required: true,
                },
                description: {},
                coverImage: {},
                disasterType: {},
                owner: {},
                region: {},
                reportType: {
                    required: true,
                },
                visibility: {
                    required: true,
                },
                thematicArea: {
                    required: true,
                },
                publishedAt: {
                    required: true,
                },
            };

            if (value?.contentType === ReportContentType.Iframe) {
                return {
                    ...baseFields,
                    iframeUrl: {
                        required: !isEditing,
                        requiredValidation: requiredStringCondition,
                        validations: [safeUrlCondition],
                    },
                };
            }

            return {
                ...baseFields,
                file: {
                    required: !isEditing,
                },
            };
        },
    };
}

const defaultFormValue: PartialFormType = {
    contentType: ReportContentType.File,
    reportType: ReportTypeEnum.Report,
    visibility: ReportVisibility.Public,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getFileFields(
    file: File | null | undefined,
    coverImage: File | null | undefined,
) {
    return {
        ...(isDefined(file) ? { file } : {}),
        ...(isDefined(coverImage) ? { coverImage } : {}),
    };
}

function DataAndReportsForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const alert = useAlert();

    const isEditing = isDefined(id);

    const reportSchema = useMemo(() => getReportSchema(isEditing), [isEditing]);

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(reportSchema, { value: defaultFormValue });

    const [{ data: detailData, fetching: detailFetching }] = useReportDetailQuery({
        variables: { id: isDefined(id) ? id : '' },
        pause: isNotDefined(id),
    });

    const [{ data: enumsData }] = useReportEnumsQuery();
    const [{ data: thematicAreasData }] = useThematicAreasQuery();

    const [{ fetching: creating }, createReport] = useCreateReportMutation();
    const [{ fetching: updating }, updateReport] = useUpdateReportMutation();

    const pending = creating || updating || detailFetching;

    const {
        ReportVisibility: visibilityOptions,
        ReportContentType: contentTypeOptions,
    } = enumsData?.enums ?? {};

    const thematicAreaOptions = thematicAreasData?.thematicAreas?.results;

    const isIframe = value.contentType === ReportContentType.Iframe;

    const existingCoverImageUrl = detailData?.report?.coverImage?.url;

    const fileName = value.file instanceof File
        ? value.file.name
        : detailData?.report?.file?.name?.split('/').pop();

    const coverImagePreview = useMemo(() => {
        if (value.coverImage instanceof File) {
            return URL.createObjectURL(value.coverImage);
        }
        return existingCoverImageUrl;
    }, [value.coverImage, existingCoverImageUrl]);

    useEffect(() => () => {
        if (value.coverImage instanceof File && coverImagePreview) {
            URL.revokeObjectURL(coverImagePreview);
        }
    }, [coverImagePreview, value.coverImage]);

    const handleFileInputChange = useCallback(
        (file: File | undefined, name: 'coverImage' | 'file') => {
            if (isDefined(file) && file.size > MAX_FILE_SIZE) {
                alert.show('File must be 5MB or smaller', { variant: 'danger' });
                return;
            }
            setFieldValue(file, name);
        },
        [alert, setFieldValue],
    );

    const handleResult = useCallback((
        result: {
            ok?: boolean | null;
            errors?: Parameters<typeof transformToFormError>[0] | null;
        } | undefined | null,
        successMessage: string,
    ) => {
        if (isDefined(result) && result.ok) {
            navigate('dataAndReports');
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

        const res = await createReport({
            data: {
                ...removeNull(rest),
                ...getFileFields(file, coverImage),
            } as ReportCreateInput,
        });

        handleResult(res.data?.createReport, 'Report created successfully');
    }, [createReport, handleResult]);

    const handleUpdate = useCallback(async (formValues: PartialFormType) => {
        if (isNotDefined(id)) {
            return;
        }
        const { file, coverImage, ...rest } = formValues;

        const res = await updateReport({
            id,
            data: {
                ...omitKeys(removeNull(rest), ['contentType', 'iframeUrl']),
                ...getFileFields(file, coverImage),
            } as ReportUpdateInput,
        });

        handleResult(res.data?.updateReport, 'Report updated successfully');
    }, [id, updateReport, handleResult]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            isDefined(id) ? handleUpdate : handleCreate,
        )(),
        [validate, setError, id, handleUpdate, handleCreate],
    );

    const handleCancel = useCallback(() => {
        navigate('dataAndReports');
    }, [navigate]);

    const error = getErrorObject(formError);

    useEffect(() => {
        if (isNotDefined(detailData?.report)) {
            return;
        }
        const {
            regionId,
            thematicAreaId,
            ...otherValues
        } = removeNull(detailData.report);

        delete (otherValues as { coverImage?: unknown }).coverImage;
        delete (otherValues as { file?: unknown }).file;
        setValue({
            ...otherValues,
            region: regionId ?? undefined,
            thematicArea: thematicAreaId,
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
            heading={isDefined(id) ? 'Edit Report' : 'Create Report'}
            headerDescription={isDefined(id)
                ? 'Manage and update the report'
                : 'Create a new report from organizational data'}
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
            <ListView layout="grid" withSidebar>
                <ListView layout="block">
                    <NonFieldError
                        error={formError}
                        withFallbackError
                    />
                    <InputSection
                        title="Title"
                        description="Enter the title of the report"
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
                        title="Description"
                        description="Enter the description of the report"
                    >
                        <TextInput
                            name="description"
                            value={value.description}
                            onChange={setFieldValue}
                            error={error?.description}
                            disabled={pending}
                        />
                    </InputSection>
                    <InputSection
                        title="Disaster Type"
                        description="Enter the disaster type"
                    >
                        <TextInput
                            name="disasterType"
                            value={value.disasterType}
                            onChange={setFieldValue}
                            error={error?.disasterType}
                            disabled={pending}
                        />
                    </InputSection>
                    <InputSection
                        title="Cover Image"
                        description="Upload a cover image for the report (max 5MB)"
                    >
                        <RawFileInput
                            name="coverImage"
                            onChange={handleFileInputChange}
                            accept="image/*"
                            disabled={pending}
                            styleVariant="outline"
                        >
                            {isDefined(value.coverImage) || isDefined(coverImagePreview)
                                ? 'Change cover image'
                                : 'Upload cover image'}
                        </RawFileInput>
                        {isDefined(coverImagePreview) && (
                            <Image
                                src={coverImagePreview}
                                alt="Cover image preview"
                            />
                        )}
                    </InputSection>
                    <InputSection
                        title="Content Type"
                        description="Choose whether the report is a file or an embedded link"
                        withAsteriskOnTitle
                    >
                        <RadioInput
                            name="contentType"
                            value={value.contentType}
                            onChange={setFieldValue}
                            options={contentTypeOptions}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            error={error?.contentType}
                            disabled={pending || isDefined(id)}
                        />
                    </InputSection>
                    {isIframe ? (
                        <InputSection
                            title="Embed link"
                            description="Enter the Power BI report URL only (e.g., https://app.powerbi.com/...)"
                            withAsteriskOnTitle
                        >
                            <TextInput
                                name="iframeUrl"
                                value={value.iframeUrl}
                                onChange={setFieldValue}
                                error={error?.iframeUrl}
                                disabled={pending || isDefined(id)}
                            />
                        </InputSection>
                    ) : (
                        <InputSection
                            title="File"
                            description="Upload the report file (max 5MB)"
                            withAsteriskOnTitle
                        >
                            <InlineLayout
                                spacing="sm"
                                contentAlignment="center"
                                before={(
                                    <RawFileInput
                                        name="file"
                                        onChange={handleFileInputChange}
                                        disabled={pending}
                                        styleVariant="outline"
                                    >
                                        {isDefined(fileName) ? 'Change file' : 'Upload file'}
                                    </RawFileInput>
                                )}
                            >
                                <Description>
                                    {isDefined(fileName) ? fileName : 'Please upload a file'}
                                </Description>
                            </InlineLayout>
                            {isDefined(error?.file) && (
                                <InputError>
                                    {getErrorString(error.file)}
                                </InputError>
                            )}
                        </InputSection>
                    )}
                    <InputSection
                        title="Owner"
                        description="Enter the owner of the report"
                    >
                        <TextInput
                            name="owner"
                            value={value.owner}
                            onChange={setFieldValue}
                            error={error?.owner}
                            disabled={pending}
                        />
                    </InputSection>
                    <InputSection
                        title="Region"
                        description="Select the region"
                    >
                        <RegionSelectInput
                            name="region"
                            level={AdminAreaLevel.Region}
                            value={value.region}
                            onChange={setFieldValue}
                            error={error?.region}
                            disabled={pending}
                        />
                    </InputSection>
                    <InputSection
                        title="Visibility"
                        description="Choose if the report is public or private"
                        withAsteriskOnTitle
                    >
                        <RadioInput
                            name="visibility"
                            value={value.visibility}
                            onChange={setFieldValue}
                            options={visibilityOptions}
                            keySelector={keySelector}
                            labelSelector={labelSelector}
                            error={error?.visibility}
                            disabled={pending}
                        />
                    </InputSection>
                    <InputSection
                        title="Category"
                        description="Select the thematic area"
                        withAsteriskOnTitle
                    >
                        <SelectInput
                            name="thematicArea"
                            value={value.thematicArea}
                            onChange={setFieldValue}
                            options={thematicAreaOptions}
                            keySelector={idSelector}
                            labelSelector={nameSelector}
                            error={error?.thematicArea}
                            disabled={pending}
                        />
                    </InputSection>
                    <InputSection
                        title="Published At"
                        description="Select the published date"
                        withAsteriskOnTitle
                    >
                        <DateInput
                            name="publishedAt"
                            value={value.publishedAt}
                            onChange={setFieldValue}
                            error={error?.publishedAt}
                            disabled={pending}
                        />
                    </InputSection>
                </ListView>
                {isIframe && (
                    <EmbedPreview url={value.iframeUrl} />
                )}
            </ListView>
        </Container>
    );
}

export default DataAndReportsForm;
