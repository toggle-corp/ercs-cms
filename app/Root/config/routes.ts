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

const teams: RouteConfig = {
    index: true,
    path: '/teams',
    load: () => import('#views/Teams/TeamsList'),
    visibility: 'is-authenticated',
};

const createTeam: RouteConfig = {
    index: true,
    path: '/teams/new',
    load: () => import('#views/Teams/TeamForm'),
    visibility: 'is-authenticated',
};

const editTeam: RouteConfig = {
    index: true,
    path: '/teams/:id/edit',
    load: () => import('#views/Teams/TeamForm'),
    visibility: 'is-authenticated',
};

const users: RouteConfig = {
    index: true,
    path: '/users',
    load: () => import('#views/Users/UsersList'),
    visibility: 'is-authenticated',
};

const createUser: RouteConfig = {
    path: '/users/new',
    load: () => import('#views/Users/UserForm'),
    visibility: 'is-authenticated',
};

const editUser: RouteConfig = {
    path: '/users/:id/edit',
    load: () => import('#views/Users/UserForm'),
    visibility: 'is-authenticated',
};

const ourWorks: RouteConfig = {
    index: true,
    path: '/our-works',
    load: () => import('#views/OurWorks'),
    visibility: 'is-authenticated',
};
const preparedness: RouteConfig = {
    index: true,
    path: '/preparedness',
    load: () => import('#views/Preparedness'),
    visibility: 'is-authenticated',
};
const dataAndReports: RouteConfig = {
    index: true,
    path: '/data-and-reports',
    load: () => import('#views/DataAndReports'),
    visibility: 'is-authenticated',
};

const documents: RouteConfig = {
    index: true,
    path: '/documents',
    load: () => import('#views/Documents'),
    visibility: 'is-authenticated',
};
const onlineInteractive: RouteConfig = {
    index: true,
    path: '/online-interactive',
    load: () => import('#views/OnlineInteractive'),
    visibility: 'is-authenticated',
};
const galleries: RouteConfig = {
    index: true,
    path: '/galleries',
    load: () => import('#views/Galleries'),
    visibility: 'is-authenticated',
};

const routes = {
    home,
    login,
    teams,
    createTeam,
    editTeam,
    users,
    createUser,
    editUser,
    ourWorks,
    preparedness,
    dataAndReports,
    documents,
    onlineInteractive,
    galleries,
} satisfies Record<string, RouteConfig>;

export type RouteKeys = keyof typeof routes;

export default routes;
