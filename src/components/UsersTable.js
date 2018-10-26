import React from 'react';
import PropTypes from 'prop-types';
import merge from 'deepmerge';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {
    getGroupInfo,
    patchUserRoles,
    addGroupMember,
    searchPrincipals,
    deleteGroupMember,
    group56,
} from '../apis/coam.api';

import {Tooltip, Checkbox, Icon, colors} from '@cimpress/react-components';

import '../styles/UsersTable.css';
import UserRow from './UserRow';
import Loading from './common/Loading';
import ErrorInfo from './common/ErrorInfo';
import UserForm from './UserForm';

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
            addUserEnabled: true,
            editUserRolesModalOpen: false,
            editUser: undefined,
        };
    }

    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    executeRequest(promise, caption, stateVar, preformatData=undefined) {
        this.setState({
            isExecutingRequest: true,
            executingRequestError: undefined,
            executingRequestCaption: caption,
        });

        return promise
            .then((response) => {
                let state = {
                    isExecutingRequest: false,
                    executingRequestError: undefined,
                };
                if (stateVar) {
                    state[stateVar] = preformatData ? preformatData(response) : response;
                }
                this.setState(state);
            })
            .catch((error) => {
                if (error.response && error.response.status === 403) {
                    this.setState({
                        isExecutingRequest: false,
                        executingRequestError: {
                            message: this.tt('error_not_enough_access_rights'),
                        },
                    });
                } else {
                    this.setState({
                        isExecutingRequest: false,
                        executingRequestError: error,
                    });
                }
            });
    }

    sortMembers(groupInfo) {
        const members = groupInfo.members.sort((a, b) => {
            if (a.profile && b.profile) {
                return a.profile.name.localeCompare(b.profile.name);
            }
            if (a.profile) {
                return -1;
            }
            if (b.profile) {
                return 1;
            }
            return a.principal.localeCompare(b.principal);
        });

        groupInfo.members = members;

        return groupInfo;
    }

    fetchGroupInfo() {
        return Promise.all([
            this.executeRequest(
                getGroupInfo(this.props.accessToken, this.props.groupId),
                this.tt('loading_group_information'),
                'groupInfo', this.sortMembers),
            this.checkIfSearchingForUsersWouldWork(),
            this.checkIfGroup56()]);
    }

    checkIfGroup56() {
        group56(this.props.accessToken, this.currentUserSub)
            .then((g56) => {
                this.setState({g56: g56});
            })
            .catch((e) => {
                this.setState({g56: false});
            });
    }

    checkIfSearchingForUsersWouldWork() {
        searchPrincipals(this.props.accessToken, 'dummy')
            .then(() => {
                this.setState({addUserEnabled: true});
            })
            .catch((e) => {
                if (e.response && e.response.status === 403) {
                    this.setState({addUserEnabled: false});
                }
            });
    }


    componentDidUpdate(prevProps) {
        if ((prevProps.accessToken !== this.props.accessToken && this.props.accessToken) ||
            (prevProps.groupId !== this.props.groupId && this.props.groupId)) {
            this.currentUserSub = getSubFromJWT(this.props.accessToken);
            this.fetchGroupInfo();
        }
        if (prevProps.showAdminsOnly !== this.props.showAdminsOnly) {
            this.setState({
                showAdmins: this.props.showAdminsOnly,
            });
        }
    }

    componentDidMount() {
        if (!this.props.accessToken) {
            return;
        }

        this.currentUserSub = getSubFromJWT(this.props.accessToken);
        this.fetchGroupInfo();
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
            this.tt('deleting_user')
        );
    }

    getMemberBySub(members, sub) {
        let m = members.find((nm) => nm.principal === sub);
        if (!m) {
            members.forEach((nm) => {
                let p = (nm.profiles ||[]).find((a) => a.user_id === sub);
                if (p) {
                    m = nm;
                }
            });
        }
        return m;
    }

    onAddOrEditUser(user, rolesChanges, isAdmin) {
        let sub = user.principal || user.user_id;
        if (!sub) {
            sub = (Array.isArray(user.profiles) && user.profiles.length>0) ? user.profiles[0].user_id : null;
        }
        const newGroupInfo = merge(this.state.groupInfo, {});

        this.executeRequest(
            addGroupMember(this.props.accessToken, this.props.groupId, sub, isAdmin)
                .then((newData) => {
                    const newMember = this.getMemberBySub(newData.members, sub);
                    if (!this.getMemberBySub(newGroupInfo.members, sub)) {
                        newGroupInfo.members.push(newMember);
                    }
                    return Promise.resolve();
                })
                .then(() => patchUserRoles(this.props.accessToken, this.props.groupId, sub, rolesChanges))
                .then((newData) => {
                    const newMember = this.getMemberBySub(newGroupInfo.members, sub);
                    newMember.roles = newData.roles;
                    newMember.is_admin = isAdmin;
                    newMember.profiles = user.profiles || (user.profile ? [user.profile] : undefined) || user;
                    this.setState({groupInfo: newGroupInfo});
                }),
            this.tt('adding_or_modifying_user')
        );
    }

    currentUserMember() {
        if (!this.state.groupInfo) {
            return false;
        }

        let member = this.state.groupInfo.members.find((x) => x.principal === this.currentUserSub);
        if (!member) {
            this.state.groupInfo.members.forEach((m) =>{
                let matchingProfile = (m.profiles||[]).find((p) => p.user_id === this.currentUserSub);
                if (matchingProfile) {
                    member = m;
                }
            });
        }

        return member;
    }

    currentUserIsAdmin() {
        const member = this.currentUserMember();
        return member && member.is_admin === true;
    }

    isCurrentUser(m) {
        if (m.principal === this.currentUserSub) {
            return true;
        }

        let p = (m.profiles ? m.profiles : []).find((p) => p.user_id === this.currentUserSub);

        return !!p;
    }

    renderUserForm(user) {
        return <UserForm
            language={this.props.language}
            accessToken={this.props.accessToken}
            allowedRoles={this.props.allowedRoles}
            mutuallyExclusiveRoles={this.props.mutuallyExclusiveRoles}
            user={user}
            showAvatar={this.props.showAvatar}
            showEmail={this.props.showEmail}
            showEmailAsTooltip={this.props.showEmailAsTooltip}
            showName={this.props.showName}
            onCancel={() => {
                this.setState({editUser: undefined, isAddingUser: undefined});
            }}
            onConfirm={(user, changes, isAdmin) => {
                this.setState({editUser: undefined, isAddingUser: undefined}, () => this.onAddOrEditUser(user, changes, isAdmin));
            }}/>;
    }

    renderUsers() {
        return this.state.editUser
            ? this.renderUserForm(this.state.editUser)
            : <div>
                {this.props.showAdminsOnlyFilter
                    ? <div>
                        <Checkbox
                            style={{marginTop: '0px'}}
                            label={this.tt('view_admins_only')} checked={this.state.showAdmins}
                            onChange={() => this.setState({showAdmins: !this.state.showAdmins})}/>
                    </div>
                    : null}
                <table className='table table-hover'>
                    <tbody>
                        {this.state.groupInfo.members.length == 0
                            ? <em>{this.tt('no-users')}</em>
                            : null}
                        {this.state.groupInfo.members
                            .filter((a) => !this.state.showAdmins || a.is_admin)
                            .map((m, i) => {
                                let canModify = !this.props.readOnly && this.currentUserIsAdmin();
                                return <UserRow
                                    language={this.props.language}
                                    key={i}
                                    user={m}
                                    showAvatar={this.props.showAvatar}
                                    showEmail={this.props.showEmail}
                                    showEmailAsTooltip={this.props.showEmailAsTooltip}
                                    showName={this.props.showName}
                                    isCurrentUser={this.isCurrentUser(m)}
                                    currentUserSub={this.currentUserSub}
                                    allowedRoles={this.props.allowedRoles}
                                    readOnly={!canModify}
                                    onDeleteUserClick={!canModify ? null : () => this.onDeleteUser(m)}
                                    onEditRolesClick={!canModify ? null : () => this.setState({
                                        editUser: m,
                                    })}
                                />;
                            })}
                    </tbody>
                </table>
            </div>;
    }

    renderHeader() {
        let caption = this.tt('header-title-users');
        if (this.state.isAddingUser) {
            caption = this.tt('header-title-add-user');
        }
        if (this.state.editUser) {
            caption = this.tt('header-title-edit-user');
        }

        let addButton = <Icon name={'add-circle-1'} size={'2x'} color={this.props.readOnly ? colors.platinum : colors.shale} />;

        return <div className={'rcu-header'}>
            <div className={'row'}>
                <div className={'col-xs-8'}>
                    <h5>{caption}
                        &nbsp;
                        {!this.state.isAddingUser && !this.state.editUser
                            ? (((this.state.addUserEnabled && this.currentUserIsAdmin()) || this.state.g56) ?
                                <Tooltip contents={this.tt('tab_add_user_caption')}>
                                    <span onClick={() => this.setState({isAddingUser: true})} className={'rcu-icon'}>
                                        {addButton}
                                    </span>
                                </Tooltip>
                                : <Tooltip contents={this.tt('tab_add_user_caption_disabled')}>
                                    <span className={'rcu-icon disabled'}>
                                        {addButton}
                                    </span>
                                </Tooltip>)
                            : null}
                    </h5>
                </div>
                <div className={'col-xs-4'}>
                    <h5 style={{textAlign: 'right'}}>
                        {!this.state.isAddingUser && !this.state.editUser
                            ? <span onClick={() => this.fetchGroupInfo()} className={'rcu-icon'}>
                                <Tooltip contents={this.tt('refresh-button-tooltip')}>
                                    <Icon name={'synchronize-3-l'} size={'2x'}
                                        color={this.props.readOnly ? colors.platinum : colors.shale}/>
                                </Tooltip>
                            </span>
                            : null}
                    </h5>
                </div>
            </div>
        </div>;
    }

    render() {
        if (this.state.isExecutingRequest) {
            return <Loading language={this.props.language} message={this.executingRequestCaption}/>;
        }

        if (this.state.executingRequestError) {
            return <ErrorInfo
                language={this.props.language}
                error={this.state.executingRequestError}
                onAcknowledgeClick={() => this.setState({executingRequestError: undefined})}/>;
        }

        if (!this.props.accessToken || !this.state.groupInfo) {
            return <Loading language={this.props.language} message={this.tt('initializing')}/>;
        }

        let content = this.renderUsers();
        if (this.state.isAddingUser) {
            content = this.renderUserForm();
        }

        return (
            <div className={'rcu-component'}>
                <div className='row'>
                    <div className='col-sm-12'>
                        {this.renderHeader()}
                        {content}
                    </div>
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
    mutuallyExclusiveRoles: PropTypes.bool,

    groupId: PropTypes.number,

    readOnly: PropTypes.bool,
    showAdminsOnly: PropTypes.bool,
    showAvatar: PropTypes.bool,
    showEmail: PropTypes.bool,
    showEmailAsTooltip: PropTypes.bool,
    showName: PropTypes.bool,
    showAdminsOnlyFilter: PropTypes.bool,
    showCoamLink: PropTypes.bool,
};

UsersTable.defaultProps = {
    language: 'eng',
    readOnly: false,
    mutuallyExclusiveRoles: false,
    showAdminsOnly: false,
    showAdminsOnlyFilter: true,
    showAvatar: true,
    showEmail: true,
    showEmailAsTooltip: true,
    showName: true,
};

export default translate('translations', {i18n: getI18nInstance()})(UsersTable);
