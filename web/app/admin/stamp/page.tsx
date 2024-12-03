'use client'

import AdminStamp from "../@stamp/page"

const mockStamp = [
    { id: 1, name: "Stamp 1" },
    { id: 2, name: "Stamp 2" },
    { id: 3, name: "Stamp 3" },
    { id: 4, name: "Stamp 4" },
    { id: 5, name: "Stamp 5" },
    { id: 6, name: "Stamp 6" },
    { id: 7, name: "Stamp 7" },
    { id: 8, name: "Stamp 8" },
    { id: 9, name: "Stamp 9" },
    { id: 10, name: "Stamp 10" },
]

export default function AdminStampPage() {
  return <AdminStamp mockStamp={mockStamp} admin={true} />
}