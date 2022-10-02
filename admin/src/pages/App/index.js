import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import HomePage from '../HomePage';
import { useIntl } from 'react-intl';
import { Helmet } from 'react-helmet';
import { useRBACProvider } from '@strapi/helper-plugin'

const App = () => {
  const { formatMessage } = useIntl();
  const title = formatMessage({
    id: `${pluginId}.plugin.name`,
    defaultMessage: 'Fast Content Builder',
  });
  const { refetchPermissions } = useRBACProvider()

  useEffect(() => {
    return async () => {
      await refetchPermissions()
    }
  }, [])
  

  return (
    <div>
      <Helmet title={title} />
      <Switch>
        <Route path={`/plugins/${pluginId}`} component={HomePage} exact />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
};

export default App;
