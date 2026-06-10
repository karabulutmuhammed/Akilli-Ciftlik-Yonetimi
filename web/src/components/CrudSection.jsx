import React, { useEffect, useState } from "react";
import client from "../api/client";
import SimpleTable from "./SimpleTable";

export default function CrudSection({ title, endpoint, fields, columns, transformBeforeSave }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const calculateAutoFields = (nextForm) => {
    const quantity = Number(nextForm.quantity || 0);
    const unitPrice = Number(nextForm.unitPrice || 0);
  
    if ("quantity" in nextForm && "unitPrice" in nextForm) {
      nextForm.totalPrice = (quantity * unitPrice).toFixed(2);
    }
  
    return nextForm;
  };
  
  const updateField = (fieldName, value) => {
    setForm((prev) => {
      const nextForm = {
        ...prev,
        [fieldName]: value,
      };
  
      return calculateAutoFields(nextForm);
    });
  };

  async function load() {
    const { data } = await client.get(endpoint);
    setRows(data);
  }

  useEffect(() => { load().catch(() => setError("Kayıtlar yüklenemedi.")); }, [endpoint]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload = transformBeforeSave ? transformBeforeSave(form) : form;
      if (editingId) {
        await client.put(`${endpoint}/${editingId}`, payload);
        setMessage("Kayıt güncellendi.");
      } else {
        await client.post(endpoint, payload);
        setMessage("Kayıt eklendi.");
      }
      setForm({});
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "İşlem başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (row) => {
    setEditingId(row.id);
    setForm(row);
    setMessage("");
    setError("");
  };

  const remove = async (row) => {
    if (!confirm("Silinsin mi?")) return;
    try {
      await client.delete(`${endpoint}/${row.id}`);
      setMessage("Kayıt silindi.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Silme başarısız.");
    }
  };

  return (
    <section className="crud-section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          <div className="muted">Ekleme, güncelleme ve silme bu bölümden yönetilir.</div>
        </div>
        <span className="badge">{rows.length} kayıt</span>
      </div>
      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}
      <div className="split improved">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="form-grid improved">
            {fields.map((field) => {
              const value = form[field.name] ?? field.defaultValue ?? "";
              const common = {
                key: field.name,
                value,
                onChange: (e) => updateField(field.name, e.target.value)
              };
              return (
                <label className={field.type === "textarea" ? "field full" : "field"} key={field.name}>
                  <span>{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea {...common} rows={4} placeholder={field.placeholder || field.label} />
                  ) : field.type === "select" ? (
                    <select {...common}>
                      {!field.hideEmptyOption && <option value="">{field.emptyLabel || "Seçiniz"}</option>}
                      {(field.options || []).map((opt) => {
                        const value = typeof opt === "object" ? opt.value : opt;
                        const label = typeof opt === "object" ? opt.label : opt;
                        return <option key={String(value)} value={value}>{label}</option>;
                      })}
                    </select>
                  ) : field.name === "totalPrice" ? (
                    <div className="price-preview">
                      <input
                        {...common}
                        readOnly
                        className="readonly-input"
                      />
                      <span>₺</span>
                    </div>
                  ) : (
                    <input
                      {...common}
                      type={field.type || "text"}
                      placeholder={field.placeholder || field.label}
                    />
                  )}
                </label>
              );
            })}
            <div className="flex form-actions full">
              <button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : editingId ? "Güncelle" : "Kaydet"}</button>
              <button type="button" className="secondary" onClick={() => { setForm({}); setEditingId(null); setError(""); setMessage(""); }}>
                Temizle
              </button>
            </div>
          </div>
        </form>
        <SimpleTable columns={columns} rows={rows} onEdit={edit} onDelete={remove} />
      </div>
    </section>
  );
}