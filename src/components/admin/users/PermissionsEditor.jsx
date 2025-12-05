import React from "react";
import {
  COLORS,
  TYPOGRAPHY,
  RADIUS,
  ANIMATIONS,
} from "../../../styles/designTokens";

export default function PermissionsEditor({ permissions, onChange, role }) {
  const handleToggle = (key) => {
    onChange({
      ...permissions,
      [key]: !permissions[key],
    });
  };

  const handleNumberChange = (key, value) => {
    onChange({
      ...permissions,
      [key]: parseInt(value) || 0,
    });
  };

  const appPermissions = [
    {
      key: "ndvi_app",
      label: "Análisis Espectral (NDVI)",
      description: "Calcular índices espectrales",
    },
    {
      key: "change_detection",
      label: "Detección de Cambios",
      description: "Comparar dos periodos temporales",
    },
    {
      key: "timeseries",
      label: "Series Temporales",
      description: "Analizar tendencias temporales",
    },
    {
      key: "threshold_calculator",
      label: "Calculadora de Umbrales",
      description: "Calcular umbrales estadísticos",
    },
    {
      key: "threshold_analysis",
      label: "Análisis de Umbrales",
      description: "Aplicar umbrales a series",
    },
    {
      key: "compositor",
      label: "Compositor de Imágenes",
      description: "Generar composiciones e índices",
    },
  ];

  const featurePermissions = [
    {
      key: "export_data",
      label: "Exportar Datos",
      description: "Descargar CSV, JSON, imágenes",
    },
    {
      key: "save_profiles",
      label: "Guardar Perfiles",
      description: "Guardar configuraciones",
    },
    {
      key: "api_access",
      label: "Acceso API",
      description: "Usar API programáticamente",
    },
  ];

  const limits = [
    {
      key: "max_area_km2",
      label: "Área Máxima (km²)",
      description: "Área máxima por análisis",
      min: 1,
      max: 999999,
    },
    {
      key: "max_requests_day",
      label: "Análisis Diarios",
      description: "Número máximo de análisis por día",
      min: 1,
      max: 999999,
    },
  ];

  const PermissionToggle = ({ perm }) => (
    <div
      style={{
        padding: "16px",
        background: permissions[perm.key]
          ? "rgba(16, 185, 129, 0.05)"
          : "#fafaf9",
        border: `1px solid ${
          permissions[perm.key] ? "rgba(16, 185, 129, 0.3)" : COLORS.BORDER
        }`,
        borderRadius: RADIUS.MD,
        transition: ANIMATIONS.TRANSITION_BASE,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: "600",
              color: COLORS.TEXT_PRIMARY,
              marginBottom: "4px",
              fontSize: "0.95rem",
            }}
          >
            {perm.label}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: COLORS.TEXT_SECONDARY,
            }}
          >
            {perm.description}
          </div>
        </div>
        <button
          onClick={() => handleToggle(perm.key)}
          style={{
            position: "relative",
            width: "52px",
            height: "28px",
            background: permissions[perm.key] ? "#10b981" : COLORS.BORDER,
            borderRadius: "14px",
            border: "none",
            cursor: "pointer",
            transition: ANIMATIONS.TRANSITION_BASE,
            flexShrink: 0,
            marginLeft: "12px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: permissions[perm.key] ? "26px" : "2px",
              width: "24px",
              height: "24px",
              background: "#ffffff",
              borderRadius: "50%",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              transition: ANIMATIONS.TRANSITION_BASE,
            }}
          />
        </button>
      </div>
    </div>
  );

  const LimitInput = ({ limit }) => (
    <div
      style={{
        padding: "16px",
        background: "#fafaf9",
        border: `1px solid ${COLORS.BORDER}`,
        borderRadius: RADIUS.MD,
      }}
    >
      <label
        style={{
          display: "block",
          fontWeight: "600",
          color: COLORS.TEXT_PRIMARY,
          marginBottom: "4px",
          fontSize: "0.95rem",
        }}
      >
        {limit.label}
      </label>
      <p
        style={{
          margin: "0 0 12px 0",
          fontSize: "0.85rem",
          color: COLORS.TEXT_SECONDARY,
        }}
      >
        {limit.description}
      </p>
      <input
        type="number"
        value={permissions[limit.key] || 0}
        onChange={(e) => handleNumberChange(limit.key, e.target.value)}
        min={limit.min}
        max={limit.max}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1px solid ${COLORS.BORDER}`,
          borderRadius: RADIUS.MD,
          fontSize: "0.95rem",
          fontFamily: TYPOGRAPHY.FONT_FAMILY,
          outline: "none",
          transition: ANIMATIONS.TRANSITION_BASE,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = COLORS.PRIMARY)}
        onBlur={(e) => (e.currentTarget.style.borderColor = COLORS.BORDER)}
      />
    </div>
  );

  return (
    <div style={{ fontFamily: TYPOGRAPHY.FONT_FAMILY }}>
      {/* Role Info */}
      <div
        style={{
          padding: "16px",
          background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
          border: `1px solid rgba(59, 130, 246, 0.3)`,
          borderRadius: RADIUS.MD,
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: COLORS.TEXT_PRIMARY,
          }}
        >
          <strong>Rol actual:</strong>{" "}
          {role === "free"
            ? "Gratuito"
            : role === "premium"
            ? "Premium"
            : "Administrador"}
        </p>
        <p
          style={{
            margin: "8px 0 0 0",
            fontSize: "0.85rem",
            color: COLORS.TEXT_SECONDARY,
          }}
        >
          Los permisos se actualizan automáticamente al cambiar el rol, pero
          puedes personalizarlos aquí.
        </p>
      </div>

      {/* App Permissions */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "1.1rem",
            fontWeight: "700",
            color: COLORS.TEXT_PRIMARY,
          }}
        >
          Aplicaciones
        </h3>
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {appPermissions.map((perm) => (
            <PermissionToggle key={perm.key} perm={perm} />
          ))}
        </div>
      </div>

      {/* Feature Permissions */}
      <div style={{ marginBottom: "32px" }}>
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "1.1rem",
            fontWeight: "700",
            color: COLORS.TEXT_PRIMARY,
          }}
        >
          Funcionalidades
        </h3>
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {featurePermissions.map((perm) => (
            <PermissionToggle key={perm.key} perm={perm} />
          ))}
        </div>
      </div>

      {/* Limits */}
      <div>
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "1.1rem",
            fontWeight: "700",
            color: COLORS.TEXT_PRIMARY,
          }}
        >
          Límites
        </h3>
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {limits.map((limit) => (
            <LimitInput key={limit.key} limit={limit} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          background: "#fafaf9",
          borderRadius: RADIUS.MD,
          border: `1px solid ${COLORS.BORDER}`,
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            fontSize: "0.85rem",
            fontWeight: "600",
            color: COLORS.TEXT_SECONDARY,
          }}
        >
          Resumen de Permisos
        </p>
        <div style={{ fontSize: "0.85rem", color: COLORS.TEXT_SECONDARY }}>
          <div>
            Apps habilitadas:{" "}
            {appPermissions.filter((p) => permissions[p.key]).length}/
            {appPermissions.length}
          </div>
          <div>
            Funcionalidades:{" "}
            {featurePermissions.filter((p) => permissions[p.key]).length}/
            {featurePermissions.length}
          </div>
          <div>Límite diario: {permissions.max_requests_day || 0} análisis</div>
          <div>Área máxima: {permissions.max_area_km2 || 0} km²</div>
        </div>
      </div>
    </div>
  );
}
