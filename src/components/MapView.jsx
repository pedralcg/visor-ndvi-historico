// frontend/src/components/MapView.jsx - Actualizado con leyendas dinámicas
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
    const legendRef = useRef(null);
    const [ndviLayersMap, setNdviLayersMap] = useState(new Map());

    const clearAllNdviLayers = () => {
      if (mapRef.current && layersControlRef.current) {
        ndviLayersMap.forEach((layer, name) => {
          try {
            layersControlRef.current.removeLayer(layer);
            mapRef.current.removeLayer(layer);
          } catch (e) {
            console.warn("Error al intentar eliminar capa:", name, e);
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

    // Método para actualizar la leyenda dinámicamente
    const updateLegend = (config) => {
      if (legendRef.current && config?.html) {
        const legendDiv = legendRef.current.getContainer();
        if (legendDiv) {
          legendDiv.innerHTML = config.html;
          // Hacer visible la leyenda cuando se actualiza
          legendDiv.style.display = "block";
        }
      }
    };

    // Método para ocultar la leyenda
    const hideLegend = () => {
      if (legendRef.current) {
        const legendDiv = legendRef.current.getContainer();
        if (legendDiv) {
          legendDiv.style.display = "none";
        }
      }
    };

    useImperativeHandle(ref, () => ({
      clearAllNdviLayers: clearAllNdviLayers,
      invalidateSize: invalidateSize,
      updateLegend: updateLegend,
      hideLegend: hideLegend,
      getLayersControl: () => layersControlRef.current,
      getMap: () => mapRef.current,
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
          hideLegend(); // Ocultar leyenda al borrar geometría
        });
      });

      // Leyenda inicialmente oculta (se mostrará dinámicamente)
      const legend = L.control({ position: "bottomright" });
      legend.onAdd = () => {
        const div = L.DomUtil.create("div", "index-legend");
        div.style.display = "none"; // Oculta por defecto
        div.innerHTML = `
          <h4 style="margin-bottom:8px; font-size:14px; color:#1c1917; font-weight: 700;">
            Selecciona un índice
          </h4>
          <div style="line-height:20px; font-size:12px; font-weight: 500; color: #57534e;">
            Dibuja un área y calcula un índice<br>para ver la leyenda aquí.
          </div>
        `;
        return div;
      };
      legend.addTo(map);
      legendRef.current = legend;

      mapRef.current = map;

      // Guardar referencia al mapa en el DOM para acceso externo
      const mapContainer = document.getElementById("map");
      if (mapContainer) {
        mapContainer._leaflet_map = map;
      }

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
          /* Estilo para la leyenda - tema claro actualizado */
          .index-legend {
            background: rgba(255, 255, 255, 0.95); 
            backdrop-filter: blur(8px);
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 4px 16px rgba(28, 25, 23, 0.15);
            border: 1px solid #e7e5e4;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1c1917; 
            max-width: 280px;
            transition: all 0.3s ease;
          }
          
          .index-legend:hover {
            box-shadow: 0 6px 20px rgba(28, 25, 23, 0.2);
          }
          
          .index-legend h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #1c1917;
            font-weight: 700;
            letter-spacing: -0.01em;
          }
          
          .index-legend div {
            line-height: 22px;
            font-size: 12px;
            font-weight: 500;
            color: #57534e;
          }
          
          .index-legend i {
            display: inline-block;
            width: 18px;
            height: 10px;
            float: left;
            margin-right: 8px;
            margin-top: 6px;
            border-radius: 2px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          /* Estilos para el control de capas - tema claro */
          .leaflet-control-layers {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(8px);
            border: 1px solid #e7e5e4 !important;
            border-radius: 10px !important;
            box-shadow: 0 4px 12px rgba(28, 25, 23, 0.12) !important;
            padding: 8px !important;
            z-index: 400 !important;
          }

          .leaflet-control-layers-toggle {
            background-color: #ffffff !important;
            border: 1px solid #e7e5e4 !important;
          }

          .leaflet-control-layers-expanded {
            padding: 12px 14px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            color: #1c1917 !important;
          }

          .leaflet-control-layers-base label,
          .leaflet-control-layers-overlays label {
            color: #1c1917 !important;
            font-weight: 500 !important;
            font-size: 13px !important;
            padding: 4px 0 !important;
          }

          .leaflet-control-layers-separator {
            border-top: 1px solid #e7e5e4 !important;
            margin: 8px 0 !important;
          }

          /* Estilos para los controles de dibujo - tema claro */
          .leaflet-draw-toolbar a {
            background-color: #ffffff !important;
            border: 1px solid #e7e5e4 !important;
          }

          .leaflet-draw-toolbar a:hover {
            background-color: #f5f5f4 !important;
            border-color: #047857 !important;
          }

          .leaflet-draw-actions a {
            background-color: #ffffff !important;
            border: 1px solid #e7e5e4 !important;
            color: #1c1917 !important;
          }

          .leaflet-draw-actions a:hover {
            background-color: #047857 !important;
            color: #ffffff !important;
          }

          /* Tooltips del mapa */
          .leaflet-tooltip {
            background-color: #1c1917 !important;
            color: #ffffff !important;
            border: 1px solid #047857 !important;
            border-radius: 6px !important;
            padding: 6px 10px !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            font-weight: 500 !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
          }

          /* Zoom control - tema claro */
          .leaflet-control-zoom a {
            background-color: #ffffff !important;
            border: 1px solid #e7e5e4 !important;
            color: #1c1917 !important;
          }

          .leaflet-control-zoom a:hover {
            background-color: #f5f5f4 !important;
            border-color: #047857 !important;
          }
        `}
        </style>
      </div>
    );
  }
);

export default MapView;
