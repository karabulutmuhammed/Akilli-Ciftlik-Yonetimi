import React, { useMemo, useState } from "react";

export default function SimpleTable({
  columns,
  rows,
  onEdit,
  onDelete
}) {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;

    const q = search.toLowerCase();

    return rows.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  return (
    <div className="panel simple-table scroll-x">

      <div className="table-toolbar">
        <div>
          <h3>Liste</h3>
          <div className="muted">
            Toplam {filteredRows.length} kayıt
          </div>
        </div>

        <input
          className="table-search"
          placeholder="🔍 Kayıt ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>İşlemler</th>
          </tr>
        </thead>

        <tbody>
          {filteredRows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1}>
                Henüz kayıt bulunamadı.
              </td>
            </tr>
          ) : (
            filteredRows.map((row) => (
              <tr key={row.id}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row)
                      : renderValue(row[col.key])}
                  </td>
                ))}

                <td>
                  <div className="actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => onEdit(row)}
                    >
                      ✏️ Düzenle
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => onDelete(row)}
                    >
                      🗑 Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function renderValue(value) {
  if (value === null || value === undefined || value === "") {
    return <span className="empty-cell">-</span>;
  }

  const text = String(value).toLowerCase();

  if (text.includes("aktif")) {
    return <span className="status active">Aktif</span>;
  }

  if (text.includes("satıldı")) {
    return <span className="status sold">Satıldı</span>;
  }

  if (text.includes("bekliyor")) {
    return <span className="status waiting">Bekliyor</span>;
  }

  if (text.includes("tamamlandı")) {
    return <span className="status completed">Tamamlandı</span>;
  }

  return value;
}