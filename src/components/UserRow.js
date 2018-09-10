import React, {Fragment} from 'react';
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

    renderRoles(isCurrentUser) {
        let filteredRoles = this.props.allowedRoles.filter((a) => this.props.user.roles.find((x) => x === a.roleName));

        let readOnly =this.props.readOnly || isCurrentUser;

        let editIcon = <Icon
            name={'pencil-circle-l'} size={'2x'}
            color={readOnly ? colors.platinum : colors.shale}/>;

        let deleteIcon = <Icon
            name={'remove-circle-1-l'} size={'2x'}
            color={readOnly ? colors.platinum : colors.shale}/>;

        if (isCurrentUser) {
            editIcon = <Tooltip contents={this.tt('editing_disabled_current_user')}>{editIcon}</Tooltip>;
            deleteIcon = <Tooltip contents={this.tt('deleting_disabled_current_user')}>{deleteIcon}</Tooltip>;
        } else if (readOnly) {
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
            <span className={`rcu-icon ${readOnly ? 'rcu-icon disabled' : ''}`}
                onClick={readOnly ? null : () => this.props.onEditRolesClick()}>
                {editIcon}
            </span>
            &nbsp;&nbsp;
            <span className={`rcu-icon ${readOnly ? 'rcu-icon disabled' : ''}`}
                onClick={readOnly ? null : () => this.setState({confirmDelete: true})}>
                {deleteIcon}
            </span>
        </span>;
    }

    renderConfirmDelete() {
        let profile = this.props.user.profile || {};
        let userIdentifier = profile.name || profile.email || this.props.user.principal;

        return <tr>
            <td style={{paddingRight: '10px', paddingLeft: '10px', backgroundColor: '#fee'}}>
                <div className={'clearfix'}>
                    <h5>{this.tt('remove_user_are_you_sure')}<br/>{userIdentifier}</h5>
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

    renderUserName(isCurrentUser) {
        let profile = this.props.user.profile || {};

        let meLabel = isCurrentUser
            ? <Tooltip contents={this.tt('this_is_you_tooltip')} className={'rcu-principal-tooltip'}>
                <Icon name={'rank-army-star-2-f'} color={colors.info.base}/>
            </Tooltip>
            : null;

        if (profile.name === profile.email && profile.name) {
            return <Fragment>{profile.name} {meLabel}</Fragment>;
        }

        if (!profile.name && !profile.email) {
            return <Fragment>{this.props.user.principal}</Fragment>;
        }

        return <Tooltip contents={this.props.user.principal} className={'rcu-principal-tooltip'}>{profile.name} <span
            className={'text-muted'}>(<em>{profile.email}</em>) {meLabel}</span>
        </Tooltip>;
    }

    render() {
        if (this.state.confirmDelete) {
            return this.renderConfirmDelete();
        }

        return <tr>
            <td style={{paddingRight: '10px', paddingLeft: '10px'}}>
                <div className={'row'}>
                    <div className={'col-sm-12'}>
                        {this.props.user.is_admin
                            ? <Tooltip contents={this.tt('group_administrator')}>
                                <Icon name={'person-1-l'} className='user-icon-admin'/>
                            </Tooltip>
                            : <Tooltip contents={this.tt('group_member')}>
                                <Icon name={'person-1-l'} className='user-icon-member'/>
                            </Tooltip>}
                        &nbsp;
                        {this.renderUserName(this.props.user.principal === this.props.currentUserSub)}
                    </div>
                </div>
                <div className={'row'}>
                    <div className={'col-sm-12'} align='right'>
                        {this.renderRoles(this.props.user.principal === this.props.currentUserSub)}
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

    currentUserSub: PropTypes.string,

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
