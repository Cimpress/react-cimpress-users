import {colors, Icon, Tooltip} from '@cimpress/react-components';
import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {getI18nInstance} from '../i18n';

class UserLine extends React.Component {
    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    render() {
        let u = this.props.user || {};
        let profile = u.profile || (u.profiles ? u.profiles[0] : undefined) || u;

        let avatar = this.props.withAvatar && (u.picture||profile.picture)
            ? <img src={u.picture||profile.picture} alt="" className={'rcu-user-avatar'}/>
            : null;

        let adminLabel = this.props.withUserType
            ? (u.is_admin
                ? <Tooltip contents={this.tt('group_administrator')}>
                &nbsp;
                    <Icon name={'person-1-l'} className='user-icon-admin'/>
                </Tooltip>
                : <Tooltip contents={this.tt('group_member')}>
                &nbsp;
                    <Icon name={'person-1-l'} className='user-icon-member'/>
                </Tooltip>)
            : null;

        let meLabel = this.props.isCurrentUser
            ? <Tooltip contents={this.tt('this_is_you_tooltip')} className={'rcu-principal-tooltip'}>
                &nbsp;
                <Icon name={'rank-army-star-2-f'} color={colors.info.base}/>
            </Tooltip>
            : null;

        let email = profile.email;
        if (!this.props.withEmail) {
            email = null;
        }

        let mutedEmail = email
            ? this.props.withName
                ? <span className={'text-muted'}>{' '}(<em>{email}</em>){' '}</span>
                : email
            : null;

        let name = profile.name;
        if (this.props.withEmail && this.props.withEmailAsTooltip) {
            mutedEmail = null;
            name = <Tooltip contents={profile.email || '---'}>
                {name}
            </Tooltip>;
        }


        if (!this.props.withName || !profile.name) {
            name = null;
        }

        if (profile.name === profile.email && name) {
            return <Fragment>{name} {meLabel}</Fragment>;
        }

        if ((!name && !email)||(!profile.name && !profile.email)) {
            return <Fragment>{avatar} {u.principal || u.canonical_principal || u.user_id}{adminLabel}{meLabel}</Fragment>;
        }

        return <Fragment>
            {avatar}{' '}
            {name}
            {mutedEmail}
            {adminLabel}
            {meLabel}
        </Fragment>;
    }
}

UserLine.propTypes = {
    t: PropTypes.any,
    language: PropTypes.string,

    withAvatar: PropTypes.bool,
    withUserType: PropTypes.bool,
    withEmail: PropTypes.bool,
    withName: PropTypes.bool,
    withEmailAsTooltip: PropTypes.bool,
    user: PropTypes.object,
    isCurrentUser: PropTypes.bool,
};

export default translate('translations', {i18n: getI18nInstance()})(UserLine);
