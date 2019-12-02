import React from "react";

const styles = require("components/Viewport.module.css");

export const ViewportContext = React.createContext(null);

function viewportReducer(state, action) {
  switch (action.type) {
    case "REGISTER_WINDOW":
      const { id } = action.data;
      return {
        ...state,
        windows: [
          ...state.windows,
          { id, height: 100, width: 100, top: 100, left: 100 }
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
        windowID: action.data.windowID
      };

    case "MOUSE_MOVE":
      if (state.windowID == null) {
        return state;
      } else {
        const windows = state.windows.map(w => {
          if (w.id === state.windowID) {
            const delta = action.data.left - state.dragStartLeft;
            return {
              ...w,
              width: state.dragStartWidth + delta
            };
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

export function useViewport(windowID) {
  const { state, registerWindow, startDrag } = React.useContext(
    ViewportContext
  );

  React.useEffect(() => {
    registerWindow(windowID);
    return () => console.log("unregisterWindow(windowID)");
  }, [registerWindow, windowID]);

  const startDragEast = React.useCallback(
    event => startDrag(event, windowID, "EAST"),
    [startDrag, windowID]
  );

  return React.useMemo(() => {
    const w = state.windows.find(w => w.id === windowID);
    return { startDragEast, ...w };
  }, [startDragEast, state.windows, windowID]);
}

export default function Viewport(props) {
  const [state, dispatch] = React.useReducer(
    viewportReducer,
    props,
    calculateInitialState
  );

  console.log(state);

  const registerWindow = React.useCallback(id => {
    dispatch({ type: "REGISTER_WINDOW", data: { id } });
    return;
  }, []);

  const startDrag = React.useCallback(
    (event, windowID, elementID) =>
      dispatch({
        type: "START_DRAG",
        data: { elementID, top: event.pageY, left: event.pageX, windowID }
      }),
    []
  );

  const onMouseMove = React.useCallback(event => {
    event.preventDefault();
    dispatch({
      type: "MOUSE_MOVE",
      data: { top: event.pageY, left: event.pageX }
    });
  }, []);

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
