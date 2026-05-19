import {
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
    requiredStringCondition,
    useForm,
} from '@togglecorp/toggle-form';

import BackGroundImage from '#resources/image/loginbackground.jpg';
import Logo from '#resources/image/logo.png';

import styles from './styles.module.css';

interface FormFields {
    username?: string;
    password?: string;
}
type FormSchema = ObjectSchema<FormFields>;
type FormSchemaFields = ReturnType<FormSchema['fields']>;

const defaultFormValue: FormFields = {
};

const formSchema: FormSchema = {
    fields: (): FormSchemaFields => ({
        username: {
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
    const {
        value: formValue,
        error: formError,
        setFieldValue,
        setError,
        validate,
    } = useForm(formSchema, { value: defaultFormValue });

    const fieldError = getErrorObject(formError);

    // TODO: Implement actual login logic
    const login = () => {};

    const handleFormSubmit = () => createSubmitHandler(
        validate,
        setError,
        login,
    );

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
            <form onSubmit={handleFormSubmit}>
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
                                    name="username"
                                    label="Email/Username"
                                    value={formValue.username}
                                    onChange={setFieldValue}
                                    error={fieldError?.username}
                                    withAsterisk
                                    autoFocus
                                />
                                <PasswordInput
                                    name="password"
                                    label="Password"
                                    value={formValue.password}
                                    onChange={setFieldValue}
                                    error={fieldError?.password}
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
                                    type="submit"
                                    styleVariant="filled"
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
