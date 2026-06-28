/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { VoterPortal } from './components/VoterPortal';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-[100dvh] w-full overflow-hidden font-bold" style={{ backgroundColor: '#fdf4e8', fontFamily: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif" }}>
        <VoterPortal />
      </div>
    </Router>
  );
}
