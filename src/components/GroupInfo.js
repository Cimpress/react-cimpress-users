import React from 'react';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

class GroupInfo extends React.Component {
    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    render() {
        let resourcesMap = {};
        this.props.groupInfo.resources.map((r) => {
            if (!resourcesMap[r.resource_type]) {
                resourcesMap[r.resource_type] = [];
            }
            resourcesMap[r.resource_type].push(r.resource_identifier);
        });

        let resources = Object.keys(resourcesMap).map((res, i) =>
            <div key={i} className='list-group-item'>{res}:<br/>
                {resourcesMap[res].map((a, j) => <span key={j}>
                    <span className={'badge badge-info'} style={{float: 'none'}}>{a}</span>
                    &nbsp;
                </span>)}
            </div>);


        let keys = ['name', 'description', 'created_by', 'created_at'];
        return <div className={'list-group'}>
            {keys.map((k, i) =>
                <div key={i} className={'list-group-item'}>
                    {this.tt(k)}: <strong>{this.props.groupInfo[k]}</strong>
                </div>)}
            {resources}
        </div>;
    }
}

GroupInfo.propTypes = {
    // silence eslint
    t: PropTypes.any,
    i18n: PropTypes.any,
    language: PropTypes.string,
    groupInfo: PropTypes.object,
};

GroupInfo.defaultProps = {
    language: 'eng',
};

export default translate('translations', {i18n: getI18nInstance()})(GroupInfo);