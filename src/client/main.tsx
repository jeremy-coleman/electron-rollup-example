import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './styles/main.less'

import {MineSweeper} from '@coglite/minesweeper'


ReactDOM.render(<MineSweeper rows={16} cols={24} totalBombs={12} />, document.querySelector('main'))