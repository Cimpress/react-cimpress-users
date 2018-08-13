import React from 'react';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {Tooltip, Icon, colors} from '@cimpress/react-components';

class UserRow extends React.Component {

    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    renderRoles() {
        let filteredRoles = this.props.allowedRoles.filter(a => this.props.user.roles.find(x => x === a.roleName));

        let editIcon = <Icon
            name={'pencil-circle-f'} size={'2x'}
            color={this.props.readOnly ? colors.platinum : colors.shale}/>;

        if (this.props.readOnly) {
            editIcon = <Tooltip contents={'Editing disabled.'}>{editIcon}</Tooltip>
        }

        return <span>
            {filteredRoles.length === 0
                ? <em className={'badge badge-default'}>No roles</em>
                : filteredRoles.map(a => {
                    let style = a.isManagerRole ? 'badge badge-warning' : 'badge badge-info';
                    return <span className={style} style={{float: 'none'}}>
                        {a.roleName}
                    </span>
                })}
            &nbsp;
            <span className={`rcu-icon ${this.props.readOnly ? 'disabled' : ''}`}
                  onClick={this.props.readOnly ? null : () => this.props.onEditRolesClick()}>
                {editIcon}
            </span>
        </span>
    }

    render() {
        return <tr>
            <td>
                <div className={'row'}>
                    <div className={'col-sm-4'}>
                        {this.props.user.is_admin
                            ? <Tooltip contents={'Group administrator'}><i className={'fa fa-users'}/></Tooltip>
                            : <Tooltip contents={'Group member'}><i className={'fa fa-user-o'}/></Tooltip>}
                        &nbsp;
                        {this.props.user.profile.name} <span
                        className={'text-muted'}>(<em>{this.props.user.profile.email}</em>)</span>
                    </div>
                    <div className={'col-sm-8'} align='right'>
                        {this.renderRoles(this.props.user)}
                    </div>
                </div>
            </td>
        </tr>
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

    readOnly: PropTypes.bool
};

UserRow.defaultProps = {
    language: 'eng',
    readOnly: false
};

export default translate('translations', {i18n: getI18nInstance()})(UserRow);
