
import generateContentTypeReducer from './components/GenerateContentType/reducer';
import importContentReducer from './components/ImportContents/reducer';
import pluginId from './pluginId';

const reducers = {
  [`${pluginId}_generateContentTypeReducer`]: generateContentTypeReducer,
  [`${pluginId}_importContentReducer`]: importContentReducer,
};

export default reducers;
