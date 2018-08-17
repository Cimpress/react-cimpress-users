import React from 'react';

import {storiesOf} from '@storybook/react';
import Authenticated from './Authenticated';
import {Drawer} from '@cimpress/react-components';
import UsersTable from '../src/components/UsersTable';
import {withKnobs, object, boolean, number} from '@storybook/addon-knobs/react';

import auth from './auth';

const stories = storiesOf('UsersTable', module);
stories.addDecorator(withKnobs);

let roles = [{
    roleName: 'Template Editor',
    roleCaption: 'Editor',
    isManagerRole: true,
}, {
    roleName: 'Template Reader',
    roleCaption: 'Reader',
    isManagerRole: false,
}];

stories.add('Basic use', () => <Authenticated><UsersTable
    groupId={number('Group ID', 5223)}
    allowedRoles={object('Allowed Roles', roles)}
    showAdminsOnly={boolean('Admins only', false)}
    showGroupInfo={boolean('Group Info', false)}
    mutuallyExclusiveRoles={boolean('Mutually Exclusive Roles', false)}
/></Authenticated>);

stories.add('Mutually exclusive roles', () => <Authenticated><UsersTable
    groupId={number('Group ID', 5223)}
    allowedRoles={object('Allowed Roles', roles)}
    showAdminsOnly={boolean('Admins only', false)}
    showGroupInfo={boolean('Group Info', false)}
    mutuallyExclusiveRoles={boolean('Mutually Exclusive Roles', true)}
/></Authenticated>);

stories.add('Show admins only', () => <Authenticated><UsersTable
    groupId={number('Group ID', 5223)}
    allowedRoles={object('Allowed Roles', roles)}
    showAdminsOnly={boolean('Admins only', true)}
    showGroupInfo={boolean('Group Info', false)}
/></Authenticated>);

stories.add('With group info', () => <Authenticated><UsersTable
    groupId={number('Group ID', 5223)}
    allowedRoles={object('Allowed Roles', roles)}
    showAdminsOnly={boolean('Admins only', false)}
    showGroupInfo={boolean('Group Info', true)}
/></Authenticated>);

stories.add('In a drawer', () => <Authenticated>
    <Drawer
        show={true}
        header="The drawer header"
        footer={<div>The drawer footer</div>}>
        <UsersTable
            accessToken={auth.getAccessToken()}
            groupId={number('Group ID', 5223)}
            allowedRoles={object('Allowed Roles', roles)}
        />
    </Drawer></Authenticated>);
