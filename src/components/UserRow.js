import React from 'react';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {Tooltip, Icon, colors} from '@cimpress/react-components';

class UserRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {confirmDelete: false};
    }

    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    renderRoles() {
        let filteredRoles = this.props.allowedRoles.filter((a) => this.props.user.roles.find((x) => x === a.roleName));

        let editIcon = <Icon
            name={'pencil-circle-f'} size={'2x'}
            color={this.props.readOnly ? colors.platinum : colors.shale}/>;

        let deleteIcon = <Icon
            name={'remove-circle-1-f'} size={'2x'}
            color={this.props.readOnly ? colors.platinum : colors.shale}/>;

        if (this.props.readOnly) {
            editIcon = <Tooltip contents={this.tt('editing_disabled')}>{editIcon}</Tooltip>;
            deleteIcon = <Tooltip contents={this.tt('deleting_disabled')}>{deleteIcon}</Tooltip>;
        } else {
            editIcon = <Tooltip contents={this.tt('modify_user_roles')}>{editIcon}</Tooltip>;
            deleteIcon = <Tooltip contents={this.tt('delete_user')}>{deleteIcon}</Tooltip>;
        }

        return <span>
            {filteredRoles.length === 0
                ? <em className={'badge badge-default'}>{this.tt('no_roles_defined')}</em>
                : filteredRoles.map((a, i) => {
                    let style = a.isManagerRole ? 'badge badge-warning' : 'badge badge-info';
                    return <span key={i}><span className={style} style={{float: 'none'}}>
                        {a.roleCaption || a.roleName}
                    </span>&nbsp;</span>;
                })}
            &nbsp;
            <span className={`rcu-icon ${this.props.readOnly ? 'rcu-icon-disabled' : ''}`}
                onClick={this.props.readOnly ? null : () => this.props.onEditRolesClick()}>
                {editIcon}
            </span>
            &nbsp;&nbsp;
            <span className={`rcu-icon ${this.props.readOnly ? 'rcu-icon-disabled' : ''}`}
                onClick={this.props.readOnly ? null : () => this.setState({confirmDelete: true})}>
                {deleteIcon}
            </span>
        </span>;
    }

    renderConfirmDelete() {
        return <tr>
            <td style={{paddingRight: '10px', paddingLeft: '10px', backgroundColor: '#fee'}}>
                <div className={'clearfix'}>
                    <h5>Remove {this.props.user.profile.name}?</h5>
                    <div className={'pull-right'} align="right">
                        <button className={'btn btn-sm btn-default'}
                            onClick={() => this.setState({confirmDelete: false})}>
                            {this.tt('button_cancel')}
                        </button>
                        &nbsp;
                        <button className={'btn btn-sm btn-danger'} onClick={() => this.props.onDeleteUserClick()}>
                            {this.tt('button_confirm')}
                        </button>
                    </div>
                </div>
            </td>
        </tr>;
    }

    render() {
        if (this.state.confirmDelete) {
            return this.renderConfirmDelete();
        }

        return <tr>
            <td style={{paddingRight: '10px', paddingLeft: '10px'}}>
                <div className={'row'}>
                    <div className={'col-sm-4'}>
                        {this.props.user.is_admin
                            ? <Tooltip contents={this.tt('group_administrator')}><i className={'fa fa-user-plus user-icon-admin'}/></Tooltip>
                            : <Tooltip contents={this.tt('group_member')}><i className={'fa fa-user user-icon-member'}/></Tooltip>}
                        &nbsp;
                        {this.props.user.profile.name} <span
                            className={'text-muted'}>(<em>{this.props.user.profile.email}</em>)</span>
                    </div>
                    <div className={'col-sm-8'} align='right'>
                        {this.renderRoles(this.props.user)}
                    </div>
                </div>
            </td>
        </tr>;
    }
}

UserRow.propTypes = {
    // silence eslint
    t: PropTypes.any,
    i18n: PropTypes.any,

    // roles to allow to assign to
    allowedRoles: PropTypes.array,

    // display
    language: PropTypes.string,

    user: PropTypes.object.isRequired,

    onEditRolesClick: PropTypes.func.isRequired,
    onDeleteUserClick: PropTypes.func.isRequired,

    readOnly: PropTypes.bool,
};

UserRow.defaultProps = {
    language: 'eng',
    readOnly: false,
};

export default translate('translations', {i18n: getI18nInstance()})(UserRow);
