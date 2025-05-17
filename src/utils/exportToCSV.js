// utils/exportToCSV.js
export function exportToCSV(data, filename = "export.csv") {
    if (!data || !data.length) return;
  
    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")
    );
  
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  