// Import this package in order to use ie9
// import 'react-app-polyfill/ie9';
import 'core-js/modules/es6.string.ends-with';
import 'core-js/modules/es6.string.starts-with';
import 'core-js/modules/es6.string.includes';
import 'core-js/modules/es7.promise.finally';
import 'core-js/modules/es7.array.includes';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './containers/App/App';
import {unregister as unregisterServiceWorker} from './registerServiceWorker';
import './styles/main.scss';

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
unregisterServiceWorker();
