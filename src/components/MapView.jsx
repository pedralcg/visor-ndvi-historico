// frontend/src/components/MapView.jsx - Actualizado al tema claro
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

// Fix de íconos de marcador de Leaflet
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

const MapView = forwardRef(
  ({ onGeometrySelected, ndviTileUrl, onReset, lastNdviDate }, ref) => {
    const mapRef = useRef(null);
    const drawnItemsRef = useRef(null);
    const layersControlRef = useRef(null);
    const [ndviLayersMap, setNdviLayersMap] = useState(new Map());

    const clearAllNdviLayers = () => {
      if (mapRef.current && layersControlRef.current) {
        ndviLayersMap.forEach((layer, name) => {
          try {
            layersControlRef.current.removeLayer(layer);
            mapRef.current.removeLayer(layer);
          } catch (e) {
            console.warn("Error al intentar eliminar capa NDVI:", name, e);
          }
        });
        setNdviLayersMap(new Map());
      }
    };

    const invalidateSize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    useImperativeHandle(ref, () => ({
      clearAllNdviLayers: clearAllNdviLayers,
      invalidateSize: invalidateSize,
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

        map.on(L.Draw.Event.EDITED, (e) => {
          e.layers.each((layer) => {
            let geojson = layer.toGeoJSON();
            if (layer instanceof L.Circle) {
              geojson.properties.radius = layer.getRadius();
            }
            onGeometrySelected(geojson);
          });
        });

        map.on(L.Draw.Event.DELETED, () => {
          onReset();
          clearAllNdviLayers();
        });
      });

      // Leyenda actualizada al tema claro
      const legend = L.control({ position: "bottomright" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "ndvi-legend");
        div.innerHTML = `
        <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">NDVI (Vegetación)</h4>
        <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
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

      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 300);
    }, [onGeometrySelected, onReset, ref, ndviLayersMap]);

    useEffect(() => {
      if (
        !mapRef.current ||
        !ndviTileUrl ||
        !lastNdviDate ||
        !layersControlRef.current
      )
        return;

      const map = mapRef.current;
      const layerName = `🌿 NDVI (${lastNdviDate})`;

      if (ndviLayersMap.has(layerName)) {
        return;
      }

      const ndvi = L.tileLayer(ndviTileUrl, { opacity: 0.7 });
      ndvi.addTo(map);

      layersControlRef.current.addOverlay(ndvi, layerName);

      setNdviLayersMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(layerName, ndvi);
        return newMap;
      });
    }, [ndviTileUrl, lastNdviDate, ndviLayersMap]);

    return (
      <div id="map" style={{ height: "100%", width: "100%" }}>
        <style>
          {`
          /* Estilo para la leyenda - tema claro */
          .ndvi-legend {
            background: #ffffff; 
            border-radius: 10px;
            padding: 14px 18px;
            box-shadow: 0 4px 12px rgba(28, 25, 23, 0.12);
            border: 1px solid #e7e5e4;
            font-family: 'Inter', 'Roboto', sans-serif;
            color: #1c1917; 
          }
        `}
        </style>
      </div>
    );
  }
);

export default MapView;
