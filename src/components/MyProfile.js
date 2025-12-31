import React from "react";

/**
 * MyProfile
 * - Lightweight user profile display
 * - Read-only (display only)
 * - Data source: localStorage
 */
export default function MyProfile() {
  // Fallback demo profile
  const profile = (() => {
    try {
      const raw = localStorage.getItem("userProfile");
      return raw
        ? JSON.parse(raw)
        : {
            username: "demo_user",
            email: "demo_user@example.com",
            phone: "+84 901 234 567",
            dataLabels: "New User"
          };
    } catch {
      return {};
    }
  })();

  return (
    <div className="d-flex align-items-center me-3">
      <div className="text-end me-3">
        <div className="fw-semibold text-dark">
          {profile.username}
        </div>
        <div className="small text-muted">
          {profile.email}
        </div>
      </div>

      <div className="border-start ps-3">
        <div className="small text-muted">
          📞 {profile.phone}
        </div>
        <div className="small fw-semibold text-primary">
          ⭐ {profile.dataLabels}
        </div>
      </div>
    </div>
  );
}
