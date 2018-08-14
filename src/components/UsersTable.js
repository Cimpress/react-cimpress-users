import React from 'react';
import PropTypes from 'prop-types';
import merge from 'deepmerge';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {
    getGroupInfo,
    patchUserRoles,
    addGroupMember,
    deleteGroupMember,
} from '../apis/coam.api';

import {TabCard, Checkbox, Icon, colors} from '@cimpress/react-components';

import '../styles/UsersTable.css';
import UserRow from './UserRow';
import CoamGroupInfo from './GroupInfo';
import Loading from './common/Loading';
import ErrorInfo from './common/ErrorInfo';
import UserRolesModal from './EditUserRolesModal';
import NewUsersTable from './AddNewUserForm';

const atob = require('atob');

function getSubFromJWT(jwt) {
    try {
        return JSON.parse(atob(jwt.split('.')[1])).sub;
    } catch (e) {
        return null;
    }
}

class UsersTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAdmins: this.props.showAdminsOnly,
            editUserRolesModalOpen: false,
            editUser: undefined,
        };
    }

    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    executeRequest(promise, caption, stateVar) {
        this.setState({
            isExecutingRequest: true,
            executingRequestCaption: caption,
        });

        return promise
            .then((response) => {
                let state = {isExecutingRequest: false};
                if (stateVar) {
                    state[stateVar] = response;
                }
                this.setState(state);
            })
            .catch((error) => {
                this.setState({
                    isExecutingRequest: false,
                    executingRequestError: error,
                });
            });
    }

    fetchGroupInfo() {
        return this.executeRequest(
            getGroupInfo(this.props.accessToken, this.props.groupId),
            'Loading group information',
            'groupInfo');
    }


    componentDidUpdate(prevProps) {
        if (prevProps.accessToken !== this.props.accessToken && this.props.accessToken) {
            this.currentUserSub = getSubFromJWT(this.props.accessToken);
            this.fetchGroupInfo();
        }
    }

    componentDidMount() {
        if (!this.props.accessToken) {
            return;
        }

        this.fetchGroupInfo();
        this.currentUserSub = getSubFromJWT(this.props.accessToken);
    }

    onDeleteUser(user) {
        let sub = user.principal || user.user_id;
        const newGroupInfo = merge(this.state.groupInfo, {});

        this.executeRequest(
            deleteGroupMember(this.props.accessToken, this.props.groupId, sub)
                .then((newData) => {
                    newGroupInfo.members = newGroupInfo.members.filter((x) => x.principal !== sub);
                    this.setState({groupInfo: newGroupInfo});
                }),
            'Delete user.'
        );
    }

    onAddOrEditUser(user, rolesChanges, isAdmin) {
        let sub = user.principal || user.user_id;
        const newGroupInfo = merge(this.state.groupInfo, {});

        this.executeRequest(
            addGroupMember(this.props.accessToken, this.props.groupId, sub, isAdmin)
                .then((newData) => {
                    const newMember = newData.members.find((nm) => nm.principal === sub);
                    if (!newGroupInfo.members.find((existingUser) => existingUser.principal === sub)) {
                        newGroupInfo.members.push(Object.assign({}, newMember, {profile: user}));
                    }
                    return Promise.resolve();
                })
                .then(() => patchUserRoles(this.props.accessToken, this.props.groupId, sub, rolesChanges))
                .then((newData) => {
                    const newMember = newGroupInfo.members.find((x) => x.principal === sub);
                    newMember.roles = newData.roles;
                    newMember.is_admin = isAdmin;
                    this.setState({groupInfo: newGroupInfo});
                }),
            `Add/edit user ${sub}`
        );
    }

    currentUserIsAdmin() {
        if (!this.state.groupInfo) {
            return false;
        }
        let member = this.state.groupInfo.members.find((x) => x.principal === this.currentUserSub);
        return member && member.is_admin === true;
    }

    render() {
        if (this.state.isExecutingRequest) {
            return <Loading/>;
        }

        if (this.state.executingRequestError) {
            return <ErrorInfo error={this.state.executingRequestError}/>;
        }

        if (!this.props.accessToken || !this.state.groupInfo) {
            return <Loading message={this.tt('initializing')}/>;
        }

        // let totalUsers = ((this.state.groupInfo || {}).members || []).length;
        // let admins = ((this.state.groupInfo || {}).members || []).filter(a => a.is_admin).length;

        let tabs = [{
            name: 'Users',
            block: <div>
                <div className={'row'}>
                    <div className={'col-xs-6'} align="left">
                        <Checkbox
                            style={{marginTop: '0px'}}
                            label={this.tt('view_admins_only')} checked={this.state.showAdmins}
                            onChange={() => this.setState({showAdmins: !this.state.showAdmins})}/>
                    </div>
                    <div className={'col-xs-6'} align="right">
                        <span onClick={() => this.fetchGroupInfo()} className={'rcu-icon'}>
                            <Icon name={'synchronize-3-l'} size={'2x'}
                                color={this.props.readOnly ? colors.platinum : colors.shale}/>
                        </span>
                    </div>
                </div>
                <table className='table table-hover'>
                    <tbody>
                        {this.state.groupInfo.members
                            .sort((a, b) => a.profile.name.localeCompare(b.profile.name))
                            .filter((a) => !this.state.showAdmins || a.is_admin)
                            .map((m, i) => {
                                let canModify = !this.props.readOnly && this.currentUserIsAdmin();
                                return <UserRow key={i}
                                    user={m}
                                    allowedRoles={this.props.allowedRoles}
                                    readOnly={!canModify}
                                    onDeleteUserClick={!canModify ? null : () => this.onDeleteUser(m)}
                                    onEditRolesClick={!canModify ? null : () => this.setState({
                                        editUser: m,
                                        editUserRolesModalOpen: true,
                                    })}
                                />;
                            })}
                    </tbody>
                </table>
            </div>,
            href: '#',
        }];

        if (this.props.showGroupInfo) {
            tabs.push({
                name: this.tt('tab_group_info_caption'),
                block: <CoamGroupInfo groupInfo={this.state.groupInfo}/>,
                href: '#',
            });
        }

        tabs.push({
            name: this.tt('tab_add_user_caption'),
            block: <NewUsersTable
                accessToken={this.props.accessToken}
                allowedRoles={this.props.allowedRoles}
                onCancel={() => {
                    this.setState({});
                }}
                onConfirm={(user, changes, isAdmin) => {
                    this.onAddOrEditUser(user, changes, isAdmin);
                }}/>,
            href: '#',
        });

        return (
            <div className='row'>
                <UserRolesModal
                    open={this.state.editUserRolesModalOpen}
                    onCancel={() => this.setState({editUserRolesModalOpen: false, editUser: undefined})}
                    onConfirm={(changes, isAdmin) => {
                        this.onAddOrEditUser(this.state.editUser, changes, isAdmin);
                        this.setState({
                            editUserRolesModalOpen: false,
                            editUser: undefined,
                        });
                    }}
                    allowedRoles={this.props.allowedRoles}
                    user={this.state.editUser}/>
                <div className='col-sm-12'>
                    <TabCard tabs={tabs} selectedIndex={0}/>
                </div>
            </div>
        );
    }
}

UsersTable.propTypes = {
    // silence eslint
    t: PropTypes.any,
    i18n: PropTypes.any,
    language: PropTypes.string,

    accessToken: PropTypes.string,

    // roles to allow to assign to
    allowedRoles: PropTypes.array.isRequired,

    groupId: PropTypes.number,
    showGroupInfo: PropTypes.bool,

    readOnly: PropTypes.bool,
    showAdminsOnly: PropTypes.bool,
};

UsersTable.defaultProps = {
    language: 'eng',
    readOnly: false,
    showAdminsOnly: false,
    showGroupInfo: false,
};

export default translate('translations', {i18n: getI18nInstance()})(UsersTable);
