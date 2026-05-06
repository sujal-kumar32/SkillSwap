import React from 'react'
import AdminNavbar from './AdminNavbar'
import { Outlet } from 'react-router-dom'

const AdminMaster = () => {
  return (
    <>
        <AdminNavbar/>
        <Outlet/>
    </>
  )
}

export default AdminMaster
