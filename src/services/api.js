export async function fetchNdvi(geometry, start_date, end_date, scale) {
  const response = await fetch("http://localhost:5000/api/ndvi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ geometry, start_date, end_date, scale }),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
}
