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
    RadioInput,
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

import RegionSelectInput from '#components/RegionSelectInput';
import {
    AdminAreaLevel,
    useCreateUserMutation,
    useEnumsQuery,
    type UserCreateInput,
    type UserUpdateInput,
    useUpdateUserMutation,
    useUserDetailQuery,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import {
    keySelector,
    labelSelector,
    statusOptions,
    valueSelector,
} from '#utils/common';

type PartialFormType = PartialForm<UserCreateInput>;
type FormSchema = ObjectSchema<PartialFormType>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const getUserSchema = (isCreate: boolean): FormSchema => ({
    fields: (): FormSchemaFields => ({
        email: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        fullName: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        password: {
            required: isCreate,
            requiredValidation: requiredStringCondition,
        },
        role: {},
        region: {},
        isActive: {},
    }),
});

const defaultEditFormValue: PartialFormType = {
    isActive: false,
};

function UserForm() {
    const { id } = useParams();
    const navigate = useRouting();
    const alert = useAlert();

    const userSchema = useMemo(() => getUserSchema(isNotDefined(id)), [id]);

    const {
        setFieldValue,
        error: formError,
        value,
        validate,
        setError,
        setValue,
    } = useForm(userSchema, { value: defaultEditFormValue });

    const [{ data, fetching: userDetailFetch }] = useUserDetailQuery({
        variables: { id: isDefined(id) ? id : '' },
        pause: isNotDefined(id),
    });

    const [{ data: enumsData }] = useEnumsQuery();

    const roleOptions = enumsData?.enums?.UserRole;

    const [{ fetching: createPending }, createUserMutate] = useCreateUserMutation();
    const [{ fetching: updatePending }, updateUserMutate] = useUpdateUserMutation();

    const pending = createPending || updatePending || userDetailFetch;

    const handleMutation = useCallback(async (mutationData: PartialFormType) => {
        const redirectPath = 'users';
        const alertMessage = `User ${isDefined(id) ? 'updated' : 'created'} successfully`;

        if (isDefined(id)) {
            const updatePayload = Object.fromEntries(
                Object.entries(removeNull(mutationData)).filter(([key]) => key !== 'email'),
            ) as UserUpdateInput;

            const res = await updateUserMutate({
                id,
                data: updatePayload,
            });
            const result = res.data?.updateUser;
            if (isDefined(result) && result.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (isDefined(result) && isDefined(result.errors)) {
                setError(result.errors);
                alert.show(result.errors[0]?.messages, { variant: 'danger' });
            }
        } else {
            const createPayload = removeNull(mutationData) as unknown as UserCreateInput;
            const res = await createUserMutate({
                data: createPayload,
            });
            const result = res.data?.createUser;
            if (isDefined(result) && result.ok) {
                navigate(redirectPath);
                alert.show(alertMessage, { variant: 'success' });
            } else if (isDefined(result) && isDefined(result.errors)) {
                setError(result.errors);
                alert.show(result.errors[0]?.messages, { variant: 'danger' });
            }
        }
    }, [alert, updateUserMutate, id, navigate, setError, createUserMutate]);

    const handleFormSubmit = useCallback(
        () => createSubmitHandler(
            validate,
            setError,
            handleMutation,
        )(),
        [validate, setError, handleMutation],
    );

    const handleCancel = useCallback(() => {
        navigate('users');
    }, [navigate]);

    const error = getErrorObject(formError);

    useEffect(() => {
        if (isNotDefined(data?.user)) {
            return;
        }
        const { regionId, ...otherValues } = removeNull(data.user);
        setValue({
            ...otherValues,
            region: regionId ?? undefined,
        });
    }, [data, setValue]);

    if (userDetailFetch || createPending || updatePending) {
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
            heading={isDefined(id) ? 'Edit User' : 'Create New User'}
            headerDescription={isDefined(id) ? 'Update user information' : 'Create a new user account for accessing the system'}
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
                <InputSection
                    title="Name"
                    description="Enter the title name of the user"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="fullName"
                        value={value.fullName}
                        onChange={setFieldValue}
                        error={error?.fullName}
                        disabled={pending}
                    />
                </InputSection>
                <InputSection
                    title="Email"
                    description="Enter the email of the user"
                    withAsteriskOnTitle
                >
                    <TextInput
                        name="email"
                        value={value.email}
                        onChange={setFieldValue}
                        error={error?.email}
                        disabled={isDefined(id) || pending}
                    />
                </InputSection>
                {isNotDefined(id) && (
                    <InputSection
                        title="Password"
                        description="Set the password for the user"
                        withAsteriskOnTitle
                    >
                        <TextInput
                            name="password"
                            type="password"
                            value={value.password}
                            onChange={setFieldValue}
                            error={error?.password}
                            disabled={pending}
                        />
                    </InputSection>
                )}
                <InputSection
                    title="Role"
                    description="Choose the user's role to define permissions."
                >
                    <SelectInput
                        name="role"
                        value={value.role}
                        onChange={setFieldValue}
                        options={roleOptions}
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        error={error?.role}
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
                    title="Status"
                    description="Select the status for the user"
                >
                    <RadioInput
                        name="isActive"
                        value={value.isActive}
                        onChange={setFieldValue}
                        options={statusOptions}
                        keySelector={valueSelector}
                        labelSelector={labelSelector}
                        error={error?.isActive}
                        disabled={pending}
                    />
                </InputSection>
            </ListView>
        </Container>
    );
}

export default UserForm;
