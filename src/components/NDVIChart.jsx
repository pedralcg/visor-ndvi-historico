// frontend/src/components/NDVIChart.jsx - Actualizado para multi-índice
import React, { memo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { COLORS, TYPOGRAPHY, RADIUS, SPACING } from "../styles/designTokens";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const NDVIChart = memo(({ ndviHistory = [], indexName = "NDVI" }) => {
  const historyAvailable = ndviHistory.length > 0;

  if (!historyAvailable) {
    return (
      <div
        style={{
          minHeight: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: COLORS.TEXT_SECONDARY,
          fontSize: TYPOGRAPHY.FONT_SIZES.SM,
          padding: SPACING[5],
          background: COLORS.BACKGROUND_SECONDARY,
          borderRadius: RADIUS.LG,
          border: `1px solid ${COLORS.BORDER}`,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              marginBottom: SPACING[2],
              fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD,
            }}
          >
            📊 Sin historial disponible
          </p>
          <p
            style={{
              margin: 0,
              fontSize: TYPOGRAPHY.FONT_SIZES.XS,
              lineHeight: TYPOGRAPHY.LINE_HEIGHTS.NORMAL,
            }}
          >
            Selecciona un área y calcula el índice en varias fechas
            <br />
            para ver la evolución temporal.
          </p>
        </div>
      </div>
    );
  }

  // Configuración de colores por índice usando Design Tokens
  const indexConfig = {
    NDVI: {
      borderColor: COLORS.SECONDARY, // Emerald
      backgroundColor: `${COLORS.SECONDARY}26`, // 15% opacity approx
      label: "NDVI",
      min: -0.2,
      max: 1.0,
    },
    NBR: {
      borderColor: COLORS.WARNING, // Amber
      backgroundColor: `${COLORS.WARNING}26`,
      label: "NBR",
      min: -0.5,
      max: 1.0,
    },
    CIre: {
      borderColor: COLORS.TERTIARY, // Purple
      backgroundColor: `${COLORS.TERTIARY}26`,
      label: "CIre",
      min: 0,
      max: 5.0,
    },
    MSI: {
      borderColor: COLORS.ACCENT, // Red
      backgroundColor: `${COLORS.ACCENT}26`,
      label: "MSI",
      min: 0,
      max: 3.0,
    },
  };

  const config = indexConfig[indexName] || indexConfig.NDVI;

  const labels = ndviHistory.map((item) => item.date);
  const dataValues = ndviHistory.map((item) => item.mean_ndvi);

  const data = {
    labels: labels,
    datasets: [
      {
        label: `${config.label} medio`,
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        data: dataValues,
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: config.borderColor,
        pointBorderColor: COLORS.SURFACE,
        pointBorderWidth: 2,
        pointHoverBackgroundColor: config.borderColor,
        pointHoverBorderColor: COLORS.SURFACE,
        pointHoverBorderWidth: 3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        min: config.min,
        max: config.max,
        ticks: {
          color: COLORS.TEXT_SECONDARY,
          font: {
            size: 12, // Chart.js expects number for size
            weight: "500",
            family: TYPOGRAPHY.FONT_FAMILY,
          },
          callback: function (value) {
            return value.toFixed(2);
          },
        },
        grid: {
          color: COLORS.BORDER,
          lineWidth: 1,
        },
        title: {
          display: true,
          text: config.label,
          color: COLORS.TEXT_PRIMARY,
          font: {
            size: 13,
            weight: "700",
            family: TYPOGRAPHY.FONT_FAMILY,
          },
        },
      },
      x: {
        ticks: {
          color: COLORS.TEXT_SECONDARY,
          font: {
            size: 11,
            weight: "500",
            family: TYPOGRAPHY.FONT_FAMILY,
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: COLORS.BACKGROUND_SECONDARY,
          lineWidth: 1,
        },
        title: {
          display: true,
          text: "Fecha",
          color: COLORS.TEXT_PRIMARY,
          font: {
            size: 13,
            weight: "700",
            family: TYPOGRAPHY.FONT_FAMILY,
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            return `📅 ${context[0].label}`;
          },
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(4);
            }
            return label;
          },
        },
        backgroundColor: COLORS.TEXT_PRIMARY,
        titleColor: COLORS.SURFACE,
        bodyColor: COLORS.SURFACE,
        borderColor: config.borderColor,
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        titleFont: {
          size: 13,
          weight: "600",
          family: TYPOGRAPHY.FONT_FAMILY,
        },
        bodyFont: {
          size: 13,
          weight: "500",
          family: TYPOGRAPHY.FONT_FAMILY,
        },
        cornerRadius: 8,
      },
    },
  };

  return (
    <div
      style={{
        height: "200px",
        marginBottom: "0px",
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
});

export default NDVIChart;
