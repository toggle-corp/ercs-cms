import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    CheckboxCircleLineIcon,
    DrefTwoIcon,
    ErrorWarningFillIcon,
} from '@ifrc-go/icons';
import {
    Button,
    Container,
    Description,
    InputError,
    ListView,
    Message,
    Modal,
    RawFileInput,
} from '@ifrc-go/ui';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import { emailCondition } from '@togglecorp/toggle-form';
import {
    readSheet,
    type Row,
} from 'read-excel-file/browser';

import Link from '#components/Link';
import {
    AdminAreaLevel,
    type TeamMemberCreateInput,
    type TeamMemberSex,
    useAdminAreasQuery,
    useBulkCreateTeamMembersMutation,
    useTeamMembersTemplateQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useGlobalEnums from '#hooks/useGlobalEnums';
import { errorMessage } from '#utils/common';

type MemberField = keyof Omit<TeamMemberCreateInput, 'team' | 'order'>;

interface FieldSpec {
    name: MemberField;
    required?: boolean;
}

const FIELDS: FieldSpec[] = [
    { name: 'name', required: true },
    { name: 'email', required: true },
    { name: 'phoneNumber' },
    { name: 'sex' },
    { name: 'position', required: true },
    { name: 'region' },
    // NOTE: woreda will be supported in the future
    // { name: 'woreda' },
    { name: 'training' },
    { name: 'fieldOfStudy' },
];

function readCell(value: Row[number]) {
    return String(value ?? '').trim();
}

function normalize(value: Row[number]) {
    return readCell(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getMissingMessage(header: string, rowNumber: number) {
    return `The data in "${header}" is missing, please check row ${rowNumber}`;
}

function getIncorrectMessage(header: string, value: string, rowNumber: number) {
    return `The data in "${header}" is incorrect ("${value}"), please check row ${rowNumber}`;
}

type ValidationResult =
    | { errors: string[]; members?: never }
    | { errors?: never; members: TeamMemberCreateInput[] };

interface ValidationContext {
    teamId: string;
    sexKeyByName: Record<string, TeamMemberSex>;
    regionIdByName: Record<string, string>;
}

function validateRows(rows: Row[], context: ValidationContext): ValidationResult {
    const {
        teamId,
        sexKeyByName,
        regionIdByName,
    } = context;

    const [headerRow = [], ...dataRows] = rows;
    const columns = listToMap(FIELDS, (field) => field.name, (field) => {
        const index = headerRow.findIndex(
            (header) => normalize(header) === normalize(field.name),
        );
        return {
            index,
            header: (index < 0 ? '' : readCell(headerRow[index])) || field.name,
        };
    });

    const missingColumns = FIELDS.filter(
        (field) => field.required && columns[field.name].index < 0,
    );
    if (missingColumns.length > 0) {
        return {
            errors: missingColumns.map(
                (field) => `The column "${field.name}" is missing from the uploaded file`,
            ),
        };
    }

    const errors: string[] = [];
    const members: TeamMemberCreateInput[] = [];

    dataRows.forEach((row, rowIndex) => {
        const rowNumber = rowIndex + 2;
        const rowErrorCount = errors.length;
        const values = listToMap(
            FIELDS,
            (field) => field.name,
            (field) => {
                const { index } = columns[field.name];
                return index < 0 ? '' : readCell(row[index]);
            },
        );

        if (Object.values(values).every((value) => value === '')) {
            return;
        }

        FIELDS.forEach((field) => {
            if (field.required && values[field.name] === '') {
                errors.push(getMissingMessage(columns[field.name].header, rowNumber));
            }
        });

        if (values.email !== '' && isDefined(emailCondition(values.email))) {
            errors.push(getIncorrectMessage(columns.email.header, values.email, rowNumber));
        }

        const sex = sexKeyByName[normalize(values.sex)];
        if (values.sex !== '' && isNotDefined(sex)) {
            errors.push(getIncorrectMessage(columns.sex.header, values.sex, rowNumber));
        }

        const region = regionIdByName[normalize(values.region)];
        if (values.region !== '' && isNotDefined(region)) {
            errors.push(getIncorrectMessage(columns.region.header, values.region, rowNumber));
        }

        if (errors.length > rowErrorCount) {
            return;
        }

        members.push({
            ...values,
            phoneNumber: values.phoneNumber || undefined,
            training: values.training || undefined,
            fieldOfStudy: values.fieldOfStudy || undefined,
            team: teamId,
            sex,
            region,
        });
    });

    if (errors.length > 0) {
        return { errors };
    }
    if (members.length === 0) {
        return { errors: ['The uploaded file has no team members'] };
    }
    return { members };
}

export interface Props {
    teamId: string;
    teamName: string | undefined;
    onClose: () => void;
    onImportSuccess: () => void;
}

function BulkImportModal(props: Props) {
    const {
        teamId,
        teamName,
        onClose,
        onImportSuccess,
    } = props;

    const alert = useAlert();

    const [fileName, setFileName] = useState<string>();
    const [reading, setReading] = useState(false);
    const [result, setResult] = useState<ValidationResult>();

    const { teamMemberSex: sexOptions } = useGlobalEnums();
    const [{ data: template }] = useTeamMembersTemplateQuery();
    const [{ data: regionData, fetching: regionsFetching }] = useAdminAreasQuery({
        variables: { filters: { level: AdminAreaLevel.Region } },
    });
    const [{ fetching: submitting }, bulkCreateTeamMembers] = useBulkCreateTeamMembersMutation();

    const regionIdByName = useMemo(() => listToMap(
        regionData?.adminAreas?.results ?? [],
        (region) => normalize(region.name),
        (region) => region.id,
    ), [regionData]);

    const sexKeyByName = useMemo(() => listToMap(
        sexOptions ?? [],
        (option) => normalize(option.label),
        (option) => option.key,
    ), [sexOptions]);

    const handleFileChange = useCallback((file: File | undefined) => {
        setResult(undefined);
        setFileName(file?.name);
        if (isNotDefined(file)) {
            return;
        }
        setReading(true);
        readSheet(file).then((rows) => {
            setResult(validateRows(rows, { teamId, sexKeyByName, regionIdByName }));
        }).catch(() => {
            setResult({
                errors: ['The file could not be read, please upload an xlsx file that follows the template'],
            });
        }).finally(() => {
            setReading(false);
        });
    }, [teamId, sexKeyByName, regionIdByName]);

    const errors = result?.errors;
    const members = result?.members;

    const handleSubmit = useCallback(async () => {
        if (isNotDefined(members)) {
            return;
        }
        const res = await bulkCreateTeamMembers({ data: { members } });
        const mutationResult = res.data?.bulkCreateTeamMembers;

        if (isDefined(mutationResult) && mutationResult.ok) {
            alert.show(
                `${members.length} team members imported successfully`,
                { variant: 'success' },
            );
            onImportSuccess();
            onClose();
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [members, bulkCreateTeamMembers, alert, onImportSuccess, onClose]);

    const referenceDataPending = isNotDefined(sexOptions) || regionsFetching;
    const pending = reading || submitting;

    return (
        <Modal
            heading={`IMPORT TEAM MEMBERS FOR ${teamName ?? ''}`}
            headerDescription="Please upload team member in xlxs format"
            onClose={onClose}
            footerActions={isDefined(members) ? (
                <Button
                    name={undefined}
                    styleVariant="filled"
                    onClick={handleSubmit}
                    disabled={pending}
                >
                    Submit
                </Button>
            ) : undefined}
        >
            <ListView
                layout="block"
                spacing="lg"
            >
                <ListView
                    layout="block"
                    spacing="xs"
                    withCenteredContents
                >
                    <RawFileInput
                        name="file"
                        accept=".xlsx, .xlsm"
                        onChange={handleFileChange}
                        styleVariant="outline"
                        colorVariant="primary"
                        disabled={pending || referenceDataPending}
                        before={<DrefTwoIcon />}
                    >
                        {fileName ?? 'Select a file to upload'}
                    </RawFileInput>
                    <Description
                        textSize="sm"
                        withLightText
                        withCenteredContent
                    >
                        The contents in the xlsx should follow the structure provided in
                        {' '}
                        <Link
                            href={template?.createTeamMemberTemplate ?? ''}
                            external
                            withUnderline
                        >
                            this template
                        </Link>
                    </Description>
                </ListView>
                {reading && (
                    <Message
                        compact
                        pending
                        title="Checking the uploaded file"
                    />
                )}
                {isDefined(errors) && errors.length > 0 && (
                    <Container
                        heading={`${errors.length} ${errors.length === 1 ? 'problem' : 'problems'} found in the uploaded file`}
                        headingLevel={5}
                        headerIcons={<ErrorWarningFillIcon />}
                        headerDescription="Correct the following in the xlsx file and upload it again."
                        withHeaderBorder
                        withContentWell
                        withPadding
                        spacing="sm"
                    >
                        <InputError>
                            <ListView
                                layout="block"
                                spacing="2xs"
                            >
                                {errors.map((error) => (
                                    <Description key={error}>
                                        {`• ${error}`}
                                    </Description>
                                ))}
                            </ListView>
                        </InputError>
                    </Container>
                )}
                {isDefined(members) && (
                    <Message
                        compact
                        icon={<CheckboxCircleLineIcon />}
                        title="All the data is correct"
                        description="The uploaded team members are ready to be imported. Click Submit to save them."
                    />
                )}
            </ListView>
        </Modal>
    );
}

export default BulkImportModal;
