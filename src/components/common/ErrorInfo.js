import React from 'react';
import PropTypes from 'prop-types';
import {colors, Icon} from '@cimpress/react-components';

let ErrorInfo = (props) => {
    return <div className={'card'}>
        <div className={'card-block'}>
            <div>
                <strong>
                    <Icon name={'report-problem-triangle-l'} color={colors.persimmon.base}/>&nbsp;{props.error.message}
                </strong>
            </div>
            <br/>
            <div>
                {props.error.response ? <em>{JSON.stringify(props.error.response.data)}</em> : null}
            </div>
            {props.onAcknowledgeClick
                ? <div align="right">
                    <button className={'btn btn-sm btn-outline-secondary'} onClick={() => props.onAcknowledgeClick()}>
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
