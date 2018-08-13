import React from 'react';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {searchPrincipals} from '../apis/coam.api';

import {TextField, Toggle} from '@cimpress/react-components';

import '../styles/UsersTable.css'
import Loading from "./common/Loading";
import ErrorInfo from './common/ErrorInfo';

import debounce from 'debounce';

class NewUsersTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            templates: this.props.templates,
            fetchingTemplates: false,
            showAdmins: this.props.showAdminsOnly,
            editUserRolesModalOpen: false,
            editUser: undefined,
            searchKey: '',
            currentRoles: []
        };

        this.debouncedSearch = debounce(this.searchPrincipals, 500)
    }

    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    executeRequest(promise, caption, stateVar) {
        this.setState({
            isExecutingRequest: true,
            executingRequestCaption: caption
        });

        return promise
            .then(response => {
                let state = {isExecutingRequest: false};
                if (stateVar) {
                    state[stateVar] = response;
                }
                this.setState(state)
            })
            .catch(error => {
                this.setState({
                    isExecutingRequest: false,
                    executingRequestError: error
                })
            })
    }

    searchPrincipals() {
        return this.executeRequest(
            searchPrincipals(this.props.accessToken, this.state.searchKey),
            'Searching...',
            'foundPrincipals'
        )
    }

    componentDidUpdate(prevProps) {
        if (prevProps.accessToken !== this.props.accessToken && this.props.accessToken) {
            this.fetchGroupInfo().then(() => this.fetchRoles())
        }
    }

    componentDidMount() {
        if (!this.props.accessToken) {
            return;
        }
    }

    renderUserRow(u, onClick) {
        return <tr>
            <td className={'rcu-user-row'} onClick={onClick}>
                <img src={u.picture} alt="" className={'rcu-user-avatar'}/>
                {u.name}
                &nbsp;
                <span className={'text-muted'}><em>({u.email})</em></span>
            </td>
        </tr>
    }

    renderSearch() {
        return [
            <div className='row'>
                <div className='col-sm-12'>
                    <TextField label={this.tt('search_for_users')} value={this.state.searchKey} onChange={(v) => {
                        this.setState({searchKey: v.target.value}, () => this.debouncedSearch())
                    }}/>
                </div>
            </div>,
            <div className='row'>
                <div className='col-sm-12'>
                    <div>
                        {this.state.isExecutingRequest
                            ? <Loading/>
                            : <table className='table table-hover'>
                                <tbody>
                                {(this.state.foundPrincipals || []).map(p => this.renderUserRow(p, () => this.setState({selectedUser: p})))}
                                </tbody>
                            </table>}
                    </div>
                </div>
            </div>
        ]
    }

    onToggleRole(roleName, isRoleAssigned) {
        let newRolesList = this.state.currentRoles.slice().filter(r => r !== roleName);
        if (!isRoleAssigned) {
            newRolesList.push(roleName)
        }
        this.setState({currentRoles: newRolesList});
    }

    render() {

        if (this.state.executingRequestError) {
            return <ErrorInfo error={this.state.executingRequestError}/>;
        }

        if (!this.props.accessToken) {
            return <Loading message={'Initializing...'}/>
        }

        if (!this.state.selectedUser)
            return this.renderSearch();

        return <div>
            <table className='table table-hover'>
                <tbody>
                {this.renderUserRow(this.state.selectedUser, () => this.setState({selectedUser: undefined}))}
                </tbody>
            </table>
            <div>
                <table className={'table table-hover'}>
                    <tbody>
                    {this.props.allowedRoles.map(x => {
                        const isRoleAssigned = this.state.currentRoles.indexOf(x.roleName) !== -1;
                        return <tr>
                            <td width='100%'>
                                <h5>{x.roleName}</h5>
                            </td>
                            <td align='right'>
                                <Toggle
                                    onText={'Yes'}
                                    offText={'No'}
                                    on={isRoleAssigned}
                                    onClick={() => this.onToggleRole(x.roleName, isRoleAssigned)}
                                />
                            </td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
            <div align='right'>
                <button className={'btn btn-default'} onClick={() => this.props.onCancel()}>
                    Cancel
                </button>
                &nbsp;
                <button className={'btn btn-primary'}>
                    Confirm
                </button>
            </div>
        </div>
    }
}

NewUsersTable.propTypes = {
    // silence eslint
    t: PropTypes.any,
    i18n: PropTypes.any,
    language: PropTypes.string,

    accessToken: PropTypes.string,

    // roles to allow to assign to
    allowedRoles: PropTypes.array.isRequired,

    readOnly: PropTypes.bool,
    showAdminsOnly: PropTypes.bool
};

NewUsersTable.defaultProps = {
    language: 'eng',
    readOnly: false,
    showAdminsOnly: false
};

export default translate('translations', {i18n: getI18nInstance()})(NewUsersTable);
