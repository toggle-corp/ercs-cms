import {
    createBrowserRouter,
    type RouteObject,
    RouterProvider,
} from 'react-router';

import type { RouteConfig } from '#root/config/routes.ts';
import routes from '#root/config/routes.ts';
import PageError from '#views/PageError/index.tsx';

const privateRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-authenticated',
);

const publicRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-anything',
);

const guestRoutes = Object.values(routes).filter(
    ({ visibility }) => visibility === 'is-not-authenticated',
);

function mapRoute(routeConfig: RouteConfig): RouteObject {
    // Only truly index routes: no path, index: true
    if (routeConfig.index && !routeConfig.path) {
        return {
            index: true,
            lazy: async () => {
                const { default: Component } = await routeConfig.load();
                return { Component };
            },
        };
    }

    return {
        path: routeConfig.path,
        lazy: async () => {
            const { default: Component } = await routeConfig.load();
            return { Component };
        },
        children: routeConfig.children?.map(mapRoute),
    };
}

const router = createBrowserRouter([
    {
        errorElement: <PageError />,
        lazy: async () => {
            const { default: Component } = await import('./Root/index.tsx');
            return { Component };
        },
        children: [
            {
                lazy: async () => {
                    const { default: Component } = await import('./views/RootLayout/index.tsx');
                    return { Component };
                },
                children: [
                    {
                        lazy: async () => {
                            const { default: Component } = await import('./views/GuestLayout/index.tsx');
                            return { Component };
                        },
                        children: guestRoutes.map(mapRoute),
                    },
                    {
                        lazy: async () => {
                            const { default: Component } = await import('./views/PrivateLayout/index.tsx');
                            return { Component };
                        },
                        children: privateRoutes.map(mapRoute),
                    },
                    {
                        lazy: async () => {
                            const { default: Component } = await import('./views/PublicLayout/index.tsx');
                            return { Component };
                        },
                        children: publicRoutes.map(mapRoute),
                    },
                ],
            },
        ],
    // FIXME: add error element
    // errorElement:
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;
