import { useState, useEffect, useRef } from 'react';
import { ConfiguratorPanel, DebugConsole } from './components/ui';
import SceneController from './engine/SceneController.js';
import './App.css';

/**
 * Boulder Wall Configurator - React UI
 * Die 3D-Logik liegt komplett in SceneController.js
 */
function App() {
  let containerRef = useRef(null);
  let [app] = useState(function() { return new SceneController(); });
  let [updateCounter, setUpdateCounter] = useState(0);

  // Application initialisieren wenn Container gemountet
  useEffect(function() {
    if (containerRef.current === null) {
      return;
    }

    app.init(containerRef.current);

    let unsubscribe = app.onUpdate(function() {
      setUpdateCounter(function(n) { return n + 1; });
    });

    return function() {
      unsubscribe();
      app.dispose();
    };
  }, [app]);

  // Event Handler
  function handleCreateRoute(name, color) {
    let route = app.interactionManager.createNewRoute(name, color);
    app.update();
    return route;
  }

  function handleSelectRoute(routeId) {
    if (routeId === null) {
      app.interactionManager.deselectRoute();
    } else {
      app.interactionManager.selectRoute(routeId);
    }
    app.update();
  }

  function handleSelectHoldType(typeId) {
    app.interactionManager.selectHoldType(typeId);
    app.update();
  }

  function handleSelectColor(color) {
    app.interactionManager.selectColor(color);
    app.update();
  }

  function handleWallTypeChange(textureType) {
    app.wall.setTexture(textureType, app.textureLoader);
    app.update();
  }

  return (
    <div className="app">
      <div ref={containerRef} className="viewport" />

      <ConfiguratorPanel
        interactionManager={app.interactionManager}
        onWallTypeChange={handleWallTypeChange}
        onHoldTypeChange={handleSelectHoldType}
        onColorChange={handleSelectColor}
        onCreateRoute={handleCreateRoute}
        onSelectRoute={handleSelectRoute}
        triggerUpdate={function() { app.update(); }}
      />

      <div className="debug-info" style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div>Holds erstellt: {app.holdFactory.getCreatedHoldsCount()}</div>
        <div>Routen: {app.routeManager.getRoutes().length}</div>
        <div>Aktive Route: {app.interactionManager.getActiveRoute()?.getName() || 'Keine'}</div>
        <div>Hold-Typ: {app.interactionManager.getSelectedHoldType()}</div>
        <div>Updates: {updateCounter}</div>
      </div>

      <DebugConsole />
    </div>
  );
}

export default App;
