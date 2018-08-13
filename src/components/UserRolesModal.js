import React from 'react';
import {Portal} from 'react-portal';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {Modal, Toggle, Icon, colors} from '@cimpress/react-components';
import {searchPrincipals} from "../apis/coam.api";

class UserRolesModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            templates: this.props.templates,
            fetchingTemplates: false,
            currentRoles: this.getCurrentRoles(),
            isAdmin: this.props.user && this.props.user.is_admin,
            newuser: ''
        };
    }

    getCurrentRoles() {
        return (this.props.user || {}).roles || []
    }

    onToggleAdmin() {
        this.setState({isAdmin: !this.state.isAdmin});
    }

    onToggleRole(roleName, isRoleAssigned) {
        let newRolesList = this.state.currentRoles.slice().filter(r => r !== roleName);
        if (!isRoleAssigned) {
            newRolesList.push(roleName)
        }
        this.setState({currentRoles: newRolesList});
    }

    componentDidUpdate(prevProps) {
        let userBefore = JSON.stringify(prevProps.user);
        let userAfter = JSON.stringify(this.props.user);
        if (userAfter !== userBefore) {
            this.setState({
                currentRoles: this.getCurrentRoles(),
                isAdmin: this.props.user && this.props.user.is_admin
            })
        }
    }

    getChangedRoles() {
        return {
            'is_admin': this.state.isAdmin,
            'add': this.state.currentRoles.filter(a => this.props.user.roles.indexOf(a) === -1),
            'remove': this.props.user.roles.filter(a => this.state.currentRoles.indexOf(a) === -1)
        }
    }

    render() {

        if (!this.props.user) {
            return null;
        }

        return (
            <Portal>
                <Modal
                    bsStyle={'warning'}
                    show={this.props.open}
                    title={`${this.props.user.profile.name} (${this.props.user.profile.email})`}
                    footer={<div>
                        <button className={'btn btn-default'} onClick={() => this.props.onCancel()}>
                            Cancel
                        </button>
                        &nbsp;
                        <button className={'btn btn-primary'}
                                onClick={() => this.props.onConfirm(this.getChangedRoles())}>
                            Confirm
                        </button>
                    </div>}
                    closeOnOutsideClick
                    closeButton
                    onRequestHide={() => this.props.onCancel()}>
                    <div>
                        <table className={'table table-hover'}>
                            <tbody>
                            {this.props.allowedRoles.map(x => {
                                const isRoleAssigned = this.state.currentRoles.indexOf(x.roleName) !== -1;
                                return <tr>
                                    <td width='100%'>
                                        <h5>{x.roleName}</h5>
                                    </td>
                                    <td align='right'>
                                        <Toggle
                                            onText={'Yes'}
                                            offText={'No'}
                                            on={isRoleAssigned}
                                            onClick={() => this.onToggleRole(x.roleName, isRoleAssigned)}
                                        />
                                    </td>
                                </tr>
                            })}
                            </tbody>
                        </table>
                        <table className={'table table-hover'}>
                            <tbody>
                            <tr>
                                <td width='100%'>
                                    <h5 className={'text-warning'}><i className={'fa fa-info-circle'}/> Group administrator</h5>
                                    <em>Granting administrator access would allow the user to add/remove users from the
                                        current group</em>
                                </td>
                                <td align='right'>
                                    <Toggle
                                        onText={'Yes'}
                                        offText={'No'}
                                        on={this.state.isAdmin}
                                        onClick={() => this.onToggleAdmin(this.state.isAdmin)}
                                    />
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </Modal>
            </Portal>
        )
    }
}

UserRolesModal.propTypes = {
    // silence eslint
    t: PropTypes.any,
    i18n: PropTypes.any,

    // Either access token OR a list of templates to display
    allowedRoles: PropTypes.array,

    // functions and buttons
    onChange: PropTypes.func,

    // display
    language: PropTypes.string,
    label: PropTypes.string,
    showAddNew: PropTypes.bool,
    selectedTemplateId: PropTypes.string,
    createNewUrl: PropTypes.string
};

UserRolesModal.defaultProps = {
    language: 'eng',
    showAddNew: true
};

export default translate('translations', {i18n: getI18nInstance()})(UserRolesModal);
