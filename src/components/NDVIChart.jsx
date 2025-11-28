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
          color: "#78716c",
          fontSize: "0.9rem",
          padding: 20,
          background: "rgba(250, 250, 249, 0.8)",
          borderRadius: "10px",
          border: "1px solid #e7e5e4",
        }}
      >
        <div>
          <p style={{ margin: 0, marginBottom: 8, fontWeight: 600 }}>
            📊 Sin historial disponible
          </p>
          <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.5 }}>
            Selecciona un área y calcula el índice en varias fechas
            <br />
            para ver la evolución temporal.
          </p>
        </div>
      </div>
    );
  }

  // Configuración de colores por índice
  const indexConfig = {
    NDVI: {
      borderColor: "#047857",
      backgroundColor: "rgba(4, 120, 87, 0.15)",
      label: "NDVI",
      min: -0.2,
      max: 1.0,
    },
    NBR: {
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.15)",
      label: "NBR",
      min: -0.5,
      max: 1.0,
    },
    CIre: {
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.15)",
      label: "CIre",
      min: 0,
      max: 5.0,
    },
    MSI: {
      borderColor: "#dc2626",
      backgroundColor: "rgba(220, 38, 38, 0.15)",
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
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: config.borderColor,
        pointHoverBorderColor: "#ffffff",
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
          color: "#57534e",
          font: {
            size: 12,
            weight: "500",
          },
          callback: function (value) {
            return value.toFixed(2);
          },
        },
        grid: {
          color: "#e7e5e4",
          lineWidth: 1,
        },
        title: {
          display: true,
          text: config.label,
          color: "#1c1917",
          font: {
            size: 13,
            weight: "700",
          },
        },
      },
      x: {
        ticks: {
          color: "#57534e",
          font: {
            size: 11,
            weight: "500",
          },
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: "#f5f5f4",
          lineWidth: 1,
        },
        title: {
          display: true,
          text: "Fecha",
          color: "#1c1917",
          font: {
            size: 13,
            weight: "700",
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
        backgroundColor: "#1c1917",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: config.borderColor,
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        titleFont: {
          size: 13,
          weight: "600",
        },
        bodyFont: {
          size: 13,
          weight: "500",
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
