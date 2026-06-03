import { useCallback } from 'react';
import { useParams } from 'react-router';
import {
    BlockLoading,
    Button,
    Container,
    InputSection,
    ListView,
    TextInput,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';
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
    type TeamCreateInput,
    type TeamUpdateInput,
    useCreateTeamMutation,
    useTeamDetailQuery,
    useUpdateTeamMutation,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import { errorMessage } from '#utils/common';

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

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'teams';
        const alertMessage = `Team ${id ? 'updated' : 'created'} successfully`;

        if (id) {
            const res = await updateTeamMutate({
                id,
                data: mutationData as TeamUpdateInput,
            });
            const result = res.data?.updateTeam;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result.errors);
                alert.show(result.errors, { variant: 'danger' });
            }
        } else {
            const res = await createTeamMutate({
                data: mutationData as TeamCreateInput,
            });
            const result = res.data?.createTeam;
            if (result?.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (result?.errors) {
                setError(result?.errors);
                alert.show(result?.errors?.message ?? errorMessage, { variant: 'danger' });
            }
        }
    }, [alert, updateTeamMutate, id, navigate, setError, createTeamMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    const error = getErrorObject(formError);

    const teamData = data?.team;
    if (!teamDetailFetch && isDefined(teamData)) {
        setValue(removeNull(teamData));
    }

    if (teamDetailFetch || createPending || updatePending) {
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
                        onClick={() => navigate('teams')}
                    >
                        Cancel
                    </Button>
                    <Button
                        name={undefined}
                        onClick={handleFormSubmit}
                        styleVariant="filled"
                    >
                        Save
                    </Button>
                </ListView>
            )}
        >
            <ListView layout="block">
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
                    />
                </InputSection>
                <InputSection
                    title="Description"
                    description="Enter the description about the team"
                >
                    <TextInput
                        name="description"
                        value={value.description}
                        onChange={setFieldValue}
                        error={error?.description}
                    />
                </InputSection>
            </ListView>
        </Container>
    );
}

export default TeamForm;
