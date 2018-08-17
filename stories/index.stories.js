import React from 'react';

import {storiesOf} from '@storybook/react';
import Authenticated from './Authenticated';
import {Drawer} from '@cimpress/react-components';
import UsersTable from '../src/components/UsersTable';

import auth from './auth'

let roles = [{
    roleName: 'Template Editor',
    roleCaption: 'Editor',
    isManagerRole: true,
}, {
    roleName: 'Template Reader',
    roleCaption: 'Reader',
    isManagerRole: false,
}];

storiesOf('UsersTable', module)
    .add('Basic use', () => <Authenticated><UsersTable
        groupId={5363}
        allowedRoles={roles}
        showAdminsOnly={false}
    /></Authenticated>)

    .add('Show admins only', () => <Authenticated><UsersTable
        groupId={5363}
        allowedRoles={roles}
        showAdminsOnly={true}
    /></Authenticated>)

    .add('With group info', () => <Authenticated><UsersTable
        groupId={5363}
        allowedRoles={roles}
        showAdminsOnly={false}
        showGroupInfo
    /></Authenticated>)

    .add('In a drawer', () => <Authenticated>
        <Drawer
            show={true}
            header="The drawer header"
            footer={<div>The drawer footer</div>}>
            <UsersTable
                accessToken={auth.getAccessToken()}
                groupId={5363}
                allowedRoles={roles}
            />
        </Drawer></Authenticated>);
