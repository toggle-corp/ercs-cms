type Visibility = 'is-authenticated' | 'is-not-authenticated' | 'is-anything';

export interface RouteConfig {
    index?: boolean;
    path?: string;
    load: () => Promise<{ default: () => React.JSX.Element | null }>;
    visibility: Visibility;
    children?: RouteConfig[];
}

const home: RouteConfig = {
    index: true,
    path: '/',
    load: () => import('#views/Home'),
    visibility: 'is-authenticated',
};

const login: RouteConfig = {
    index: true,
    path: '/login',
    load: () => import('#views/Login'),
    visibility: 'is-not-authenticated',
};

function child(route: RouteConfig, path: string): RouteConfig {
    const found = route.children?.find((c) => c.path === path);
    if (!found) throw new Error(`Child route "${path}" not found in "${route.path}"`);
    return {
        ...found,
        path: `${route.path}/${path}`,
    };
}

const routes = {
    home,
    login,

} satisfies Record<string, RouteConfig>;

export type RouteKeys = keyof typeof routes;

export default routes;
