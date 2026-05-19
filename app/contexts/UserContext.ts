import { createContext } from 'react';

import type { MeQuery } from '#generated/types/graphql';

export interface UserContextInterface {
    user: MeQuery['me'] | undefined;
    setUser: React.Dispatch<React.SetStateAction<MeQuery['me'] | undefined>>;
    authenticated: boolean,
}

const UserContext = createContext<UserContextInterface>({
    authenticated: false,
    user: undefined,
    setUser: (value: unknown) => {
        // eslint-disable-next-line no-console
        console.error('setUser called on UserContext without a provider', value);
    },
});

export default UserContext;
