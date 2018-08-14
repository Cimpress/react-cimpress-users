import React from 'react';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {searchPrincipals} from '../apis/coam.api';

import {TextField, Toggle} from '@cimpress/react-components';

import '../styles/UsersTable.css';
import Loading from './common/Loading';
import ErrorInfo from './common/ErrorInfo';

import debounce from 'debounce';

class AddNewUserForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editUserRolesModalOpen: false,
            editUser: undefined,
            searchKey: '',
            currentRoles: [],
        };

        this.debouncedSearch = debounce(this.searchPrincipals, 500);
    }

    tt(key) {
        let {t, language} = this.props;
        return t(key, {lng: language});
    }

    executeRequest(promise, caption, stateVar) {
        this.setState({
            isExecutingRequest: true,
            executingRequestCaption: caption,
        });

        return promise
            .then((response) => {
                let state = {isExecutingRequest: false};
                if (stateVar) {
                    state[stateVar] = response;
                }
                this.setState(state);
            })
            .catch((error) => {
                this.setState({
                    isExecutingRequest: false,
                    executingRequestError: error,
                });
            });
    }

    searchPrincipals() {
        return this.executeRequest(
            searchPrincipals(this.props.accessToken, this.state.searchKey),
            this.tt('searching'),
            'foundPrincipals'
        );
    }

    componentDidUpdate(prevProps) {
        if (prevProps.accessToken !== this.props.accessToken && this.props.accessToken) {
            this.fetchGroupInfo().then(() => this.fetchRoles());
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
        </tr>;
    }

    renderSearch() {
        return [
            <div key={0} className='row'>
                <div className='col-sm-12'>
                    <TextField label={this.tt('search_for_users')} value={this.state.searchKey} onChange={(v) => {
                        this.setState({searchKey: v.target.value}, () => this.debouncedSearch());
                    }}/>
                </div>
            </div>,
            <div key={1} className='row'>
                <div className='col-sm-12'>
                    <div>
                        {this.state.isExecutingRequest
                            ? <Loading/>
                            : <table className='table table-hover'>
                                <tbody>
                                    {(this.state.foundPrincipals || []).map((p) => this.renderUserRow(p, () => this.setState({selectedUser: p})))}
                                </tbody>
                            </table>}
                    </div>
                </div>
            </div>,
        ];
    }

    onToggleRole(roleName, isRoleAssigned) {
        let newRolesList = this.state.currentRoles.slice().filter((r) => r !== roleName);
        if (!isRoleAssigned) {
            newRolesList.push(roleName);
        }
        this.setState({currentRoles: newRolesList});
    }

    render() {
        if (this.state.executingRequestError) {
            return <ErrorInfo error={this.state.executingRequestError}/>;
        }

        if (!this.props.accessToken) {
            return <Loading message={this.tt('initializing')}/>;
        }

        if (!this.state.selectedUser) {
            return this.renderSearch();
        }

        return <div>
            <table className='table table-hover'>
                <tbody>
                    {this.renderUserRow(this.state.selectedUser, () => this.setState({selectedUser: undefined}))}
                </tbody>
            </table>
            <div>
                <table className={'table table-hover'}>
                    <tbody>
                        {this.props.allowedRoles.map((x, i) => {
                            const isRoleAssigned = this.state.currentRoles.indexOf(x.roleName) !== -1;
                            return <tr key={i}>
                                <td width='100%'>
                                    <h5>{x.roleCaption || x.roleName}</h5>
                                </td>
                                <td align='right'>
                                    <Toggle
                                        onText={this.tt('toggle_yes')}
                                        offText={this.tt('toggle_no')}
                                        on={isRoleAssigned}
                                        onClick={() => this.onToggleRole(x.roleName, isRoleAssigned)}
                                    />
                                </td>
                            </tr>;
                        })}
                    </tbody>
                </table>
                <table className={'table table-hover'}>
                    <tbody>
                        <tr>
                            <td width='100%'>
                                <h5 className={'text-warning'}><i
                                    className={'fa fa-info-circle'}/>{this.tt('group_administrator')}</h5>
                                <em>{this.tt('group_administrator_context_help')}</em>
                            </td>
                            <td align='right'>
                                <Toggle
                                    onText={this.tt('toggle_yes')}
                                    offText={this.tt('toggle_no')}
                                    on={this.state.isAdmin}
                                    onClick={() => this.setState({isAdmin: !this.state.isAdmin})}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div align='right'>
                <button className={'btn btn-default'} onClick={() => this.props.onCancel()}>
                    {this.tt('button_cancel')}
                </button>
                &nbsp;
                <button className={'btn btn-primary'}
                    onClick={() => this.props.onConfirm(
                        this.state.selectedUser,
                        {'add': this.state.currentRoles},
                        this.state.isAdmin
                    )}>
                    {this.tt('button_confirm')}
                </button>
            </div>
        </div>;
    }
}

AddNewUserForm.propTypes = {
    // silence eslint
    t: PropTypes.any,
    i18n: PropTypes.any,
    language: PropTypes.string,

    accessToken: PropTypes.string,

    // roles to allow to assign to
    allowedRoles: PropTypes.array.isRequired,

    readOnly: PropTypes.bool,

    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
};

AddNewUserForm.defaultProps = {
    language: 'eng',
    readOnly: false,
};

export default translate('translations', {i18n: getI18nInstance()})(AddNewUserForm);
