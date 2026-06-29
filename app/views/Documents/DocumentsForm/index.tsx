import {
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import {
    createSearchParams,
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router';
import {
    BlockLoading,
    Button,
    Container,
    InputSection,
    ListView,
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
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import FileInput from '#components/FileInput';
import NonFieldError from '#components/NonFieldError';
import {
    type CreateDocumentMutation,
    ReportContentType,
    type ReportCreateInput,
    ReportTypeEnum,
    type ReportUpdateInput,
    type UpdateDocumentMutation,
    useCreateDocumentMutation,
    useDocumentDetailQuery,
    useUpdateDocumentMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useGlobalEnums from '#hooks/useGlobalEnums';
import routes from '#root/config/routes';
import {
    errorMessage,
    keySelector,
    labelSelector,
    omitKeys,
    transformToFormError,
} from '#utils/common';

type PartialFormType = PartialForm<ReportCreateInput>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const allowedReportTypes = [
    ReportTypeEnum.Manual,
    ReportTypeEnum.Policy,
    ReportTypeEnum.Guideline,
];

function isAllowedReportType(value: string | null | undefined): value is ReportTypeEnum {
    return allowedReportTypes.some((type) => type === value);
}

function getDocumentSchema(isEditing: boolean): FormSchema {
    return {
        fields: (): FormSchemaFields => ({
            reportType: {
                required: true,
            },
            contentType: {
                required: true,
            },
            title: {
                required: true,
                requiredValidation: requiredStringCondition,
            },
            file: {
                required: !isEditing,
            },
        }),
    };
}

const defaultFormValue: PartialFormType = {
    contentType: ReportContentType.File,
};

function getFileFields(file: File | null | undefined) {
    if (isDefined(file)) {
        return { file };
    }
    return {};
}

function DocumentsForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const alert = useAlert();
    const [searchParams] = useSearchParams();

    const isEditing = isDefined(id);

    const documentSchema = useMemo(() => getDocumentSchema(isEditing), [isEditing]);

    const seedType = searchParams.get('type');
    const initialValue = useMemo<PartialFormType>(() => ({
        ...defaultFormValue,
        reportType: isAllowedReportType(seedType) ? seedType : undefined,
    }), [seedType]);

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(documentSchema, { value: initialValue });

    const [{ data, fetching: documentDetailFetching }] = useDocumentDetailQuery({
        variables: { id: id ?? '' },
        pause: isNotDefined(id),
    });

    const { reportType: reportTypeEnumOptions } = useGlobalEnums();

    const [{ fetching: createPending }, createDocumentMutate] = useCreateDocumentMutation();
    const [{ fetching: updatePending }, updateDocumentMutate] = useUpdateDocumentMutation();

    const reportTypeOptions = useMemo(() => (
        (reportTypeEnumOptions ?? []).filter(
            (option) => allowedReportTypes.includes(option.key),
        )
    ), [reportTypeEnumOptions]);

    const navigateToDocuments = useCallback((reportType?: ReportTypeEnum | null) => {
        navigate({
            pathname: routes.documents.path,
            search: isDefined(reportType)
                ? createSearchParams({ tab: reportType }).toString()
                : undefined,
        });
    }, [navigate]);

    const handleResult = useCallback((
        result: CreateDocumentMutation['createReport'] | UpdateDocumentMutation['updateReport'] | undefined | null,
        successMessage: string,
        reportType?: ReportTypeEnum | null,
    ) => {
        if (isDefined(result) && result.ok) {
            navigateToDocuments(reportType);
            alert.show(successMessage, { variant: 'success' });
        } else if (isDefined(result) && isDefined(result.errors)) {
            setError(transformToFormError(result.errors));
            alert.show(errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [navigateToDocuments, alert, setError]);

    const handleCreate = useCallback(async (formValues: PartialFormType) => {
        const { file, ...otherValues } = formValues;

        const response = await createDocumentMutate({
            data: {
                ...removeNull(otherValues),
                ...getFileFields(file),
            } as ReportCreateInput,
        });

        handleResult(response.data?.createReport, 'Document created successfully', formValues.reportType);
    }, [createDocumentMutate, handleResult]);

    const handleUpdate = useCallback(async (formValues: PartialFormType) => {
        if (isNotDefined(id)) {
            return;
        }
        const { file, ...otherValues } = formValues;

        const response = await updateDocumentMutate({
            id,
            data: {
                ...omitKeys(removeNull(otherValues), ['contentType']),
                ...getFileFields(file),
            } as ReportUpdateInput,
        });

        handleResult(response.data?.updateReport, 'Document updated successfully', formValues.reportType);
    }, [id, updateDocumentMutate, handleResult]);

    const handleFileChange = useCallback(
        (file: File | undefined, name: 'file') => {
            setFieldValue(file, name);
        },
        [setFieldValue],
    );

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            isDefined(id) ? handleUpdate : handleCreate,
        ),
        [validate, setError, id, handleUpdate, handleCreate],
    );

    const error = getErrorObject(formError);

    const documentData = data?.report;

    const handleCancelClick = useCallback(() => {
        navigateToDocuments(value.reportType);
    }, [navigateToDocuments, value.reportType]);

    useEffect(() => {
        if (!documentDetailFetching && isDefined(documentData)) {
            setValue(omitKeys(removeNull(documentData), ['file']));
        }
    }, [documentDetailFetching, documentData, setValue]);

    const fileName = value.file instanceof File
        ? value.file.name
        : documentData?.file?.name?.split('/').pop();

    const pending = createPending || updatePending || documentDetailFetching;

    if (documentDetailFetching) {
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
            heading={isDefined(id) ? 'Edit Document' : 'Create Document'}
            headerDescription={isDefined(id)
                ? 'Manage and update the document'
                : 'Upload and organize a new document'}
            withPadding
            withContentOverflow
            footerActions={(
                <ListView>
                    <Button
                        name={undefined}
                        onClick={handleCancelClick}
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
                    title="Document Type"
                    description="Select the type of the document"
                    withAsteriskOnTitle
                >
                    <SelectInput
                        name="reportType"
                        value={value.reportType}
                        onChange={setFieldValue}
                        error={error?.reportType}
                        options={reportTypeOptions}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="File Upload"
                    description="Upload the document file"
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
                    title="Title"
                    description="Enter the title of the document"
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
            </ListView>
        </Container>
    );
}

export default DocumentsForm;
