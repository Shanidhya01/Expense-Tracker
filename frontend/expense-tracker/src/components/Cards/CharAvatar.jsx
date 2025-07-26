import React from 'react'
import { getInitials } from '../../utils/helper'

const CharAvatar = ({fullName, width, height, style}) => {
  return (
    <div className={`${width || "w-20"} ${height || "h-20"} ${style || ''} flex items-center justify-center rounded-full text-shadow-gray-900 font-medium bg-gray-100`}>
      {getInitials(fullName || "")}
    </div>
  )
}

export default CharAvatar
