import React from 'react';
import PropTypes from 'prop-types';

import {getI18nInstance} from '../i18n';
import {translate} from 'react-i18next';

import {searchPrincipals} from '../apis/coam.api';

import {TextField, Tooltip, Checkbox, Icon, RadioGroup, Radio} from '@cimpress/react-components';

import '../styles/UsersTable.css';
import Loading from './common/Loading';
import ErrorInfo from './common/ErrorInfo';

import debounce from 'debounce';

class UserForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editUserRolesModalOpen: false,
            editUser: undefined,
            searchKey: '',
            currentRoles: this.props.user ? this.props.user.roles : [],
            isAdmin: this.props.user ? this.props.user.is_admin : false,
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

        if (JSON.stringify(prevProps.user) !== JSON.stringify(this.props.user)) {
            this.setState({
                currentRoles: this.props.user ? this.props.user.roles : [],
            });
        }
    }

    componentDidMount() {
        if (!this.props.accessToken) {
            return;
        }
    }

    renderUserRow(user, onClick) {
        let u = user;
        if (user.profile) {
            u = user.profile;
        }

        return <tr>
            <td className={'rcu-user-row'} onClick={onClick}>
                <img src={u.picture} alt="" className={'rcu-user-avatar'}/>
                {u.name}
                {' '}
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
                                    {this.state.foundPrincipals && this.state.foundPrincipals.length === 0
                                        ? <tr>
                                            <td>{this.tt('no_users_found')}</td>
                                        </tr>
                                        : (this.state.foundPrincipals || []).map((p) => this.renderUserRow(p, () => this.setState({selectedUser: p})))}
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

    getChangedRoles() {
        if (!this.props.user) {
            return {'add': this.state.currentRoles};
        }

        return {
            'add': this.state.currentRoles.filter((a) => this.props.user.roles.indexOf(a) === -1),
            'remove': this.props.user.roles.filter((a) => this.state.currentRoles.indexOf(a) === -1),
        };
    }

    renderRolesSelections() {
        if (this.props.mutuallyExclusiveRoles) {
            let selected = undefined;
            this.props.allowedRoles.forEach((x, i) => {
                if (this.state.currentRoles.indexOf(x.roleName) !== -1) {
                    selected = x.roleName;
                }
            });
            return <div>
                <form>
                    <RadioGroup
                        defaultSelected={selected}
                        onChange={(e, v) => this.setState({currentRoles: [v]})}>{this.props.allowedRoles.map((x, i) =>
                        <Radio
                                key={i}
                                className={'rcu-radio'}
                                label={<h5>{x.roleCaption || x.roleName}</h5>}
                                value={x.roleName}/>)}
                    </RadioGroup>
                </form>
            </div>;
        }

        return this.props.allowedRoles.map((x, i) => {
            const isRoleAssigned = this.state.currentRoles.indexOf(x.roleName) !== -1;
            return <div key={i} className={'clearfix rcu-checkbox-row'}
                onClick={() => this.onToggleRole(x.roleName, isRoleAssigned)}>
                <Checkbox
                    label={<h5 style={{display: 'inline'}}>{x.roleCaption || x.roleName}</h5>}
                    checked={isRoleAssigned}
                    onChange={(e) => {
                        e.stopPropagation();
                        this.onToggleRole(x.roleName, isRoleAssigned);
                    }}
                />
            </div>;
        });
    }

    render() {
        if (this.state.executingRequestError) {
            return <ErrorInfo error={this.state.executingRequestError}/>;
        }

        if (!this.props.accessToken) {
            return <Loading message={this.tt('initializing')}/>;
        }

        if (!this.state.selectedUser && !this.props.user) {
            return this.renderSearch();
        }

        let user = this.state.selectedUser || this.props.user;

        return <div>
            <table className='table table-hover'>
                <tbody>
                    {this.renderUserRow(user, this.props.user ? null : () => this.setState({selectedUser: undefined}))}
                </tbody>
            </table>
            <div className={'rcu-checkbox-list'}>
                {this.renderRolesSelections()}
                <div className={'clearfix rcu-checkbox-row'}
                    onClick={() => this.setState({isAdmin: !this.state.isAdmin})}>
                    <Checkbox
                        inline
                        label={<h5 className={'text-warning'} style={{display: 'inline'}}>
                            {this.tt('group_administrator')}
                        </h5>}
                        checked={this.state.isAdmin}
                        onChange={(e) => {
                            e.stopPropagation();
                            this.setState({isAdmin: !this.state.isAdmin});
                        }}
                    />
                    <div className={'pull-right'}>
                        <Tooltip contents={this.tt('group_administrator_context_help')}>
                            <span className={'rcu-info-icon'}>
                                <Icon name={'infomation-circle-l'} size={'2x'}/>
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>
            <div align='right'>
                <button className={'btn btn-default'} onClick={() => this.props.onCancel()}>
                    {this.tt('button_cancel')}
                </button>
                &nbsp;
                <button className={'btn btn-primary'}
                    onClick={() => this.props.onConfirm(
                        user,
                        this.getChangedRoles(),
                        this.state.isAdmin
                    )}>
                    {this.tt('button_confirm')}
                </button>
            </div>
        </div>;
    }
}

UserForm.propTypes = {
    // silence eslint
    t: PropTypes.any,
    i18n: PropTypes.any,
    language: PropTypes.string,

    user: PropTypes.object,

    accessToken: PropTypes.string,

    // roles to allow to assign to
    allowedRoles: PropTypes.array.isRequired,
    mutuallyExclusiveRoles: PropTypes.bool,

    readOnly: PropTypes.bool,

    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
};

UserForm.defaultProps = {
    language: 'eng',
    readOnly: false,
    mutuallyExclusiveRoles: false,
};

export default translate('translations', {i18n: getI18nInstance()})(UserForm);
