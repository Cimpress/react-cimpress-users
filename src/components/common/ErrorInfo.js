import React from 'react';
import PropTypes from 'prop-types';
import {colors, Icon} from '@cimpress/react-components';

let ErrorInfo = (props) => {
    return <div className={'card'}>
        <div className={'card-block'}>
            <div style={{display: 'flex'}}>
                <div style={{marginRight: '10px'}}>
                    <Icon name={'report-problem-triangle-l'} size={'2x'} color={colors.persimmon.base}/>&nbsp;
                </div>
                <div>
                    {props.error.message}
                </div>
            </div>
            <br/>
            <div>
                {props.error.response ? <em>{JSON.stringify(props.error.response.data)}</em> : null}
            </div>
            {props.onAcknowledgeClick
                ? <div align="right">
                    <button className={'btn btn-outline-secondary'} onClick={() => props.onAcknowledgeClick()}>
                        OK
                    </button>
                </div>
                : null}
        </div>
    </div>;
};

ErrorInfo.propTypes = {
    error: PropTypes.any,
    onAcknowledgeClick: PropTypes.func,
};

export default ErrorInfo;
