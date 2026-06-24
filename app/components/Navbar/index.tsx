import {
    use,
    useCallback,
} from 'react';
import {
    Button,
    DropdownMenu,
    Heading,
    Image,
    InlineLayout,
    ListView,
} from '@ifrc-go/ui';
import { gql } from 'urql';

import Link from '#components/Link';
import UserContext from '#contexts/UserContext';
import { useLogoutMutation } from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';
import useRouting from '#hooks/useRouting';
import Logo from '#resources/image/logo.png';

import styles from './styles.module.css';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGOUT = gql`
    mutation Logout {
        logout
    }
`;

function Navbar() {
    const { user, setUser } = use(UserContext);
    const alert = useAlert();
    const navigate = useRouting();

    const [{ fetching: pendingLogout }, triggerLogout] = useLogoutMutation();

    const handleLogout = useCallback(async () => {
        const res = await triggerLogout({});
        const logoutResponse = res.data?.logout;
        if (logoutResponse) {
            setUser(undefined);
            navigate('login');
            alert.show('Logout Successful', { variant: 'success' });
        }
    }, [navigate, triggerLogout, setUser, alert]);

    return (
        <nav className={styles.navbar}>
            <InlineLayout
                withPadding
                withAdditionalInlinePadding
                spacingOffset={1}
                before={(
                    <ListView
                        withSpaceBetweenContents
                    >
                        <Link
                            to="home"
                        >
                            <ListView spacing="sm">
                                <Image
                                    src={Logo}
                                    className={styles.icon}
                                    withoutBackground
                                />
                                <Heading
                                    level={4}
                                >
                                    ERCS EOC
                                </Heading>
                            </ListView>
                        </Link>
                    </ListView>
                )}
                after={(
                    <DropdownMenu
                        labelStyleVariant="action"
                        labelColorVariant="secondary"
                        label={(
                            <Heading level={6}>
                                {user?.fullName}
                            </Heading>
                        )}
                    >
                        <Button
                            name="logout"
                            styleVariant="transparent"
                            onClick={handleLogout}
                            disabled={pendingLogout}
                            withFullWidth
                        >
                            {pendingLogout ? 'Logging out' : 'Logout'}
                        </Button>
                    </DropdownMenu>
                )}
            />
        </nav>
    );
}

export default Navbar;
