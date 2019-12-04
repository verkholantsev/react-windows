import React from "react";
import { useViewport } from "components/Viewport";

const styles = require("components/Window.module.css");

export default function Window({ children, ...windowProps }) {
  const id = React.useRef(new Date().valueOf());
  const {
    height,
    left,
    startDragEast,
    startDragNorth,
    startDragSouth,
    startDragWest,
    top,
    width,
  } = useViewport(id.current, windowProps);

  return (
    <div style={{ width, height, top, left }} className={styles.root}>
      <div className={styles.nBorder}>
        <div className={styles.nwCorner} />
        <div className={styles.nBar} onMouseDown={startDragNorth}/>
        <div className={styles.neCorner} />
      </div>
      <div className={styles.middleArea}>
        <div className={styles.wBar} onMouseDown={startDragWest} />
        <div className={styles.innerContent}>{children}</div>
        <div className={styles.eBar} onMouseDown={startDragEast} />
      </div>
      <div className={styles.sBorder}>
        <div className={styles.swCorner} />
        <div className={styles.sBar} onMouseDown={startDragSouth} />
        <div className={styles.seCorner} />
      </div>
    </div>
  );
}
