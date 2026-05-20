import { use } from 'react';
import {
    Navigate,
    Outlet,
} from 'react-router';
import {
    ArtboardLineIcon,
    DashboardLineIcon,
    DocumentPdfLineIcon,
    FocusTwoLineIcon,
    ImStrategyIcon,
    LeadershipIcon,
    ScreenshotTwoFillIcon,
    ShieldFlashLineIcon,
    ShieldStarLineIcon,
} from '@ifrc-go/icons';

import Navbar from '#components/Navbar';
import Navigation, { type NavigationItem } from '#components/Navigation';
import Page from '#components/Page';
import UserContext from '#contexts/UserContext';

function PrivateLayout() {
    const { authenticated } = use(UserContext);
    if (!authenticated) {
        return <Navigate to="/login" />;
    }

    const navigationItem : NavigationItem[] = [
        {
            groupTitle: 'User Management',
            routes: [
                {
                    title: 'Users',
                    to: 'users',
                    icon: <LeadershipIcon />,
                },
                {
                    title: 'Teams',
                    to: 'teams',
                    icon: <ShieldStarLineIcon />,
                },
            ],
        },
        {
            groupTitle: 'Content Management',
            routes: [
                {
                    title: 'Home',
                    to: 'home',
                    icon: <DashboardLineIcon />,
                },
                {
                    title: 'Our Works',
                    to: 'ourWorks',
                    icon: <ShieldFlashLineIcon />,
                },
                {
                    title: 'Preparedness',
                    to: 'preparedness',
                    icon: <FocusTwoLineIcon />,
                },
                {
                    title: 'Data and Reports',
                    to: 'dataAndReports',
                    icon: <ArtboardLineIcon />,
                },
                {
                    title: 'Galleries',
                    to: 'galleries',
                    icon: <ScreenshotTwoFillIcon />,
                },
                {
                    title: 'Documents',
                    to: 'documents',
                    icon: <DocumentPdfLineIcon />,
                },
                {
                    title: 'Online Interactive',
                    to: 'onlineInteractive',
                    icon: <ImStrategyIcon />,
                },
            ],
        },
    ];

    return (
        <>
            <Navbar />
            <Page
                leftPaneContent={(
                    <Navigation
                        navigationItem={navigationItem}
                    />
                )}
            >
                <Outlet />
            </Page>
        </>
    );
}

export default PrivateLayout;
