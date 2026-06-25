/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoterPortal } from './components/VoterPortal';

export default function App() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden font-bold" style={{ backgroundColor: '#fdf4e8', fontFamily: "'Century Gothic', CenturyGothic, AppleGothic, sans-serif" }}>
      <VoterPortal />
    </div>
  );
}
