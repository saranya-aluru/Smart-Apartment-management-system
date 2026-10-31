import React, { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { LoadingSpinner } from "./LoadingSpinner";

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = "Search records...",
  searchFields = [],
  filterOptions = null, // [{ label, value }]
  filterKey = "status",
  defaultFilter = "ALL",
  actionButton = null,
  emptyTitle = "No records found",
  emptyMessage = "No items match your criteria."
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(defaultFilter);

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((item) => {
      // 1. Filter match
      if (filterOptions && selectedFilter !== "ALL") {
        const itemVal = item[filterKey] !== undefined ? String(item[filterKey]).toUpperCase() : "";
        if (itemVal !== String(selectedFilter).toUpperCase()) {
          return false;
        }
      }

      // 2. Search match
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(term);
        });
      }

      // Default: search all string / number fields
      return Object.values(item).some(
        (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, selectedFilter, filterOptions, filterKey, searchFields]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Controls Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: "260px" }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: 1, maxWidth: "340px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-muted)",
                pointerEvents: "none"
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "32px", fontSize: "0.85rem" }}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          {filterOptions && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Filter size={15} style={{ color: "var(--color-muted)" }} />
              <select
                className="form-select"
                style={{ width: "auto", fontSize: "0.85rem", padding: "0.45rem 0.75rem" }}
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Button */}
        {actionButton && <div>{actionButton}</div>}
      </div>

      {/* Table view */}
      {filteredData.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map((col, idx) => (
                    <th key={col.key || idx} style={col.headerStyle || {}}>
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, rowIdx) => (
                  <tr key={row.id || row.apartment_id || row.resident_id || row.request_id || row.staff_id || row.event_id || row.service_id || row.booking_id || rowIdx}>
                    {columns.map((col, colIdx) => (
                      <td key={col.key || colIdx} style={col.cellStyle || {}}>
                        {col.render ? col.render(row, rowIdx) : row[col.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--color-muted)", textAlign: "right" }}>
            Showing {filteredData.length} of {data.length} records
          </div>
        </>
      )}
    </div>
  );
};
