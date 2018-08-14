import React, {Component} from 'react'
import UsersTable from '../src/components/UsersTable'

import auth from './auth/auth'

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            logged: undefined
        }
    }

    componentWillMount() {
        if (!auth.isLoggedIn()) {
            auth
                .login(window.location.pathname + window.location.search)
                .then(() => {
                    let profile = auth.getProfile();
                    if (profile) {
                        this.setState({logged: true, token: auth.getAccessToken()})
                    } else {
                        this.setState({logged: false})
                    }
                })
                .catch(catchErr => {
                    this.setState({logged: false})
                });
        }
    }

    renderBox(content) {
        return <div style={{border: "1px solid red", padding: "10px", marginBottom: '10px'}}>
            {content}
        </div>
    }

    getSamples() {

        let roles = [{
            roleName: 'Template Editor',
            roleCaption: 'Editor',
            isManagerRole: true
        }, {
            roleName: 'Template Reader',
            roleCaption: 'Reader',
            isManagerRole: false
        }];

        return [
            {
                caption: 'Simple users table',
                render: <UsersTable
                    accessToken={this.state.token}
                    groupId={5075}
                    allowedRoles={roles}
                    showAdminsOnly={false}
                />
            }
        ]
    }

    render() {
        if (!this.state.logged) {
            return 'Getting token...'
        }

        return <div>
            {this.getSamples().map(a => this.renderBox(
                <div>
                    <h6>{a.caption}</h6>
                    {a.render}
                </div>
            ))}
        </div>

    }

}