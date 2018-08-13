import React from "react";

// WIP

let Loading = (props) => {
    return <div className={'card'}>
        <div className={'card-block'}>
            {props.message || 'Loading...'}
        </div>
    </div>
};

export default Loading;