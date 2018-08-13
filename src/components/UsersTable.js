import React from 'react';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {getGroupInfo, setAdminFlag, addUserRole, removeUserRole, getRoles} from '../apis/coam.api';

import {TabCard, Checkbox} from '@cimpress/react-components';

import '../styles/UsersTable.css'
import UserRow from "./UserRow";
import CoamGroupInfo from "./CoamGroupInfo";
import Loading from "./common/Loading";
import ErrorInfo from './common/ErrorInfo';
import UserRolesModal from "./UserRolesModal";
import NewUsersTable from "./NewUsersTable";

class UsersTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            templates: this.props.templates,
            fetchingTemplates: false,
            showAdmins: this.props.showAdminsOnly,
            editUserRolesModalOpen: false,
            editUser: undefined
        };
    }

    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    executeRequest(promise, caption, stateVar) {
        this.setState({
            isExecutingRequest: true,
            executingRequestCaption: caption
        });

        return promise
            .then(response => {
                let state = {isExecutingRequest: false};
                if (stateVar) {
                    state[stateVar] = response;
                }
                this.setState(state)
            })
            .catch(error => {
                this.setState({
                    isExecutingRequest: false,
                    executingRequestError: error
                })
            })
    }

    fetchGroupInfo() {
        return this.executeRequest(
            getGroupInfo(this.props.accessToken, this.props.groupId),
            'Loading group information',
            'groupInfo')
    }

    fetchRoles() {
        return this.executeRequest(
            getRoles(this.props.accessToken),
            'Loading roles...',
            'coamRoles'
        )
    }

    componentDidUpdate(prevProps) {
        if (prevProps.accessToken !== this.props.accessToken && this.props.accessToken) {
            this.fetchGroupInfo().then(() => this.fetchRoles())
        }
    }

    componentDidMount() {
        if (!this.props.accessToken) {
            return;
        }

        this.fetchGroupInfo().then(() => this.fetchRoles())
    }

    onToggleAdmin(user) {
        this.executeRequest(
            setAdminFlag(this.props.accessToken, this.props.groupId, user.principal, !user.is_admin)
                .then(() => this.fetchGroupInfo()),
            `Updating admin access for ${user.principal}`)
    }

    onRemoveRole(user, roleName) {
        alert(`Remove ${roleName} from ${user.profile.name}...`);
        this.executeRequest(
            removeUserRole(this.props.accessToken, this.props.groupId, user.principal, roleName)
                .then(() => this.fetchGroupInfo()),
            `Removing role ${roleName} from ${user.principal}`)
    }

    onAddRole(user, roleName) {
        alert(`Add ${roleName} to ${user.profile.name}...`);
        this.executeRequest(
            addUserRole(this.props.accessToken, this.props.groupId, user.principal, roleName)
                .then(() => this.fetchGroupInfo()),
            `Adding role ${roleName} to ${user.principal}`)
    }

    render() {

        if (this.state.isExecutingRequest) {
            return <Loading/>
        }

        if (this.state.executingRequestError) {
            return <ErrorInfo error={this.state.executingRequestError}/>;
        }

        if (!this.props.accessToken || !this.state.groupInfo) {
            return <Loading message={'Initializing...'}/>
        }

        // let totalUsers = ((this.state.groupInfo || {}).members || []).length;
        // let admins = ((this.state.groupInfo || {}).members || []).filter(a => a.is_admin).length;

        let tabs = [
            {
                name: 'Users',
                block:
                    <div>
                        <div className={'row'}>
                            <div className={'col-xs-6'} align="left">
                                <Checkbox
                                    label={'View admins only'} checked={this.state.showAdmins}
                                    onChange={() => this.setState({showAdmins: !this.state.showAdmins})}/>
                            </div>
                            <div className={'col-xs-6'} align="right">
                                <button className={`btn btn-link ${this.props.readOnly ? 'disabled' : ''}`}>
                                    <i className={'fa fa-plus'}/>
                                    Add...
                                </button>
                            </div>
                        </div>
                        <table className='table table-hover'>
                            <tbody>
                            {this.state.groupInfo.members
                                .sort((a, b) => a.profile.name.localeCompare(b.profile.name))
                                .filter(a => !this.state.showAdmins || a.is_admin)
                                .map(m =>
                                    <UserRow
                                        user={m}
                                        allowedRoles={this.props.allowedRoles}
                                        readOnly={this.props.readOnly}
                                        onEditRolesClick={this.props.readOnly ? null : () => this.setState({
                                            editUser: m,
                                            editUserRolesModalOpen: true
                                        })}
                                    />
                                )}
                            </tbody>
                        </table>
                    </div>,
                href: '#'
            }];

        if (this.props.showGroupInfo)
            tabs.push({
                    name: 'Group info',
                    block: <CoamGroupInfo groupInfo={this.state.groupInfo}/>,
                    href: '#'
                });

        tabs.push({
            name: 'Add user...',
            block: <NewUsersTable
                accessToken={this.props.accessToken} allowedRoles={this.props.allowedRoles}
                onCancel={() => {
                    this.setState({})
                }}/>,
            href: '#'
        });

        return (
            <div className='row'>
                <UserRolesModal
                    open={this.state.editUserRolesModalOpen}
                    onCancel={() => this.setState({editUserRolesModalOpen: false, editUser: undefined})}
                    onConfirm={(changes) => {
                        this.setState({editUserRolesModalOpen: false, editUser: undefined});
                        console.log(changes)
                    }}
                    allowedRoles={this.props.allowedRoles}
                    user={this.state.editUser}/>
                <div className='col-sm-12'>
                    <TabCard tabs={tabs} selectedIndex={0}/>
                </div>
            </div>
        )
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

    showGroupInfo: PropTypes.bool,

    readOnly: PropTypes.bool,
    showAdminsOnly: PropTypes.bool
};

UsersTable.defaultProps = {
    language: 'eng',
    readOnly: false,
    showAdminsOnly: false,
    showGroupInfo: false
};

export default translate('translations', {i18n: getI18nInstance()})(UsersTable);
