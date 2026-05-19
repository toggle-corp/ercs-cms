import { use } from 'react';
import {
    Navigate,
    Outlet,
} from 'react-router';

import Navbar from '#components/Navbar';
import UserContext from '#contexts/UserContext';

function PrivateLayout() {
    const { authenticated } = use(UserContext);
    if (!authenticated) {
        return <Navigate to="/login" />;
    }
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
}

export default PrivateLayout;
