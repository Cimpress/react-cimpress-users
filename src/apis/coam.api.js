import axios from 'axios';

const defaultRequestData = (accessToken, additionalRequest) => {
    return Object.assign({}, {
        baseURL: `https://api.cimpress.io/auth/access-management`,
        timeout: 3000,
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Cache-control': 'no-cache, no-store, must-revalidate',
        },
    }, additionalRequest);
};

const exec = (data) => {
    return axios
        .request(data)
        .then((response) => {
            return response.data;
        })
        .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            throw err;
        });
};

const getGroupInfo = (accessToken, groupId) => {
    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}?canonicalize=true&${Math.random() * 1000000}`,
        method: 'GET',
    });

    return exec(data);
};


const setAdminFlag = (accessToken, groupId, principal, isAdmin) => {
    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members/${encodeURIComponent(principal)}`,
        method: 'PATCH',
        data: {
            'is_admin': isAdmin,
        },
    });

    return exec(data);
};

const removeUserRole = (accessToken, groupId, principal, role) => {
    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members/${encodeURIComponent(principal)}/roles`,
        method: 'PATCH',
        data: {
            'remove': [role],
        },
    });

    return exec(data);
};

const addUserRole = (accessToken, groupId, principal, role) => {
    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members/${encodeURIComponent(principal)}/roles`,
        method: 'PATCH',
        data: {
            'add': [role],
        },
    });

    return exec(data);
};

const patchUserRoles = (accessToken, groupId, principal, rolesChanges) => {
    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members/${encodeURIComponent(principal)}/roles`,
        method: 'PATCH',
        data: rolesChanges,
    });

    return exec(data);
};

const addGroupMember = (accessToken, groupId, principal, isAdmin) => {
    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members`,
        method: 'PATCH',
        data: {
            'add': [{
                is_admin: !!isAdmin,
                principal: principal,
            }],
        },
    });

    return exec(data);
};

const deleteGroupMember = (accessToken, groupId, principal) => {
    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members`,
        method: 'PATCH',
        data: {
            'remove': [principal],
        },
    });

    return exec(data);
};

const getRoles = (accessToken) => {
    let data = defaultRequestData(accessToken, {
        url: `/v1/roles`,
        method: 'GET',
    });

    return exec(data);
};

const searchPrincipals = (accessToken, query) => {
    if (!query || query.length == 0) {
        return Promise.resolve([]);
    }

    let data = defaultRequestData(accessToken, {
        url: '/v1/search/canonicalPrincipals/bySubstring',
        method: 'GET',
        params: {
            q: query,
            canonicalize: true,
            m: Math.random() * 1000000,
        },
    });

    // [{user_id / name / email}]
    return exec(data).then((p) => p.canonical_principals);
};

export {
    getGroupInfo,
    setAdminFlag,
    patchUserRoles,
    addUserRole,
    removeUserRole,
    getRoles,
    searchPrincipals,
    //
    addGroupMember,
    deleteGroupMember,
};
