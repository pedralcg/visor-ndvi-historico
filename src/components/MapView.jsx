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
import {
  COLORS,
  SHADOWS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  ANIMATIONS,
} from "../styles/designTokens";

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
        const contentDiv = legendDiv.querySelector(".legend-content");
        if (contentDiv) {
          contentDiv.innerHTML = config.html;
          // Hacer visible la leyenda cuando se actualiza
          legendDiv.style.display = "block";
          // Opcional: expandir automáticamente al actualizar
          legendDiv.classList.remove("collapsed");
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
        .layers(bases, null, { collapsed: true })
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

        // Botón de toggle
        const toggleBtn = L.DomUtil.create("button", "legend-toggle", div);
        toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
        toggleBtn.title = "Contraer/Expandir leyenda";

        toggleBtn.onclick = (e) => {
          L.DomEvent.stopPropagation(e);
          div.classList.toggle("collapsed");
          // Rotar icono
          const isCollapsed = div.classList.contains("collapsed");
          toggleBtn.style.transform = isCollapsed
            ? "rotate(180deg)"
            : "rotate(0deg)";
        };

        // Contenedor de contenido
        const contentDiv = L.DomUtil.create("div", "legend-content", div);
        contentDiv.innerHTML = `
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onGeometrySelected, onReset]);

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
            background: ${COLORS.SURFACE}e6; 
            backdrop-filter: blur(8px);
            border-radius: ${RADIUS.LG};
            padding: ${SPACING[4]} ${SPACING[5]};
            box-shadow: ${SHADOWS.LG};
            border: 1px solid ${COLORS.BORDER};
            font-family: ${TYPOGRAPHY.FONT_FAMILY};
            color: ${COLORS.TEXT_PRIMARY}; 
            max-width: 280px;
            transition: ${ANIMATIONS.TRANSITION_BASE};
            position: relative;
            min-width: 200px;
          }
          
          .index-legend:hover {
            box-shadow: ${SHADOWS.XL};
          }

          .index-legend.collapsed {
            padding-bottom: ${SPACING[2]};
            width: auto;
            min-width: unset;
          }

          .index-legend.collapsed .legend-content {
            display: none;
          }

          .legend-toggle {
            position: absolute;
            top: ${SPACING[2]};
            right: ${SPACING[2]};
            background: transparent;
            border: none;
            cursor: pointer;
            padding: ${SPACING[1]};
            border-radius: ${RADIUS.SM};
            color: ${COLORS.TEXT_SECONDARY};
            display: flex;
            align-items: center;
            justify-content: center;
            transition: ${ANIMATIONS.TRANSITION_BASE};
            z-index: 10;
          }

          .legend-toggle:hover {
            background: ${COLORS.BACKGROUND_SECONDARY};
            color: ${COLORS.PRIMARY};
          }
          
          .index-legend h4 {
            margin: 0 0 ${SPACING[2]} 0;
            font-size: ${TYPOGRAPHY.FONT_SIZES.SM};
            color: ${COLORS.TEXT_PRIMARY};
            font-weight: ${TYPOGRAPHY.FONT_WEIGHTS.BOLD};
            letter-spacing: -0.01em;
            padding-right: ${SPACING[6]}; /* Space for toggle button */
          }
          
          .index-legend div {
            line-height: ${TYPOGRAPHY.LINE_HEIGHTS.RELAXED};
            font-size: ${TYPOGRAPHY.FONT_SIZES.XS};
            font-weight: ${TYPOGRAPHY.FONT_WEIGHTS.MEDIUM};
            color: ${COLORS.TEXT_SECONDARY};
          }
          
          .index-legend i {
            display: inline-block;
            width: 18px;
            height: 10px;
            float: left;
            margin-right: ${SPACING[2]};
            margin-top: 6px;
            border-radius: ${RADIUS.XS};
            box-shadow: ${SHADOWS.SM};
          }

          /* Estilos para el control de capas - tema claro */
          .leaflet-control-layers {
            background: ${COLORS.SURFACE}e6 !important;
            backdrop-filter: blur(8px);
            border: 1px solid ${COLORS.BORDER} !important;
            border-radius: ${RADIUS.MD} !important;
            box-shadow: ${SHADOWS.MD} !important;
            padding: ${SPACING[2]} !important;
            z-index: 400 !important;
          }

          .leaflet-control-layers-toggle {
            background-color: ${COLORS.SURFACE} !important;
            border: 1px solid ${COLORS.BORDER} !important;
          }

          .leaflet-control-layers-expanded {
            padding: ${SPACING[3]} ${SPACING[3]} !important;
            font-family: ${TYPOGRAPHY.FONT_FAMILY} !important;
            color: ${COLORS.TEXT_PRIMARY} !important;
          }

          .leaflet-control-layers-base label,
          .leaflet-control-layers-overlays label {
            color: ${COLORS.TEXT_PRIMARY} !important;
            font-weight: ${TYPOGRAPHY.FONT_WEIGHTS.MEDIUM} !important;
            font-size: ${TYPOGRAPHY.FONT_SIZES.SM} !important;
            padding: ${SPACING[1]} 0 !important;
          }

          .leaflet-control-layers-separator {
            border-top: 1px solid ${COLORS.BORDER} !important;
            margin: ${SPACING[2]} 0 !important;
          }

          /* Estilos para los controles de dibujo - tema claro */
          .leaflet-draw-toolbar a {
            background-color: ${COLORS.SURFACE} !important;
            border: 1px solid ${COLORS.BORDER} !important;
            color: ${COLORS.TEXT_PRIMARY} !important;
          }

          .leaflet-draw-toolbar a:hover {
            background-color: ${COLORS.BACKGROUND_SECONDARY} !important;
            border-color: ${COLORS.PRIMARY} !important;
            color: ${COLORS.PRIMARY} !important;
          }

          .leaflet-draw-actions a {
            background-color: ${COLORS.SURFACE} !important;
            border: 1px solid ${COLORS.BORDER} !important;
            color: ${COLORS.TEXT_PRIMARY} !important;
          }

          .leaflet-draw-actions a:hover {
            background-color: ${COLORS.PRIMARY} !important;
            color: ${COLORS.SURFACE} !important;
          }

          /* Tooltips del mapa */
          .leaflet-tooltip {
            background-color: ${COLORS.SURFACE} !important;
            color: ${COLORS.TEXT_PRIMARY} !important;
            border: 1px solid ${COLORS.PRIMARY} !important;
            border-radius: ${RADIUS.SM} !important;
            padding: ${SPACING[1]} ${SPACING[2]} !important;
            font-family: ${TYPOGRAPHY.FONT_FAMILY} !important;
            font-weight: ${TYPOGRAPHY.FONT_WEIGHTS.MEDIUM} !important;
            box-shadow: ${SHADOWS.MD} !important;
          }

          /* Zoom control - tema claro */
          .leaflet-control-zoom a {
            background-color: ${COLORS.SURFACE} !important;
            border: 1px solid ${COLORS.BORDER} !important;
            color: ${COLORS.TEXT_PRIMARY} !important;
          }

          .leaflet-control-zoom a:hover {
            background-color: ${COLORS.BACKGROUND_SECONDARY} !important;
            border-color: ${COLORS.PRIMARY} !important;
            color: ${COLORS.PRIMARY} !important;
          }
        `}
        </style>
      </div>
    );
  }
);

export default MapView;
