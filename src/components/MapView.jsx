// frontend/src/components/MapView.jsx
import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// ----------------------------------------------------
// FIX DE ÍCONOS DE MARCADOR DE LEAFLET
// ----------------------------------------------------
import icon from "leaflet/dist/images/marker-icon.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
// ----------------------------------------------------

// Usamos forwardRef para permitir que App.js llame a clearAllNdviLayers
const MapView = forwardRef(
  ({ onGeometrySelected, ndviTileUrl, onReset, lastNdviDate }, ref) => {
    const mapRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const layersControlRef = useRef(null);
    // Estado para rastrear las capas NDVI (Nombre: Capa Leaflet)
    const [ndviLayersMap, setNdviLayersMap] = useState(new Map());

    // Función de limpieza de capas, expuesta al componente padre
    const clearAllNdviLayers = () => {
      if (mapRef.current && layersControlRef.current) {
        // Remover capas del mapa y del control
        ndviLayersMap.forEach((layer, name) => {
          try {
            layersControlRef.current.removeLayer(layer);
            mapRef.current.removeLayer(layer);
          } catch (e) {
            console.warn("Error al intentar eliminar capa NDVI:", name, e);
          }
        });
        setNdviLayersMap(new Map()); // Limpiar el estado
      }
    };

    // Exponer la función de limpieza al componente padre a través de la ref
    useImperativeHandle(ref, () => ({
      clearAllNdviLayers: clearAllNdviLayers,
    }));

    useEffect(() => {
      if (mapRef.current) return;

      const map = L.map("map", { center: [38.0, -1.0], zoom: 8 });

      // Capas base
      const osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap" }
      ).addTo(map);
      const esriSat = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "© Esri, Maxar" }
      );
      const topo = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenTopoMap" }
      );
      const emptyBase = L.tileLayer("", { attribution: "" });

      const bases = {
        "🗺️ OpenStreetMap": osm,
        "🛰️ Satélite (Esri)": esriSat,
        "🏔️ Topográfico": topo,
        "❌ Sin mapa base": emptyBase,
      };

      drawnItemsRef.current = new L.FeatureGroup();
      map.addLayer(drawnItemsRef.current);

      const control = L.control
        .layers(bases, null, { collapsed: false })
        .addTo(map);
      layersControlRef.current = control;

      import("leaflet-draw").then(() => {
        const drawControl = new L.Control.Draw({
          draw: {
            marker: true,
            polygon: true,
            rectangle: true,
            circle: true,
            polyline: false,
            circlemarker: false,
          },
          edit: { featureGroup: drawnItemsRef.current },
        });
        map.addControl(drawControl);

        map.on(L.Draw.Event.CREATED, (e) => {
          const layer = e.layer;
          drawnItemsRef.current.clearLayers();
          drawnItemsRef.current.addLayer(layer);

          let geojson = layer.toGeoJSON();
          if (layer instanceof L.Circle) {
            geojson.properties.radius = layer.getRadius();
          }
          onGeometrySelected(geojson);

          if (typeof e.layer.getBounds === "function") {
            map.fitBounds(e.layer.getBounds(), { padding: [30, 30] });
          } else if (typeof e.layer.getLatLng === "function") {
            map.setView(e.layer.getLatLng(), 14);
          }
        });

        // Limpiar capas NDVI al borrar el dibujo
        map.on(L.Draw.Event.DELETED, () => {
          onReset();
          clearAllNdviLayers();
        });
      });

      // Leyenda - Corregida y con estilo moderno
      const legend = L.control({ position: "bottomright" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "ndvi-legend");
        div.innerHTML = `
        <h4 style="margin-bottom:8px; font-size:14px; color:#3A4145;">NDVI (Vegetación)</h4>
        <div style="line-height:20px; font-size:12px; font-weight: 500;">
          <i style="background:#006837; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> > 0.6 (Saludable)<br>
          <i style="background:#1a9850; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.4 - 0.6<br>
          <i style="background:#fee08b; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.2 - 0.4<br>
          <i style="background:#fdae61; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> 0.0 - 0.2<br>
          <i style="background:#d73027; display:inline-block; width:18px; height:10px; float:left; margin-right:8px; border-radius: 2px;"></i> < 0.0 (Poca/Nula)
        </div>`;
        return div;
      };
      legend.addTo(map);

      mapRef.current = map;
    }, [onGeometrySelected, onReset, ref, ndviLayersMap]);

    // Efecto para añadir nuevas capas NDVI
    useEffect(() => {
      // Si no tenemos URL, fecha, mapa o control de capas, salimos.
      if (
        !mapRef.current ||
        !ndviTileUrl ||
        !lastNdviDate ||
        !layersControlRef.current
      )
        return;

      const map = mapRef.current;
      const layerName = `🌿 NDVI (${lastNdviDate})`;

      // Si la capa con esta fecha ya existe, no hacemos nada para evitar duplicados
      if (ndviLayersMap.has(layerName)) {
        return;
      }

      const ndvi = L.tileLayer(ndviTileUrl, { opacity: 0.7 });
      // Añadir al mapa y activarla por defecto
      ndvi.addTo(map);

      // Añadir al control de capas como overlay (para que sea toggleable)
      layersControlRef.current.addOverlay(ndvi, layerName);

      // Almacenar en el estado
      setNdviLayersMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(layerName, ndvi);
        return newMap;
      });
    }, [ndviTileUrl, lastNdviDate, ndviLayersMap]); // Depende del último tile URL y la fecha

    return (
      <div id="map" style={{ height: "100vh", width: "100%" }}>
        <style>
          {`
          /* Estilo para la leyenda */
          .ndvi-legend {
            background: rgba(255,255,255,1); 
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            font-family: 'Roboto', sans-serif;
            color: #3A4145; 
          }
        `}
        </style>
      </div>
    );
  }
);

export default MapView;
