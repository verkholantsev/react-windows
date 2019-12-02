import React from "react";
import { useViewport } from "components/Viewport";

const styles = require("components/Window.module.css");

export default function Window(props) {
  const id = React.useRef(new Date().valueOf());
  const { startDragEast, width, height, top, left } = useViewport(id.current);

  return (
    <div style={{ width, height, top, left }} className={styles.root}>
      <div className={styles.nBorder}>
        <div className={styles.nwCorner} />
        <div className={styles.nBar} />
        <div className={styles.neCorner} />
      </div>
      <div className={styles.middleArea}>
        <div className={styles.wBar} />
        <div className={styles.innerContent}>{props.children}</div>
        <div className={styles.eBar} onMouseDown={startDragEast} />
      </div>
      <div className={styles.sBorder}>
        <div className={styles.swCorner} />
        <div className={styles.sBar} />
        <div className={styles.seCorner} />
      </div>
    </div>
  );
}
