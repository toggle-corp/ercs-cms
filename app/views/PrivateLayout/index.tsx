import {
    use,
    useCallback,
    useState,
} from 'react';
import {
    Navigate,
    Outlet,
} from 'react-router';
import {
    ArtboardLineIcon,
    DashboardLineIcon,
    DocumentPdfLineIcon,
    DrefTwoIcon,
    FocusTwoLineIcon,
    ImStrategyIcon,
    LeadershipIcon,
    LinkLineIcon,
    ScreenshotTwoFillIcon,
    ShareBoxLineIcon,
    ShieldStarLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import Breadcrumbs from '#components/Breadcrumbs';
import Navbar from '#components/Navbar';
import Navigation, { type NavigationItem } from '#components/Navigation';
import Page from '#components/Page';
import UserContext from '#contexts/UserContext';

import styles from './styles.module.css';

function PrivateLayout() {
    const { authenticated } = use(UserContext);
    const [navShown, setNavShown] = useState(false);

    const handleMenuButtonClick = useCallback(() => {
        setNavShown((oldValue) => !oldValue);
    }, []);

    const handleNavigate = useCallback(() => {
        setNavShown(false);
    }, []);

    if (!authenticated) {
        return <Navigate to="/login" />;
    }

    const navigationItem: NavigationItem[] = [
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
                    icon: <ShareBoxLineIcon />,
                },
                {
                    title: 'Preparedness',
                    to: 'preparedness',
                    icon: <ShieldStarLineIcon />,
                },
                {
                    title: 'Data and Reports',
                    to: 'dataAndReports',
                    icon: <FocusTwoLineIcon />,
                },
                {
                    title: 'PMER',
                    to: 'pmer',
                    icon: <DrefTwoIcon />,
                },
                {
                    title: 'Capacity and Resources',
                    to: 'capacityAndResources',
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
                {
                    title: 'Links',
                    to: 'links',
                    icon: <LinkLineIcon />,
                },
            ],
        },
    ];

    return (
        <>
            <Navbar
                menuShown={navShown}
                onMenuButtonClick={handleMenuButtonClick}
            />
            <Page
                leftPaneContent={(
                    <Navigation
                        navigationItem={navigationItem}
                        onNavigate={handleNavigate}
                    />
                )}
                leftPaneContainerClassName={_cs(
                    styles.navContainer,
                    navShown && styles.navShown,
                )}
            >
                <Breadcrumbs />
                <Outlet />
            </Page>
        </>
    );
}

export default PrivateLayout;
