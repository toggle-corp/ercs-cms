import {
    use,
    useEffect,
} from 'react';
import { Outlet } from 'react-router';
import { isDefined } from '@togglecorp/fujs';
import { gql } from 'urql';

import PreloadMessage from '#components/PreloadMessage';
import { api } from '#config';
import UserContext from '#contexts/UserContext';
import { useMeQuery } from '#generated/types/graphql';

import styles from './styles.module.css';

const fetchHealth = fetch(`${api}/health-check/?format=json`, {
    method: 'GET',
    credentials: 'include',
})
    .then((res) => res.json());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ME_QUERY = gql`
    query Me {
        me {
            role
            regionId
            mfaEnabled
            isActive
            id
            fullName
            email
            createdAt
        }
    }
`;

function RootLayout() {
    use(fetchHealth);
    const { setUser } = use(UserContext);
    const [{ fetching, data }] = useMeQuery();

    useEffect(() => {
        if (fetching) {
            return;
        }
        if (isDefined(data?.me)) {
            setUser(data.me);
        }
    }, [fetching, data, setUser]);

    if (fetching) {
        return (
            <PreloadMessage>
                Checking user session..
            </PreloadMessage>
        );
    }

    return (
        <div className={styles.root}>
            <Outlet />
        </div>
    );
}

export default RootLayout;
