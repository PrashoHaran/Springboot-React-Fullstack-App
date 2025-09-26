import React, { useEffect, useMemo, useState } from "react";
import client from "../api/client";

const initialForm = { customerid: null, customername: "", customeraddress: "", mobile: "" };

export default function CustomerCrud() {
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("customerid");
  const [sortDir, setSortDir] = useState("asc");

  // --- load table ---
  async function load() {
    try {
      setLoading(true);
      setError("");
      const res = await client.get("/getAllCustomer");
      setCustomers(res.data || []);
    } catch (e) {
      setError("Failed to load customers.");
      // console.error(e);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // --- derived filtered/sorted rows ---
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? customers.filter(c =>
          String(c.customerid).includes(q) ||
          (c.customername || "").toLowerCase().includes(q) ||
          (c.customeraddress || "").toLowerCase().includes(q) ||
          String(c.mobile || "").includes(q)
        )
      : customers.slice();

    filtered.sort((a, b) => {
      const aV = a[sortKey];
      const bV = b[sortKey];
      if (aV === bV) return 0;
      const cmp = aV > bV ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return filtered;
  }, [customers, query, sortKey, sortDir]);

  // --- helpers ---
  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === "mobile" ? value.replace(/\D/g, "") : value }));
  };

  const validate = () => {
    if (!form.customername.trim()) return "Customer name is required.";
    if (!form.customeraddress.trim()) return "Address is required.";
    if (form.mobile && !/^\d{1,12}$/.test(form.mobile)) return "Mobile must be up to 12 digits.";
    return "";
  };

  // --- create or update ---
  async function onSubmit(e) {
    e.preventDefault();
    const msg = validate();
    if (msg) return alert(msg);

    try {
      setSaving(true);
      setError("");

      if (form.customerid == null) {
        // CREATE -> your backend expects CustomerSaveDTO {customername, customeraddress, mobile}
        const payload = {
          customername: form.customername,
          customeraddress: form.customeraddress,
          mobile: Number(form.mobile || 0),
        };
        await client.post("/save", payload);
        alert("Customer created.");
      } else {
        // UPDATE -> requires a PUT endpoint on backend (see snippet below)
        const payload = {
          customerid: form.customerid,
          customername: form.customername,
          customeraddress: form.customeraddress,
          mobile: Number(form.mobile || 0),
        };
        await client.put(`/update/${form.customerid}`, payload);
        alert("Customer updated.");
      }

      setForm(initialForm);
      await load();
    } catch (e) {
      setError("Save failed.");
      // console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function onEdit(row) {
    setForm({
      customerid: row.customerid,
      customername: row.customername || "",
      customeraddress: row.customeraddress || "",
      mobile: String(row.mobile ?? ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onDelete(id) {
    if (!window.confirm(`Delete customer #${id}?`)) return;
    try {
      setSaving(true);
      setError("");
      // requires DELETE endpoint (see backend snippet)
      await client.delete(`/delete/${id}`);
      await load();
      alert("Customer deleted.");
    } catch (e) {
      setError("Delete failed.");
      // console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const toggleSort = key => {
    if (key === sortKey) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Customer Details</h1>

      <form onSubmit={onSubmit} style={styles.card}>
        <div style={styles.row}>
          <label style={styles.label}>Customer Name</label>
          <input
            name="customername"
            value={form.customername}
            onChange={onChange}
            placeholder="e.g. John"
            style={styles.input}
          />
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Customer Address</label>
          <input
            name="customeraddress"
            value={form.customeraddress}
            onChange={onChange}
            placeholder="e.g. India"
            style={styles.input}
          />
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Mobile</label>
          <input
            name="mobile"
            value={form.mobile}
            onChange={onChange}
            placeholder="Digits only"
            style={styles.input}
            maxLength={12}
          />
        </div>

        <div style={styles.actions}>
          <button type="submit" disabled={saving} style={styles.primary}>
            {form.customerid == null ? "Register" : "Update"}
          </button>
          {form.customerid != null && (
            <button type="button" style={styles.ghost} onClick={() => setForm(initialForm)}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div style={{ ...styles.card, marginTop: 16 }}>
        <div style={styles.tableHeader}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by id, name, address or mobile…"
            style={styles.search}
          />
          <button onClick={load} disabled={loading} style={styles.smallBtn}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <Th onClick={() => toggleSort("customerid")} active={sortKey === "customerid"} dir={sortDir}>ID</Th>
                <Th onClick={() => toggleSort("customername")} active={sortKey === "customername"} dir={sortDir}>Name</Th>
                <Th onClick={() => toggleSort("customeraddress")} active={sortKey === "customeraddress"} dir={sortDir}>Address</Th>
                <Th onClick={() => toggleSort("mobile")} active={sortKey === "mobile"} dir={sortDir}>Mobile</Th>
                <th style={{ textAlign: "right", padding: "10px 12px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={5} style={styles.empty}>No customers</td></tr>
              )}
              {rows.map(row => (
                <tr key={row.customerid}>
                  <td style={styles.td}>{row.customerid}</td>
                  <td style={styles.td}>{row.customername}</td>
                  <td style={styles.td}>{row.customeraddress}</td>
                  <td style={styles.td}>{row.mobile}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <button style={styles.warn} onClick={() => onEdit(row)}>Edit</button>
                    <button style={styles.danger} onClick={() => onDelete(row.customerid)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* small header cell component */
function Th({ children, onClick, active, dir }) {
  return (
    <th
      onClick={onClick}
      style={{
        padding: "10px 12px",
        textAlign: "left",
        cursor: "pointer",
        userSelect: "none",
        whiteSpace: "nowrap",
        color: active ? "#111" : "#444",
      }}
      title="Sort"
    >
      {children} {active ? (dir === "asc" ? "▲" : "▼") : ""}
    </th>
  );
}

/* quick, clean inline styles */
const styles = {
  container: { maxWidth: 980, margin: "24px auto", padding: "0 16px", fontFamily: "system-ui, Arial" },
  title: { fontSize: 28, marginBottom: 12 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, boxShadow: "0 1px 2px rgba(0,0,0,.04)" },
  row: { display: "grid", gridTemplateColumns: "180px 1fr", gap: 12, alignItems: "center", marginBottom: 12 },
  label: { fontSize: 14, color: "#374151" },
  input: { height: 38, padding: "0 12px", border: "1px solid #d1d5db", borderRadius: 10, outline: "none" },
  actions: { display: "flex", gap: 8, marginTop: 8 },
  primary: { background: "#2563eb", color: "#fff", border: 0, padding: "10px 16px", borderRadius: 10, cursor: "pointer" },
  ghost: { background: "#eef2ff", color: "#1f2937", border: 0, padding: "10px 16px", borderRadius: 10, cursor: "pointer" },
  warn: { background: "#f59e0b", color: "#111827", border: 0, padding: "6px 10px", borderRadius: 8, marginRight: 6, cursor: "pointer" },
  danger: { background: "#ef4444", color: "#fff", border: 0, padding: "6px 10px", borderRadius: 8, cursor: "pointer" },
  tableHeader: { display: "flex", gap: 8, alignItems: "center", marginBottom: 10 },
  search: { flex: 1, height: 36, padding: "0 12px", border: "1px solid #d1d5db", borderRadius: 10 },
  smallBtn: { height: 36, borderRadius: 10, padding: "0 12px", border: "1px solid #d1d5db", background: "#f9fafb", cursor: "pointer" },
  table: { borderCollapse: "separate", borderSpacing: 0, width: "100%" },
  td: { padding: "10px 12px", borderTop: "1px solid #f3f4f6" },
  empty: { padding: 24, textAlign: "center", color: "#6b7280" },
};
