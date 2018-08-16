import React from 'react';

import {storiesOf} from '@storybook/react';
import Authenticated from './Authenticated';
import UsersTable from '../src/components/UsersTable';

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
    .add('Basic use', () => <Authenticated>
        <UsersTable
            groupId={5363}
            allowedRoles={roles}
            showAdminsOnly={false}
        />
    </Authenticated>);

storiesOf('UsersTable', module)
    .add('Show admins only', () => <Authenticated>
        <UsersTable
            groupId={5363}
            allowedRoles={roles}
            showAdminsOnly={true}
        />
    </Authenticated>);

storiesOf('UsersTable', module)
    .add('With group info', () => <Authenticated>
        <UsersTable
            groupId={5363}
            allowedRoles={roles}
            showAdminsOnly={false}
            showGroupInfo
        />
    </Authenticated>);
