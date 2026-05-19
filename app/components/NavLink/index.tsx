import {
    NavLink as RouterNavLink,
    type NavLinkProps,
    useNavigate,
} from 'react-router';
import {
    ButtonLayout,
    type ButtonLayoutProps,
} from '@ifrc-go/ui';
import { _cs } from '@togglecorp/fujs';

import type { RouteKeys } from '#root/config/routes';
import useRouteMatching, { type Attrs } from '#root/hooks/useRouteMatching';

import styles from './styles.module.css';

export type Props = Omit<NavLinkProps, 'to'> & ButtonLayoutProps & {
    to: RouteKeys;
    navigateTo?: RouteKeys;
    attrs?: Attrs;
    activeClassName?: string;
};

function NavLink(props: Props) {
    const {
        to,
        navigateTo,
        attrs,
        className,
        before,
        children,
        after,
        childrenContainerClassName,
        colorVariant = 'text',
        styleVariant = 'action',
        withoutPadding,
        spacing,
        activeClassName,
        onClick,
        ...otherProps
    } = props;
    const navigate = useNavigate();
    const routeData = useRouteMatching(to, attrs);
    const navigateRouteData = useRouteMatching(navigateTo ?? to, attrs);

    if (!routeData || !navigateRouteData) return null;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (navigateTo) {
            e.preventDefault();
            navigate(navigateRouteData.to);
        }
        onClick?.(e);
    };

    return (
        <RouterNavLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            to={routeData.to}
            onClick={handleClick}
            className={({ isActive }) => _cs(
                styles.smartNavLink,
                isActive && styles.active,
                isActive && activeClassName,
            )}
        >
            <ButtonLayout
                className={_cs(
                    styles.buttonLayout,
                    className,
                )}
                before={before}
                after={after}
                childrenContainerClassName={childrenContainerClassName}
                spacing={spacing}
                colorVariant={colorVariant}
                styleVariant={styleVariant}
                withoutPadding={withoutPadding}
            >
                {children}
            </ButtonLayout>
        </RouterNavLink>
    );
}

export default NavLink;
