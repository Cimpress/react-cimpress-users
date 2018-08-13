import axios from 'axios';

const defaultRequestData = (accessToken, additionalRequest) => {
    return Object.assign({}, {
        baseURL: `https://api.cimpress.io/auth/access-management`,
        timeout: 3000,
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Cache-control': 'no-cache, no-store, must-revalidate'
        }
    }, additionalRequest)
};

const exec = (data) => {
    return axios
        .request(data)
        .then((response) => {
            console.log(response);
            return response.data;
        })
        .catch(err => {
            console.error(err);
            throw err;
            s
        });
};

const getGroupInfo = (accessToken, groupId) => {

    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}`,
        method: 'GET',
    });

    return exec(data);
};


const setAdminFlag = (accessToken, groupId, principal, isAdmin) => {

    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members/${encodeURIComponent(principal)}`,
        method: 'PATCH',
        data: {
            "is_admin": isAdmin
        },
    });

    return exec(data);
};

const removeUserRole = (accessToken, groupId, principal, role) => {

    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members/${encodeURIComponent(principal)}/roles`,
        method: 'PATCH',
        data: {
            "remove": [role]
        },
    });

    return exec(data);
};

const addUserRole = (accessToken, groupId, principal, role) => {

    let data = defaultRequestData(accessToken, {
        url: `/v1/groups/${groupId}/members/${encodeURIComponent(principal)}/roles`,
        method: 'PATCH',
        data: {
            "add": [role]
        },
    });

    return exec(data);
};

const getRoles = (accessToken) => {

    let data = defaultRequestData(accessToken, {
        url: `/v1/roles`,
        method: 'GET'
    });

    return exec(data);
};

const searchPrincipals = (accessToken, query) => {
    if ( !query || query.length == 0 ) {
        return Promise.resolve([]);
    }

    let data = defaultRequestData(accessToken, {
       url: '/v1/principals',
       method: 'GET',
       params: {
           q: query
       }
    });

    // [{user_id / name / email}]
    return exec(data).then(p => p.principals);
};

const principalName = (accessToken, userId) => {
    let url = `${AUTH_SERVICE_URL}/auth/access-management/v1/principals/${userId}`;
    let init = this.getDefaultConfig('GET');

    let data = defaultRequestData(accessToken, {
        url: `/v1/principals/${userId}`,
        method: 'GET'
    });

    // [{user_id / name / email}]
    return exec(data);
};

export {
    getGroupInfo,
    setAdminFlag,
    addUserRole,
    removeUserRole,
    getRoles,
    searchPrincipals,
    principalName
}