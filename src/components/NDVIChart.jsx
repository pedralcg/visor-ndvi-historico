// frontend/src/components/NDVIChart.jsx
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

// AHORA ACEPTA EL HISTORIAL COMPLETO
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
          color: "#546E7A",
          fontSize: "0.95rem",
          padding: 10,
          background: "#F5F7FA",
          borderRadius: 4,
        }}
      >
        <p>
          Selecciona un área y calcula el NDVI en varias fechas para ver la
          serie histórica.
        </p>
      </div>
    );
  }

  // Generar etiquetas y datos a partir del historial
  const labels = ndviHistory.map((item) => item.date);
  const dataValues = ndviHistory.map((item) => item.mean_ndvi);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "NDVI medio",
        // Color Azul Cian/Teal moderno
        borderColor: "#00B8D9",
        backgroundColor: "rgba(0, 184, 217, 0.2)",
        data: dataValues, // <-- Usar el array de valores
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 6,
        pointHoverRadius: 8,
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
        ticks: { stepSize: 0.1, color: "#3A4145" },
        grid: { color: "#E4E7EB" },
        title: { display: true, text: "NDVI", color: "#3A4145" },
      },
      x: {
        ticks: { color: "#3A4145" },
        grid: { color: "#E4E7EB" },
        title: { display: true, text: "Fecha de la imagen", color: "#3A4145" },
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
        backgroundColor: "rgba(58, 65, 69, 0.9)",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        borderColor: "#00B8D9",
        borderWidth: 1,
      },
    },
  };

  return (
    <div style={{ height: "180px", marginBottom: "20px" }}>
      <Line data={data} options={options} />
    </div>
  );
});

export default NDVIChart;
