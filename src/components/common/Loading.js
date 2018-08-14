import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {getI18nInstance} from '../../i18n';

function tt(props, key) {
    let {t, language} = props;
    return t(key, {lng: language});
}

let Loading = (props) => {
    return <div className={'card'}>
        <div className={'card-block'}>
            {props.message || tt(props, 'loading')}
        </div>
    </div>;
};

Loading.propTypes = {
    message: PropTypes.any,
};

export default translate('translations', {i18n: getI18nInstance()})(Loading);
