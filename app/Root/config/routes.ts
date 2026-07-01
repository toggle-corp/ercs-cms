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
    load: () => import('#views/Teams/index'),
    visibility: 'is-authenticated',
};

const createTeam: RouteConfig = {
    path: '/teams/new',
    load: () => import('#views/Teams/TeamForm'),
    visibility: 'is-authenticated',
};

const editTeam: RouteConfig = {
    path: '/teams/:id/edit',
    load: () => import('#views/Teams/TeamForm'),
    visibility: 'is-authenticated',
};

const teamMembers: RouteConfig = {
    path: '/teams/:id/team-members/',
    load: () => import('#views/Teams/TeamMembers'),
    visibility: 'is-authenticated',
};

const createTeamMember: RouteConfig = {
    path: '/teams/:id/team-members/new',
    load: () => import('#views/Teams/TeamMembers/TeamMemberForm'),
    visibility: 'is-authenticated',
};

const editTeamMember: RouteConfig = {
    path: '/teams/:id/team-members/:member/edit',
    load: () => import('#views/Teams/TeamMembers/TeamMemberForm'),
    visibility: 'is-authenticated',
};

const users: RouteConfig = {
    index: true,
    path: '/users',
    load: () => import('#views/Users'),
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

const createWorks: RouteConfig = {
    path: '/our-works/new',
    load: () => import('#views/OurWorks/WorksForm'),
    visibility: 'is-authenticated',
};

const editWorks: RouteConfig = {
    path: '/our-works/:id/edit',
    load: () => import('#views/OurWorks/WorksForm'),
    visibility: 'is-authenticated',
};

const preparedness: RouteConfig = {
    index: true,
    path: '/preparedness',
    load: () => import('#views/Preparedness'),
    visibility: 'is-authenticated',
};

const createPreparedness: RouteConfig = {
    path: '/preparedness/new',
    load: () => import('#views/Preparedness/PreparednessForm'),
    visibility: 'is-authenticated',
};

const editPreparedness: RouteConfig = {
    path: '/preparedness/:id/edit',
    load: () => import('#views/Preparedness/PreparednessForm'),
    visibility: 'is-authenticated',
};

const dataAndReports: RouteConfig = {
    index: true,
    path: '/data-and-reports',
    load: () => import('#views/DataAndReports'),
    visibility: 'is-authenticated',
};

const createDataAndReports: RouteConfig = {
    path: '/data-and-reports/new',
    load: () => import('#views/DataAndReports/DataAndReportsForm'),
    visibility: 'is-authenticated',
};

const editDataAndReports: RouteConfig = {
    path: '/data-and-reports/:id/edit',
    load: () => import('#views/DataAndReports/DataAndReportsForm'),
    visibility: 'is-authenticated',
};

const capacityAndResources: RouteConfig = {
    index: true,
    path: '/capacity-and-resources',
    load: () => import('#views/CapacityAndResources'),
    visibility: 'is-authenticated',
};

const createResources: RouteConfig = {
    path: '/capacity-and-resources/new',
    load: () => import('#views/CapacityAndResources/CapacityAndResourcesForm'),
    visibility: 'is-authenticated',
};

const editResources: RouteConfig = {
    path: '/capacity-and-resources/:id/edit',
    load: () => import('#views/CapacityAndResources/CapacityAndResourcesForm'),
    visibility: 'is-authenticated',
};

const resourceDashboards: RouteConfig = {
    path: '/capacity-and-resources/:id/dashboards',
    load: () => import('#views/CapacityAndResources/ResourceDashboards'),
    visibility: 'is-authenticated',
};

const createResourceDashboard: RouteConfig = {
    path: '/capacity-and-resources/:id/dashboards/create',
    load: () => import('#views/CapacityAndResources/ResourceDashboards/ResourceDashboardForm'),
    visibility: 'is-authenticated',
};

const editResourceDashboard: RouteConfig = {
    path: '/capacity-and-resources/:id/dashboards/:dashboard/edit',
    load: () => import('#views/CapacityAndResources/ResourceDashboards/ResourceDashboardForm'),
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
    teamMembers,
    createTeamMember,
    users,
    createUser,
    editUser,
    ourWorks,
    createWorks,
    editWorks,
    preparedness,
    createPreparedness,
    editPreparedness,
    dataAndReports,
    createDataAndReports,
    editDataAndReports,
    capacityAndResources,
    createResources,
    editResources,
    resourceDashboards,
    createResourceDashboard,
    editResourceDashboard,
    documents,
    onlineInteractive,
    galleries,
    editTeamMember,
} satisfies Record<string, RouteConfig>;

export type RouteKeys = keyof typeof routes;

export default routes;
