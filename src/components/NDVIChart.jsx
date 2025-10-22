// frontend/src/components/NDVIChart.jsx - Actualizado al tema claro
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NDVIChart = memo(({ ndviHistory = [] }) => {
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
          fontSize: "0.95rem",
          padding: 20,
          background: "rgba(250, 250, 249, 0.8)",
          borderRadius: "10px",
          border: "1px solid #e7e5e4",
        }}
      >
        <p>
          Selecciona un área y calcula el NDVI en varias fechas para ver la
          serie histórica.
        </p>
      </div>
    );
  }

  const labels = ndviHistory.map((item) => item.date);
  const dataValues = ndviHistory.map((item) => item.mean_ndvi);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "NDVI medio",
        borderColor: "#047857",
        backgroundColor: "rgba(4, 120, 87, 0.15)",
        data: dataValues,
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#047857",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointHoverBackgroundColor: "#047857",
        pointHoverBorderColor: "#ffffff",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 500, easing: "easeOutQuart" },
    scales: {
      y: {
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.1,
          color: "#57534e",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          color: "#e7e5e4",
          lineWidth: 1,
        },
        title: {
          display: true,
          text: "NDVI",
          color: "#1c1917",
          font: {
            size: 13,
            weight: "600",
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
        },
        grid: {
          color: "#f5f5f4",
          lineWidth: 1,
        },
        title: {
          display: true,
          text: "Fecha de la imagen",
          color: "#1c1917",
          font: {
            size: 13,
            weight: "600",
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(3);
            }
            return label;
          },
        },
        backgroundColor: "#1c1917",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#047857",
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        font: {
          size: 13,
        },
      },
    },
  };

  return (
    <div
      style={{
        height: "200px",
        marginBottom: "20px",
        padding: "15px",
        background: "#ffffff",
        borderRadius: "10px",
        border: "1px solid #e7e5e4",
        boxShadow: "0 1px 3px rgba(28, 25, 23, 0.08)",
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
});

export default NDVIChart;
