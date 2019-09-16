import React, { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Button, Icon, Menu, MenuDivider, MenuItem, Popover, Position,
} from '@blueprintjs/core';

import SettingsDialog from 'src/dialogs/SettingsDialog/SettingsDialog';
import AuthenticationDialog from 'src/dialogs/AuthenticationDialog/AuthenticationDialog';
import QueryLogsDialog from 'src/dialogs/QueryLogsDialog/QueryLogsDialog';

import './AuthButtons.scss';


const messages = defineMessages({
  view_notifications: {
    id: 'nav.view_notifications',
    defaultMessage: 'Notifications',
  },
  myDatasets: {
    id: 'nav.my_datasets',
    defaultMessage: 'My datasets',
  },
  settings: {
    id: 'nav.settings',
    defaultMessage: 'Profile settings',
  },
  signout: {
    id: 'nav.signout',
    defaultMessage: 'Sign out',
  },
  signin: {
    id: 'nav.signin',
    defaultMessage: 'Sign in / Register',
  },
  queryLogs: {
    id: 'nav.queryLogs',
    defaultMessage: 'Search history',
  },
});
export class AuthButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settingsIsOpen: false,
      queryLogsIsOpen: false,
      isSignupOpen: false,
    };

    this.toggleSettings = this.toggleSettings.bind(this);
    this.toggleAuthentication = this.toggleAuthentication.bind(this);
  }

  toggleQueryLogs = () => this.setState(state => ({ queryLogsIsOpen: !state.queryLogsIsOpen }));

  toggleAuthentication() {
    this.setState(({ isSignupOpen }) => ({ isSignupOpen: !isSignupOpen }));
  }


  toggleSettings() {
    this.setState(({ settingsIsOpen }) => ({ settingsIsOpen: !settingsIsOpen }));
  }

  render() {
    const { session, role, auth, intl } = this.props;

    if (session.loggedIn) {
      return (
        <span className="AuthButtons">
          <Popover
            content={(
              <Menu>
                <Link to="/cases" className="bp3-menu-item">
                  <Icon icon="briefcase" />
                  <div className="bp3-text-overflow-ellipsis bp3-fill">
                    {intl.formatMessage(messages.myDatasets)}
                  </div>
                </Link>
                <Link to="/notifications" className="bp3-menu-item">
                  <Icon icon="notifications" />
                  {' '}
                  {' '}
                  <div className="bp3-text-overflow-ellipsis bp3-fill">
                    {intl.formatMessage(messages.view_notifications)}
                  </div>
                </Link>
                <MenuItem icon="history" onClick={this.toggleQueryLogs} text={intl.formatMessage(messages.queryLogs)} />
                <MenuDivider />
                <MenuItem icon="cog" onClick={this.toggleSettings} text={`${intl.formatMessage(messages.settings)}`} />
                <MenuItem icon="log-out" href="/logout" text={intl.formatMessage(messages.signout)} />
              </Menu>
)}
            position={Position.BOTTOM_LEFT}
            minimal
          >
            <Button icon="user" className="bp3-minimal" rightIcon="caret-down" text={role ? role.name : 'Profile'} />
          </Popover>
          <SettingsDialog isOpen={this.state.settingsIsOpen} toggleDialog={this.toggleSettings} />
          <QueryLogsDialog
            isOpen={this.state.queryLogsIsOpen}
            toggleDialog={this.toggleQueryLogs}
          />
        </span>
      );
    }

    if (auth.password_login_uri || auth.oauth_uri) {
      return (
        <span className="AuthButtons">
          <AuthenticationDialog
            auth={auth}
            isOpen={this.state.isSignupOpen}
            toggleDialog={this.toggleAuthentication}
          />
          <Button icon="log-in" className="bp3-minimal" onClick={this.toggleAuthentication}>
            <FormattedMessage id="nav.signin" defaultMessage="Sign in / Register" />
          </Button>
        </span>
      );
    }

    return null;
  }
}
export default injectIntl(AuthButtons);
