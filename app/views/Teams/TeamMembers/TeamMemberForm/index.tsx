import {
    useCallback,
    useEffect,
} from 'react';
import { useParams } from 'react-router';
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
    emailCondition,
    getErrorObject,
    type ObjectSchema,
    type PartialForm,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import NonFieldError from '#components/NonFieldError';
import RegionSelectInput from '#components/RegionSelectInput';
import {
    AdminAreaLevel,
    type TeamMemberCreateInput,
    type TeamMemberUpdateInput,
    useCreateTeamMemberMutation,
    useTeamMemberDetailsQuery,
    useUpdateTeamMemberMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useGlobalEnums from '#hooks/useGlobalEnums';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    keySelector,
    labelSelector,
    transformToFormError,
} from '#utils/common';

type PartialFormType = PartialForm<TeamMemberCreateInput>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const TeamSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        email: {
            required: true,
            requiredValidation: emailCondition,
        },
        phoneNumber: {},
        team: {
            required: true,
        },
        sex: {},
        position: {
            required: true,
            defaultValue: '',
        },
        region: {},
        woreda: {},
        training: {},
        fieldOfStudy: {},
    }),
};

function TeamMemberForm() {
    const { id, member } = useParams();
    const navigate = useRouting();
    const alert = useAlert();

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(TeamSchema, { value: { team: id } });

    const [{ data, fetching: teamMemberDetailFetch }] = useTeamMemberDetailsQuery({
        variables: { id: (member ?? '') }, pause: !member,
    });

    const [{ fetching: createPending }, createTeamMemberMutate] = useCreateTeamMemberMutation();
    const [{ fetching: updatePending }, updateTeamMemberMutate] = useUpdateTeamMemberMutation();

    const {
        teamMemberSex: sexOptions,
    } = useGlobalEnums();

    const handleCreate = useCallback(async (mutationData: PartialFormType) => {
        const res = await createTeamMemberMutate({
            data: mutationData as TeamMemberCreateInput,
        });
        const result = res.data?.createTeamMember;

        if (isDefined(result) && result.ok) {
            alert.show('Team Member created successfully', { variant: 'success' });
            if (isDefined(id)) {
                navigate('teamMembers', { id });
            }
        } else if (isDefined(result) && isDefined(result.errors)) {
            setError(transformToFormError(result.errors));
            alert.show(errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [createTeamMemberMutate, id, navigate, alert, setError]);

    const handleUpdate = useCallback(async (mutationData: PartialFormType) => {
        if (isNotDefined(member)) {
            return;
        }
        const res = await updateTeamMemberMutate({
            id: member,
            data: mutationData as TeamMemberUpdateInput,
        });
        const result = res.data?.updateTeamMember;

        if (isDefined(result) && result.ok) {
            alert.show('Team Member updated successfully', { variant: 'success' });
            if (isDefined(id)) {
                navigate('teamMembers', { id });
            }
        } else if (isDefined(result) && isDefined(result.errors)) {
            setError(transformToFormError(result.errors));
            alert.show(errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [updateTeamMemberMutate, member, id, navigate, alert, setError]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            isDefined(member) ? handleUpdate : handleCreate,
        )(),
        [validate, setError, member, handleUpdate, handleCreate],
    );

    const error = getErrorObject(formError);

    const teamMemberData = data?.teamMember;

    const handleCancelClick = useCallback(() => {
        if (isDefined(id)) {
            navigate('teamMembers', { id });
        }
    }, [id, navigate]);

    useEffect(() => {
        if (!teamMemberDetailFetch && isDefined(teamMemberData)) {
            const { ...otherValues } = removeNull(teamMemberData);
            setValue({
                team: id,
                ...otherValues,
            });
        }
    }, [teamMemberDetailFetch, id, teamMemberData, setValue]);

    const pending = createPending || updatePending || teamMemberDetailFetch;

    if (teamMemberDetailFetch) {
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
            heading={isDefined(member) ? 'Edit Member' : 'Add New Team Member'}
            headerDescription={isDefined(member) ? 'Manage and update team member information to ensure profiles remain accurate, relevant, and up to date.'
                : 'Add a new member to the team'}
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
                    title="Member Name"
                    description="Enter the name of the member"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="name"
                        value={value.name}
                        onChange={setFieldValue}
                        error={error?.name}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="Email"
                    description="Enter the email of the member"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="email"
                        value={value.email}
                        onChange={setFieldValue}
                        error={error?.email}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="Number"
                    description="Enter the member mobile number"
                >
                    <TextInput
                        name="phoneNumber"
                        value={value.phoneNumber}
                        onChange={setFieldValue}
                        error={error?.phoneNumber}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="Sex"
                    description="Enter the sex of the member"
                >
                    <SelectInput
                        name="sex"
                        value={value.sex}
                        onChange={setFieldValue}
                        error={error?.sex}
                        disabled={pending}
                        options={sexOptions}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                    />
                </InputSection>
                <InputSection
                    title="Position"
                    description="Enter the member's position"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="position"
                        value={value.position}
                        onChange={setFieldValue}
                        error={error?.position}
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
                    title="Woreda"
                    description="Select the woreda"
                >
                    <RegionSelectInput
                        name="woreda"
                        level={AdminAreaLevel.Woreda}
                        value={value.woreda}
                        onChange={setFieldValue}
                        error={error?.woreda}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="Training"
                    description="Enter the training type of the user"
                >
                    <TextInput
                        name="training"
                        value={value.training}
                        onChange={setFieldValue}
                        error={error?.training}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="Field of Study"
                    description="Enter the field of study of the member"
                >
                    <TextInput
                        name="fieldOfStudy"
                        value={value.fieldOfStudy}
                        onChange={setFieldValue}
                        error={error?.fieldOfStudy}
                        disabled={pending}
                    />
                </InputSection>
            </ListView>
        </Container>
    );
}

export default TeamMemberForm;
