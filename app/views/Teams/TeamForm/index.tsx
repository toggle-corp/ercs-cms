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
    TextArea,
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

import NonFieldError from '#components/NonFieldError';
import {
    type TeamCreateInput,
    type TeamUpdateInput,
    useCreateTeamMutation,
    useTeamDetailQuery,
    useUpdateTeamMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    errorMessage,
    transformToFormError,
} from '#utils/common';

type PartialFormType = PartialForm<TeamCreateInput>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const TeamSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        name: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        description: {},
    }),
};

const defaultEditFormValue: PartialFormType = {};

function TeamForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const alert = useAlert();

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(TeamSchema, { value: defaultEditFormValue });

    const [{ data, fetching: teamDetailFetch }] = useTeamDetailQuery({
        variables: { id: (id ?? '') }, pause: !id,
    });

    const [{ fetching: createPending }, createTeamMutate] = useCreateTeamMutation();
    const [{ fetching: updatePending }, updateTeamMutate] = useUpdateTeamMutation();

    const handleCreate = useCallback(async (mutationData: PartialFormType) => {
        const res = await createTeamMutate({
            data: mutationData as TeamCreateInput,
        });
        const result = res.data?.createTeam;

        if (isDefined(result) && result.ok) {
            navigate('teams');
            alert.show('Team created successfully', { variant: 'success' });
        } else if (isDefined(result) && isDefined(result.errors)) {
            setError(transformToFormError(result.errors));
            alert.show(errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [createTeamMutate, navigate, alert, setError]);

    const handleUpdate = useCallback(async (mutationData: PartialFormType) => {
        if (isNotDefined(id)) {
            return;
        }
        const res = await updateTeamMutate({
            id,
            data: mutationData as TeamUpdateInput,
        });
        const result = res.data?.updateTeam;

        if (isDefined(result) && result.ok) {
            navigate('teams');
            alert.show('Team updated successfully', { variant: 'success' });
        } else if (isDefined(result) && isDefined(result.errors)) {
            setError(transformToFormError(result.errors));
            alert.show(errorMessage, { variant: 'danger' });
        } else {
            alert.show(errorMessage, { variant: 'danger' });
        }
    }, [updateTeamMutate, id, navigate, alert, setError]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            isDefined(id) ? handleUpdate : handleCreate,
        )(),
        [validate, setError, id, handleUpdate, handleCreate],
    );

    const error = getErrorObject(formError);

    const teamData = data?.team;

    const handleCancelClick = useCallback(() => {
        navigate('teams');
    }, [navigate]);

    useEffect(() => {
        if (!teamDetailFetch && isDefined(teamData)) {
            setValue(removeNull(teamData));
        }
    }, [teamDetailFetch, teamData, setValue]);

    const pending = createPending || updatePending || teamDetailFetch;

    if (teamDetailFetch) {
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
            heading={id ? 'Edit Team' : 'Create New Team'}
            headerDescription="Create a team for delivering impactful solution"
            withPadding
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
                    title="Team name"
                    description="Enter the title name of the team"
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
                    title="Description"
                    description="Enter the description about the team"
                >
                    <TextArea
                        name="description"
                        value={value.description}
                        onChange={setFieldValue}
                        error={error?.description}
                        disabled={pending}
                    />
                </InputSection>
            </ListView>
        </Container>
    );
}

export default TeamForm;
