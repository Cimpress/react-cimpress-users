import React from 'react';
import PropTypes from 'prop-types';

let ErrorInfo = (props) => {
    return <div className={'card'}>
        <div className={'card-block'}>
            {props.error.toString()}
        </div>
    </div>;
};

ErrorInfo.propTypes = {
    error: PropTypes.any,
};

export default ErrorInfo;
