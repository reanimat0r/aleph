import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Button, Popover, Position, Menu, MenuItem,
} from '@blueprintjs/core';
import { FormattedMessage } from 'react-intl';

import { setLocale } from 'src/actions';
import { selectSession, selectMetadata } from 'src/selectors';


const mapStateToProps = state => ({
  session: selectSession(state),
  metadata: selectMetadata(state),
  config: state.config,
});

export class LanguageMenu extends Component {
  onSetLanguage(locale) {
    return async (event) => {
      event.preventDefault();
      await this.props.setLocale({ locale });
    };
  }

  render() {
    const { metadata, config } = this.props;
    const locales = metadata.app.locales.filter(locale => (locale !== config.locale));
    const content = (
      <Menu>
        {locales.map(locale => (
          <MenuItem
            key={locale}
            text={metadata.languages[locale]}
            onClick={this.onSetLanguage(locale)}
          />
        ))}
      </Menu>
    );

    return (
      <Popover content={content} position={Position.BOTTOM_LEFT}>
        <Button icon="translate" className="bp3-minimal">
          <FormattedMessage id="nav.languages" defaultMessage="Languages" />
        </Button>
      </Popover>
    );
  }
}
export default connect(mapStateToProps, { setLocale })(LanguageMenu);
