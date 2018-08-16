import React from 'react';
import auth from './auth';

export default class Authenticated extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        auth.fastSafeTokenAccess().then((token) => this.setState({token: token}));
    }

    render() {
        if (!this.state.token) {
            return 'Loading...';
        }
        let profile = auth.getProfile();


        return <div style={{padding: '20px'}}>
            <div style={{
                padding: '5px',
                border: '1px solid #eee',
                background: '#fff',
                marginBottom: '10px',
                boxShadome: '0 2px 2px 0 rgba(0,0,0,.1)',
            }}>
                <em className={'text-muted'}>{profile.name} ({profile.email})</em>
            </div>
            {
                // eslint-disable-next-line react/prop-types
                React.Children.map(this.props.children, (child) => React.cloneElement(child, {accessToken: this.state.token}))
            }
        </div>;
    }
}
