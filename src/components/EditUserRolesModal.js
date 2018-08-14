import React from 'react';
import {Portal} from 'react-portal';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {Modal, Toggle} from '@cimpress/react-components';

class EditUserRolesModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentRoles: this.getCurrentRoles(),
            isAdmin: this.props.user && this.props.user.is_admin,
        };
    }

    getCurrentRoles() {
        return (this.props.user || {}).roles || [];
    }

    onToggleRole(roleName, isRoleAssigned) {
        let newRolesList = this.state.currentRoles.slice().filter((r) => r !== roleName);
        if (!isRoleAssigned) {
            newRolesList.push(roleName);
        }
        this.setState({currentRoles: newRolesList});
    }

    componentDidUpdate(prevProps) {
        let userBefore = JSON.stringify(prevProps.user);
        let userAfter = JSON.stringify(this.props.user);
        if (userAfter !== userBefore) {
            this.setState({
                currentRoles: this.getCurrentRoles(),
                isAdmin: this.props.user && this.props.user.is_admin,
            });
        }
    }

    getChangedRoles() {
        return {
            'is_admin': this.state.isAdmin,
            'add': this.state.currentRoles.filter((a) => this.props.user.roles.indexOf(a) === -1),
            'remove': this.props.user.roles.filter((a) => this.state.currentRoles.indexOf(a) === -1),
        };
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
                            {this.tt('button_cancel')}
                        </button>
                        &nbsp;
                        <button className={'btn btn-primary'}
                            onClick={() => this.props.onConfirm(this.getChangedRoles(), this.state.isAdmin)}>
                            {this.tt('button_confirm')}
                        </button>
                    </div>}
                    closeOnOutsideClick
                    closeButton
                    onRequestHide={() => this.props.onCancel()}>
                    <div>
                        <table className={'table table-hover'}>
                            <tbody>
                                {this.props.allowedRoles.map((x, i) => {
                                    const isRoleAssigned = this.state.currentRoles.indexOf(x.roleName) !== -1;
                                    return <tr key={i}>
                                        <td width='100%'>
                                            <h5>{x.roleCaption || x.roleName}</h5>
                                        </td>
                                        <td align='right'>
                                            <Toggle
                                                onText={this.tt('toggle_yes')}
                                                offText={this.tt('toggle_no')}
                                                on={isRoleAssigned}
                                                onClick={() => this.onToggleRole(x.roleName, isRoleAssigned)}
                                            />
                                        </td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                        <table className={'table table-hover'}>
                            <tbody>
                                <tr>
                                    <td width='100%'>
                                        <h5 className={'text-warning'}><i className={'fa fa-info-circle'}/>{this.tt('group_administrator')}</h5>
                                        <em>{this.tt('group_administrator_context_help')}</em>
                                    </td>
                                    <td align='right'>
                                        <Toggle
                                            onText={this.tt('toggle_yes')}
                                            offText={this.tt('toggle_no')}
                                            on={this.state.isAdmin}
                                            onClick={() => this.setState({isAdmin: !this.state.isAdmin})}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Modal>
            </Portal>
        );
    }
}

EditUserRolesModal.propTypes = {
    // silence eslint
    t: PropTypes.any,
    i18n: PropTypes.any,

    allowedRoles: PropTypes.array,
    user: PropTypes.object,
    open: PropTypes.bool,

    // functions and buttons
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,

    // display
    language: PropTypes.string,
    label: PropTypes.string,
    showAddNew: PropTypes.bool,
    selectedTemplateId: PropTypes.string,
    createNewUrl: PropTypes.string,
};

EditUserRolesModal.defaultProps = {
    language: 'eng',
    showAddNew: true,
};

export default translate('translations', {i18n: getI18nInstance()})(EditUserRolesModal);
