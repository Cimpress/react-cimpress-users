import React from "react";

// WIP

let ErrorInfo = (props) => {
    return <div className={'card'}>
        <div className={'card-block'}>
            {props.error.toString()}
        </div>
    </div>
};

export default ErrorInfo;