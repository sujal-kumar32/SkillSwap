import React from 'react'
import AdminSidebar from './AdminSidebar'
import { Outlet } from 'react-router-dom'
import './admin.css'

const AdminMaster = () => {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main bg-image">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminMaster
