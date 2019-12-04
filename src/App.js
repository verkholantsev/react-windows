import React from "react";

import Viewport from "components/Viewport";
import Window from "components/Window";

function App() {
  return (
    <Viewport>
      <Window minWidth={500} minHeight={250}>
        <div style={{ padding: 8 }}>
          <h2>This is a window</h2>
          <p>Feel free to resize it</p>
        </div>
      </Window>
    </Viewport>
  );
}

export default App;
