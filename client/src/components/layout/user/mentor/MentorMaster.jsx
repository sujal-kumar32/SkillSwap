import React from 'react'
import { Outlet } from 'react-router-dom'
import MentorNavbar from './MentorNavbar'

const MentorMaster = () => {
  return (
    <>
        <MentorNavbar/>
        <Outlet/>
    </>
  )
}

export default MentorMaster
