import { useMemo } from 'react';
import {
    Link as RouterLink,
    matchPath,
    useLocation,
} from 'react-router';
import {
    BlockView,
    Breadcrumbs as BaseBreadcrumbs,
} from '@ifrc-go/ui';
import { isDefined } from '@togglecorp/fujs';

import routes from '#root/config/routes';

const routePaths = Object.values(routes)
    .map((route) => route.path)
    .filter(isDefined);

const staticSegments = new Set(
    routePaths
        .flatMap((path) => path.split('/'))
        .filter((segment) => segment !== '' && !segment.startsWith(':')),
);

function getLabel(segment: string) {
    return segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

interface Crumb {
    label: string;
    to: string | undefined;
}

export interface Props {
    className?: string;
}

function Breadcrumbs(props: Props) {
    const { className } = props;

    const { pathname } = useLocation();

    const crumbs = useMemo(
        () => {
            const segments = pathname.split('/').filter(Boolean);

            return segments.reduce<Crumb[]>(
                (acc, segment, index) => {
                    if (!staticSegments.has(segment)) {
                        return acc;
                    }

                    const to = `/${segments.slice(0, index + 1).join('/')}`;
                    const isRoute = routePaths.some((path) => matchPath(path, to));

                    acc.push({
                        label: getLabel(segment),
                        to: isRoute ? to : undefined,
                    });

                    return acc;
                },
                [{ label: 'Home', to: '/' }],
            );
        },
        [pathname],
    );

    if (crumbs.length <= 1) {
        return null;
    }

    return (
        <BlockView withPadding>
            <BaseBreadcrumbs className={className}>
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;

                    if (isLast || !isDefined(crumb.to)) {
                        return (
                            <span key={crumb.label}>
                                {crumb.label}
                            </span>
                        );
                    }

                    return (
                        <RouterLink
                            key={crumb.label}
                            to={crumb.to}
                        >
                            {crumb.label}
                        </RouterLink>
                    );
                })}
            </BaseBreadcrumbs>
        </BlockView>
    );
}

export default Breadcrumbs;
