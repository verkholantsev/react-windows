import React from "react";
import equal from "fast-deep-equal";
import usePrevious from "use-previous";

const styles = require("components/Viewport.module.css");

export const ViewportContext = React.createContext(null);

const Defaults = {
  HEIGHT: 100,
  LEFT: 100,
  TOP: 100,
  WIDTH: 100
};

function viewportReducer(state, action) {
  switch (action.type) {
    case "REGISTER_WINDOW":
      const {
        windowID,
        windowProps: { minWidth, minHeight }
      } = action.data;
      return {
        ...state,
        windows: [
          ...state.windows,
          {
            id: windowID,
            height: Math.max(Defaults.HEIGHT, minHeight),
            width: Math.max(Defaults.WIDTH, minWidth),
            top: 100,
            left: 100,
            minWidth,
            minHeight
          }
        ]
      };

    case "START_DRAG":
      const w = state.windows.find(w => w.id === action.data.windowID);
      return {
        ...state,
        dragStartHeight: w.height,
        dragStartLeft: action.data.left,
        dragStartTop: action.data.top,
        dragStartWidth: w.width,
        elementToDrag: action.data.elementToDrag,
        windowID: action.data.windowID
      };

    case "MOUSE_MOVE":
      if (state.windowID == null) {
        return state;
      } else {
        const windows = state.windows.map(w => {
          if (w.id === state.windowID) {
            const deltaLeft = action.data.left - state.dragStartLeft;
            const deltaTop = action.data.top - state.dragStartTop;
            switch (state.elementToDrag) {
              case "EAST":
                return {
                  ...w,
                  width: state.dragStartWidth + deltaLeft
                };

              case "WEST":
                return {
                  ...w,
                  left: state.dragStartLeft + deltaLeft,
                  width: state.dragStartWidth - deltaLeft
                };

              case "NORTH":
                return {
                  ...w,
                  top: state.dragStartTop + deltaTop,
                  height: state.dragStartHeight - deltaTop
                };

              case "SOUTH":
                return {
                  ...w,
                  height: state.dragStartHeight + deltaTop
                };

              default:
                return w;
            }
          }
          return w;
        });
        return { ...state, windows };
      }

    case "END_DRAG":
      return {
        ...state,
        dragStartHeight: null,
        dragStartLeft: null,
        dragStartTop: null,
        dragStartWidth: null,
        elementToDrag: null,
        windowID: null
      };

    default:
      return state;
  }
}

function calculateInitialState(props) {
  return {
    dragStartLeft: null,
    dragStartTop: null,
    windows: []
  };
}

export function useViewport(windowID, windowProps) {
  const { state, registerWindow, startDrag } = React.useContext(
    ViewportContext
  );

  const prevWindowProps = usePrevious(windowProps);
  React.useEffect(() => {
    if (equal(prevWindowProps, windowProps)) {
      return;
    }
    registerWindow(windowID, windowProps);
    return () => console.log("unregisterWindow(windowID)");
  }, [prevWindowProps, registerWindow, windowID, windowProps]);

  const startDragEast = React.useCallback(
    event => startDrag(event, windowID, "EAST"),
    [startDrag, windowID]
  );

  const startDragWest = React.useCallback(
    event => startDrag(event, windowID, "WEST"),
    [startDrag, windowID]
  );

  const startDragNorth = React.useCallback(
    event => startDrag(event, windowID, "NORTH"),
    [startDrag, windowID]
  );

  const startDragSouth = React.useCallback(
    event => startDrag(event, windowID, "SOUTH"),
    [startDrag, windowID]
  );

  return React.useMemo(() => {
    const w = state.windows.find(w => w.id === windowID);
    return {
      startDragEast,
      startDragWest,
      startDragNorth,
      startDragSouth,
      ...w
    };
  }, [
    startDragEast,
    startDragNorth,
    startDragSouth,
    startDragWest,
    state.windows,
    windowID
  ]);
}

export default function Viewport(props) {
  const [state, dispatch] = React.useReducer(
    viewportReducer,
    props,
    calculateInitialState
  );

  const registerWindow = React.useCallback((windowID, windowProps) => {
    dispatch({ type: "REGISTER_WINDOW", data: { windowID, windowProps } });
    return;
  }, []);

  const startDrag = React.useCallback(
    (event, windowID, elementToDrag) =>
      dispatch({
        type: "START_DRAG",
        data: { elementToDrag, top: event.pageY, left: event.pageX, windowID }
      }),
    []
  );

  const onMouseMove = React.useCallback(
    event => {
      if (state.windowID == null) {
        return;
      }
      event.preventDefault();
      dispatch({
        type: "MOUSE_MOVE",
        data: { top: event.pageY, left: event.pageX }
      });
    },
    [state.windowID]
  );

  const onMouseUp = React.useCallback(() => dispatch({ type: "END_DRAG" }), []);

  const contextValue = React.useMemo(
    () => ({ state, registerWindow, startDrag }),
    [registerWindow, startDrag, state]
  );

  return (
    <ViewportContext.Provider value={contextValue}>
      <div
        className={styles.root}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {props.children}
      </div>
    </ViewportContext.Provider>
  );
}
