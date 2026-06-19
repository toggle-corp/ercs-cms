import {
    use,
    useCallback,
    useMemo,
} from 'react';
import {
    BlockLoading,
    Button,
    Container,
    Description,
    Heading,
    Image,
    InlineLayout,
    ListView,
    PasswordInput,
    TextInput,
} from '@ifrc-go/ui';
import {
    createSubmitHandler,
    getErrorObject,
    type ObjectSchema,
    removeNull,
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';
import { gql } from 'urql';

import UserContext from '#contexts/UserContext';
import { useLoginMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import BackGroundImage from '#resources/image/loginbackground.jpg';
import Logo from '#resources/image/logo.png';
import { errorMessage } from '#utils/common';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGIN_MUTATION = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            email
            fullName
            id
            createdAt
            isActive
            mfaEnabled
            role
        }
    }
`;

interface FormFields {
    email?: string;
    password?: string;
}
type FormSchema = ObjectSchema<FormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const defaultFormValue: FormFields = {
};

const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        email: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
        password: {
            required: true,
            requiredValidation: requiredStringCondition,
        },
    }),
};

function Login() {
    const { setUser } = use(UserContext);
    const navigate = useRouting();
    const alert = useAlert();

    const {
        value,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const error = getErrorObject(formError);

    const [{ fetching: loginPending }, triggerLogin] = useLoginMutation();

    const handleMutation = useCallback(async (mutationData: FormFields) => {
        try {
            const { data, error: apiError } = await triggerLogin({
                email: mutationData.email ?? '',
                password: mutationData.password ?? '',
            });

            if (apiError) {
                alert.show('Incorrect username/password', {
                    variant: 'danger',
                });
                return;
            }

            const loginResponse = data?.login;

            if (!loginResponse) {
                alert.show(errorMessage, {
                    variant: 'danger',
                });
                return;
            }

            setUser(removeNull(loginResponse));

            alert.show('Login successful!', { variant: 'success' });
            navigate('home');
        } catch {
            alert.show(errorMessage, {
                variant: 'danger',
            });
        }
    }, [alert, navigate, setUser, triggerLogin]);

    const handleFormSubmit = useMemo(() => createSubmitHandler(
        validate,
        setError,
        handleMutation,
    ), [validate, setError, handleMutation]);

    if (loginPending) {
        return (
            <BlockLoading
                withoutBorder
                compact
                message="Loading"
            />
        );
    }

    return (
        <ListView
            layout="grid"
            className={styles.pageContainer}
            numPreferredGridColumns={2}
        >
            <Image
                src={BackGroundImage}
                className={styles.image}
            />
            <form>
                <Container
                    spacing="4xl"
                    withCenteredContent
                    withPadding
                    className={styles.container}
                >
                    <InlineLayout
                        contentAlignment="center"
                        contentJustification="center"
                        className={styles.login}
                    >
                        <ListView
                            layout="block"
                            spacing="md"
                        >
                            <ListView>
                                <Image
                                    withoutBackground
                                    src={Logo}
                                    alt="logo"
                                    className={styles.logo}
                                />
                                <ListView
                                    layout="block"
                                    spacing="2xs"
                                >
                                    <Heading>
                                        ERCS EOC
                                    </Heading>
                                    <Description withLightText textSize="sm">
                                        Login with
                                        your ERCS email and password.
                                    </Description>
                                </ListView>
                            </ListView>
                            <ListView
                                layout="block"
                                spacing="lg"
                            >
                                <TextInput
                                    name="email"
                                    label="Email/Username"
                                    value={value.email}
                                    onChange={setFieldValue}
                                    error={error?.email}
                                    withAsterisk
                                    disabled={loginPending}
                                    autoFocus
                                />
                                <PasswordInput
                                    name="password"
                                    label="Password"
                                    value={value.password}
                                    onChange={setFieldValue}
                                    error={error?.password}
                                    disabled={loginPending}
                                    withAsterisk
                                />
                            </ListView>
                            <span className={styles.separator} />
                            <ListView
                                layout="block"
                                withCenteredContents
                            >
                                <Button
                                    name={undefined}
                                    styleVariant="filled"
                                    onClick={handleFormSubmit}
                                    disabled={loginPending}
                                >
                                    Login
                                </Button>
                            </ListView>
                        </ListView>
                    </InlineLayout>
                </Container>
            </form>
        </ListView>
    );
}

export default Login;
