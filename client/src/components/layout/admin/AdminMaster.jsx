import React, { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import { Outlet } from 'react-router-dom'
import './admin.css'

const AdminMaster = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-shell">
      <AdminSidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`sidebar-backdrop${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />
      <main className="admin-main bg-image">
        <div className="d-flex align-items-center gap-2 mb-3 d-lg-none">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fa fa-bars" />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminMaster
