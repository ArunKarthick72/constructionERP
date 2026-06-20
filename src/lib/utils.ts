import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy')
}

export function formatDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function generateProjectCode(count: number): string {
  const year = new Date().getFullYear()
  const seq = String(count + 1).padStart(3, '0')
  return `DA-${year}-${seq}`
}

export const ROLES = {
  MAESTRI: { en: 'Site Foreman / Supervisor', ta: 'மேஸ்திரி' },
  KOTHANAR: { en: 'Skilled Mason', ta: 'கொத்தனார்' },
  CHITTHAL: { en: 'Helper / Laborer', ta: 'சித்தாள்' },
  ENGINEER: { en: 'Engineer', ta: 'பொறியாளர்' },
  OTHER: { en: 'Other', ta: 'மற்றவை' },
}

export const MATERIAL_CATEGORIES = [
  {
    id: 'structural',
    name: 'Structural & Core Materials',
    nameTA: 'கட்டமைப்பு & மையப் பொருட்கள்',
    materials: ['Cement', 'Sand', 'Bricks', 'Steel', 'Blocks', 'Aggregate', 'M-Sand', 'P-Sand'],
  },
  {
    id: 'finishing',
    name: 'Finishing & Surface Materials',
    nameTA: 'மேற்பரப்பு பொருட்கள்',
    materials: ['Tiles', 'Granite', 'Marble', 'Stones', 'Wall Putty', 'Paint'],
  },
  {
    id: 'wood-metal',
    name: 'Wood, Metal & Openings',
    nameTA: 'மரம், உலோகம் & கதவுகள்',
    materials: ['Timber', 'Plywood', 'UPVC', 'Aluminum', 'Glass', 'MS Pipes', 'GI Sheets'],
  },
  {
    id: 'plumbing-electrical',
    name: 'Plumbing, Electrical & Binding Agents',
    nameTA: 'குழாய்கள், மின்சாரம் & இணைப்பு பொருட்கள்',
    materials: ['PVC Pipes', 'CPVC Pipes', 'Electrical Wires', 'Binding Wire', 'Waterproofing Compound', 'Adhesive'],
  },
]

export const PROJECT_STATUSES = {
  ACTIVE: { label: 'Active / செயலில்', badge: 'badge-green' },
  COMPLETED: { label: 'Completed / முடிந்தது', badge: 'badge-blue' },
  ON_HOLD: { label: 'On Hold / நிறுத்தம்', badge: 'badge-yellow' },
}

export const ENTRY_TYPES = {
  ADVANCE: { label: 'Advance / முன்பணம்', badge: 'badge-yellow' },
  RECEIPT: { label: 'Receipt / பெறப்பட்ட தொகை', badge: 'badge-green' },
  EXPENSE: { label: 'Expense / செலவு', badge: 'badge-red' },
  REFUND: { label: 'Refund / திரும்ப', badge: 'badge-blue' },
}

export const UNITS = ['Bags', 'KG', 'Ton', 'CFT', 'SqFt', 'RFt', 'Nos', 'Litre', 'Bundle', 'Box', 'Pair', 'Set', 'Meter', 'Running Mt']
