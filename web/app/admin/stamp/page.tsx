'use client'

import AdminStamp from "../@stamp/page"
import { mockStamp } from "@/mock"

export default function AdminStampPage() {
  return <AdminStamp mockStamp={mockStamp} admin={true} />
}