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
        let profile = u.profile || u;

        let avatar = this.props.withAvatar && u.picture
            ? <img src={u.picture} alt="" className={'rcu-user-avatar'}/>
            : null;

        let meLabel = this.props.isCurrentUser
            ? <Tooltip contents={this.tt('this_is_you_tooltip')} className={'rcu-principal-tooltip'}>
                <Icon name={'rank-army-star-2-f'} color={colors.info.base}/>
            </Tooltip>
            : null;

        let connection = profile.connection || (((profile.identities||{})[0]||{}).connection);
        let connectionIcon = ! connection ? null
            : <Tooltip contents={`${this.tt('auth0_connection')} ${connection}`} className={'rcu-principal-tooltip'}>
                <Icon name={'plug-2-l'} />
            </Tooltip>;

        let mutedEmail = profile.email
            ? <span className={'text-muted'}>(<em>{profile.email}</em>)</span>
            : null;

        if (profile.name === profile.email && profile.name) {
            return <Fragment>{profile.name} {connectionIcon} {meLabel}</Fragment>;
        }

        if (!profile.name && !profile.email) {
            return <Fragment>{u.principal || u.user_id} {connectionIcon}</Fragment>;
        }

        return <Fragment>
            {avatar}{' '}
            {profile.name}{' '}
            {mutedEmail}{' '}
            {connectionIcon}{' '}
            {meLabel}
        </Fragment>;
    }
}

UserLine.propTypes = {
    t: PropTypes.any,
    language: PropTypes.string,

    withAvatar: PropTypes.bool,
    user: PropTypes.object,
    isCurrentUser: PropTypes.bool,
};

export default translate('translations', {i18n: getI18nInstance()})(UserLine);
