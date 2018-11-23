import React from 'react';

import {storiesOf} from '@storybook/react';
import Authenticated from './Authenticated';
import {Drawer} from '@cimpress/react-components';
import UsersTable from '../src/components/UsersTable';
import {
    withKnobs,
    object,
    boolean,
    number,
    select,
} from '@storybook/addon-knobs/react';

import auth from './auth';

const stories = storiesOf('UsersTable', module);
stories.addDecorator(withKnobs);

let roles = [
    {
        roleName: 'Template Editor',
        roleCaption: 'Editor',
        isManagerRole: true,
    },
    {
        roleName: 'Template Reader',
        roleCaption: 'Reader',
        isManagerRole: false,
    },
];

let langs = ['pol', 'eng', 'bul', 'spa', 'deu', 'fra'];

stories.add('Basic use', () => (
    <Authenticated>
        <UsersTable
            language={select('Language', langs, 'bul')}
            groupUrl={number(
                'GroupURL',
                'https://api.cimpress.io/auth/access-management/v1/groups/5898'
            )}
            allowedRoles={object('Allowed Roles', roles)}
            showAdminsOnly={boolean('Admins only', false)}
            showAdminsOnlyFilter={boolean('Admins filter', false)}
            showAvatar={boolean('Show avatar', true)}
            showEmail={boolean('Show email', true)}
            showEmailAsTooltip={boolean('Show email as tooltip', true)}
            showName={boolean('Show name', true)}
            mutuallyExclusiveRoles={boolean('Mutually Exclusive Roles', false)}
        />
    </Authenticated>
));

stories.add('Mutually exclusive roles', () => (
    <Authenticated>
        <UsersTable
            language={select('Language', langs, 'bul')}
            groupUrl={number(
                'GroupURL',
                'https://api.cimpress.io/auth/access-management/v1/groups/5898'
            )}
            allowedRoles={object('Allowed Roles', roles)}
            showAdminsOnly={boolean('Admins only', false)}
            showAdminsOnlyFilter={boolean('Admins filter', false)}
            showAvatar={boolean('Show avatar', true)}
            showEmail={boolean('Show email', true)}
            showEmailAsTooltip={boolean('Show email as tooltip', true)}
            showName={boolean('Show name', true)}
            mutuallyExclusiveRoles={boolean('Mutually Exclusive Roles', true)}
        />
    </Authenticated>
));

stories.add('Show admins only', () => (
    <Authenticated>
        <UsersTable
            language={select('Language', langs, 'bul')}
            groupUrl={number(
                'GroupURL',
                'https://api.cimpress.io/auth/access-management/v1/groups/5898'
            )}
            allowedRoles={object('Allowed Roles', roles)}
            showAdminsOnly={boolean('Admins only', true)}
            showAdminsOnlyFilter={boolean('Admins filter', true)}
            showAvatar={boolean('Show avatar', true)}
            showEmail={boolean('Show email', true)}
            showEmailAsTooltip={boolean('Show email as tooltip', true)}
            showName={boolean('Show name', true)}
        />
    </Authenticated>
));

stories.add('In a drawer', () => (
    <Authenticated>
        <Drawer
            show={true}
            header="The drawer header"
            footer={<div>The drawer footer</div>}
        >
            <UsersTable
                language={select('Language', langs, 'bul')}
                accessToken={auth.getAccessToken()}
                groupUrl={number(
                    'GroupURL',
                    'https://api.cimpress.io/auth/access-management/v1/groups/5898'
                )}
                allowedRoles={object('Allowed Roles', roles)}
            />
        </Drawer>
    </Authenticated>
));
