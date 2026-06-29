import React from 'react'

const PageLoader = ({ message = 'Loading...' }) => (
  <div className="page-loader">
    <div className="app-loading-spinner" />
    <p>{message}</p>
  </div>
)

export default PageLoader
