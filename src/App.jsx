import { useState, useEffect, useRef } from 'react';
import { ConfiguratorPanel, RoutePlannerPanel } from './components/ui';
import SceneController from './engine/SceneController.js';
import EventBus from './engine/EventBus.js';
import './App.css';

function App() {
  let containerRef = useRef(null);
  let [app] = useState(function() { return new SceneController(); });
  let [routes, setRoutes] = useState([]);
  let [notification, setNotification] = useState(null);
  let [settings, setSettings] = useState({
    selectedType: 1,
    selectedColor: "#FF6B6B",
    selectedScale: 0.5,
    wallTexture: "classic",
    currentTool: "place"
  });

  useEffect(function() {
    if (containerRef.current === null) {
      return;
    }

    app.init(containerRef.current);

    let eventBus = EventBus.getInstance();

    let onRoutesUpdated = function(newRoutes) {
      setRoutes(newRoutes.slice());
    };

    let onSettingsUpdated = function(newSettings) {
      setSettings(newSettings);
    };

    let onRouteCreated = function(data) {
      setNotification("Route '" + data.name + "' erstellt");
      setTimeout(function() { setNotification(null); }, 2000);
    };

    let onRouteDeleted = function(data) {
      setNotification("Route '" + data.name + "' gelöscht");
      setTimeout(function() { setNotification(null); }, 2000);
    };

    eventBus.on("routes:updated", onRoutesUpdated);
    eventBus.on("settings:updated", onSettingsUpdated);
    eventBus.on("route:created", onRouteCreated);
    eventBus.on("route:deleted", onRouteDeleted);

    return function() {
      eventBus.off("routes:updated", onRoutesUpdated);
      eventBus.off("settings:updated", onSettingsUpdated);
      eventBus.off("route:created", onRouteCreated);
      eventBus.off("route:deleted", onRouteDeleted);
      app.dispose();
    };
  }, [app]);

  function handleSelectHoldType(typeId) {
    EventBus.getInstance().emit("ui:holdTypeChanged", { typeId: typeId });
  }

  function handleSelectColor(color) {
    EventBus.getInstance().emit("ui:colorChanged", { color: color });
  }

  function handleWallTypeChange(textureType) {
    EventBus.getInstance().emit("ui:wallTextureChanged", { texture: textureType });
  }

  function handleRouteNameChange(routeId, newName) {
    EventBus.getInstance().emit("ui:routeRenamed", { routeId: routeId, newName: newName });
  }

  function handleToolChange(tool) {
    EventBus.getInstance().emit("ui:toolChanged", { tool: tool });
  }

  function handleScaleChange(scale) {
    EventBus.getInstance().emit("ui:scaleChanged", { scale: scale });
  }

  function handleRouteClear(routeId) {
    EventBus.getInstance().emit("ui:routeCleared", { routeId: routeId });
  }

  function handleRouteVisibilityToggle(routeId) {
    EventBus.getInstance().emit("ui:routeVisibilityToggled", { routeId: routeId });
  }

  return (
    <div className="app">
      <div ref={containerRef} className="viewport" />

      {notification && (
        <div className="notification" style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 1000
        }}>
          {notification}
        </div>
      )}

      <RoutePlannerPanel
        routes={routes}
        selectedColor={settings.selectedColor}
        onRouteNameChange={handleRouteNameChange}
        onSelectColor={handleSelectColor}
        onRouteClear={handleRouteClear}
        onRouteVisibilityToggle={handleRouteVisibilityToggle}
      />

      <ConfiguratorPanel
        selectedHoldType={settings.selectedType}
        selectedColor={settings.selectedColor}
        selectedScale={settings.selectedScale}
        wallTexture={settings.wallTexture}
        currentTool={settings.currentTool}
        onWallTypeChange={handleWallTypeChange}
        onHoldTypeChange={handleSelectHoldType}
        onColorChange={handleSelectColor}
        onScaleChange={handleScaleChange}
        onToolChange={handleToolChange}
      />
    </div>
  );
}

export default App;
