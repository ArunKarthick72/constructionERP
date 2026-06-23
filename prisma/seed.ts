import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Deivenei Associates ERP with full demo data...')

  // ─── Admin User ──────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@deivenei.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@deivenei.com', password: hashedPassword, role: 'ADMIN' },
  })
  console.log('✅ Admin user ready')

  // ─── Site Supervisor User ──────────────────────────────────────────────────
  const supervisorPassword = await bcrypt.hash('super123', 12)
  await prisma.user.upsert({
    where: { email: 'supervisor@deivenei.com' },
    update: {},
    create: { name: 'Supervisor User', email: 'supervisor@deivenei.com', password: supervisorPassword, role: 'SUPERVISOR' },
  })
  console.log('✅ Supervisor user ready')

  // ─── Accountant User ───────────────────────────────────────────────────────
  const accountantPassword = await bcrypt.hash('account123', 12)
  await prisma.user.upsert({
    where: { email: 'accountant@deivenei.com' },
    update: {},
    create: { name: 'Accountant User', email: 'accountant@deivenei.com', password: accountantPassword, role: 'ACCOUNTANT' },
  })
  console.log('✅ Accountant user ready')

  // ─── Material Categories ──────────────────────────────────────────────────
  const [structural, finishing, woodMetal, plumbing] = await Promise.all([
    prisma.materialCategory.upsert({ where: { name: 'Structural & Core Materials' }, update: {}, create: { name: 'Structural & Core Materials', nameTA: 'கட்டமைப்பு & மையப் பொருட்கள்', sortOrder: 1 } }),
    prisma.materialCategory.upsert({ where: { name: 'Finishing & Surface Materials' }, update: {}, create: { name: 'Finishing & Surface Materials', nameTA: 'மேற்பரப்பு & அலங்கார பொருட்கள்', sortOrder: 2 } }),
    prisma.materialCategory.upsert({ where: { name: 'Wood, Metal & Openings' }, update: {}, create: { name: 'Wood, Metal & Openings', nameTA: 'மரம், உலோகம் & கதவு சாளரங்கள்', sortOrder: 3 } }),
    prisma.materialCategory.upsert({ where: { name: 'Plumbing, Electrical & Binding Agents' }, update: {}, create: { name: 'Plumbing, Electrical & Binding Agents', nameTA: 'குழாய்கள், மின்சாரம் & இணைப்பு', sortOrder: 4 } }),
  ])
  console.log('✅ Categories ready')

  // ─── Materials ────────────────────────────────────────────────────────────
  const materialDefs = [
    { name: 'Cement (OPC 53)', nameTA: 'சிமெண்ட்', unit: 'Bags', categoryId: structural.id },
    { name: 'River Sand', nameTA: 'ஆற்று மணல்', unit: 'CFT', categoryId: structural.id },
    { name: 'M-Sand', nameTA: 'எம் மணல்', unit: 'CFT', categoryId: structural.id },
    { name: 'P-Sand', nameTA: 'பி மணல்', unit: 'CFT', categoryId: structural.id },
    { name: 'Red Bricks', nameTA: 'செங்கல்', unit: 'Nos', categoryId: structural.id },
    { name: 'Steel TMT Bar', nameTA: 'ஸ்டீல் TMT', unit: 'KG', categoryId: structural.id },
    { name: 'Hollow Blocks (6")', nameTA: 'கான்கிரீட் தொகுதிகள்', unit: 'Nos', categoryId: structural.id },
    { name: 'Coarse Aggregate (20mm)', nameTA: 'கரடு கூழ்', unit: 'CFT', categoryId: structural.id },
    { name: 'Fly Ash Bricks', nameTA: 'ஃபை ஆஷ் செங்கல்', unit: 'Nos', categoryId: structural.id },
    { name: 'Floor Tiles (2x2)', nameTA: 'தரைத் கட்டங்கள்', unit: 'SqFt', categoryId: finishing.id },
    { name: 'Wall Tiles (1x2)', nameTA: 'சுவர் கட்டங்கள்', unit: 'SqFt', categoryId: finishing.id },
    { name: 'Granite (Kitchen)', nameTA: 'கிரானைட்', unit: 'SqFt', categoryId: finishing.id },
    { name: 'Marble Flooring', nameTA: 'பளிங்கு', unit: 'SqFt', categoryId: finishing.id },
    { name: 'Wall Putty', nameTA: 'சுவர் பட்டி', unit: 'KG', categoryId: finishing.id },
    { name: 'Asian Paints Interior', nameTA: 'உட்புற வர்ணம்', unit: 'Litre', categoryId: finishing.id },
    { name: 'Weathershield Exterior Paint', nameTA: 'வெளிப்புற வர்ணம்', unit: 'Litre', categoryId: finishing.id },
    { name: 'Teak Timber', nameTA: 'தேக்கு மரம்', unit: 'CFT', categoryId: woodMetal.id },
    { name: 'Plywood 18mm BWR', nameTA: 'பிளைவுட்', unit: 'Nos', categoryId: woodMetal.id },
    { name: 'UPVC Window Frame', nameTA: 'யுபிவிசி சாளரம்', unit: 'Nos', categoryId: woodMetal.id },
    { name: 'Aluminium Main Door', nameTA: 'அலுமினியம் கதவு', unit: 'Nos', categoryId: woodMetal.id },
    { name: 'Float Glass (5mm)', nameTA: 'கண்ணாடி', unit: 'SqFt', categoryId: woodMetal.id },
    { name: 'PVC Pipe (4")', nameTA: 'பிவிசி குழாய்', unit: 'RFt', categoryId: plumbing.id },
    { name: 'CPVC Pipe (1/2")', nameTA: 'சிபிவிசி குழாய்', unit: 'RFt', categoryId: plumbing.id },
    { name: 'Finolex Electrical Wire 6sqmm', nameTA: 'மின் கம்பி', unit: 'Meter', categoryId: plumbing.id },
    { name: 'Binding Wire (18 gauge)', nameTA: 'கட்டு கம்பி', unit: 'KG', categoryId: plumbing.id },
    { name: 'Dr. Fixit Waterproofing', nameTA: 'நீர்த்தடுப்பு கலவை', unit: 'KG', categoryId: plumbing.id },
    { name: 'Tile Adhesive (BAL)', nameTA: 'கட்ட பசை', unit: 'Bags', categoryId: plumbing.id },
  ]

  const materials: Record<string, string> = {}
  for (const mat of materialDefs) {
    const existing = await prisma.material.findFirst({ where: { name: mat.name } })
    if (existing) {
      materials[mat.name] = existing.id
    } else {
      const created = await prisma.material.create({ data: mat })
      materials[mat.name] = created.id
    }
  }
  console.log('✅ Materials ready')

  // ─── Suppliers ────────────────────────────────────────────────────────────
  const supplierDefs = [
    { name: 'Arun Cement Traders', contactName: 'Arun Kumar', phone: '9843012345', email: 'arun@cementtraders.com', address: 'Anna Salai, Chennai - 600002', gstin: '33AABCA1234A1ZS', notes: 'Best cement prices in city' },
    { name: 'Sri Murugan Sand & Aggregate', contactName: 'Murugan', phone: '9751023456', email: '', address: 'Poonamallee, Chennai - 600056', gstin: '', notes: 'River sand and M-sand supplier' },
    { name: 'Vetri Steel Industries', contactName: 'Vetri Selvan', phone: '9600134567', email: 'vetri@steelind.in', address: 'Ambattur Industrial Estate, Chennai', gstin: '33AACVS5678B1ZT', notes: 'TMT bars and binding wire' },
    { name: 'Raja Bricks & Blocks', contactName: 'Raja Gopal', phone: '9442245678', email: '', address: 'Thiruvallur, Tamil Nadu - 602001', gstin: '', notes: 'Red bricks and hollow blocks' },
    { name: 'Shree Tiles Palace', contactName: 'Suresh Babu', phone: '9500356789', email: 'shreeTiles@gmail.com', address: 'T. Nagar, Chennai - 600017', gstin: '33ABCST9012C1ZP', notes: 'Floor and wall tiles, granite' },
    { name: 'Mani Paints & Hardware', contactName: 'Mani Raj', phone: '9345467890', email: '', address: 'Vadapalani, Chennai - 600026', gstin: '', notes: 'Paints, putty and hardware' },
    { name: 'Selvam Timber & Ply', contactName: 'Selvam', phone: '9841578901', email: 'selvam.timber@gmail.com', address: 'Arumbakkam, Chennai - 600106', gstin: '33AAFST3456D1ZQ', notes: 'Teak wood and plywood' },
    { name: 'Kumar UPVC Solutions', contactName: 'Senthil Kumar', phone: '9789689012', email: 'kumar.upvc@outlook.com', address: 'Mogappair, Chennai - 600037', gstin: '33AAKKU7890E1ZR', notes: 'UPVC doors, windows and aluminum' },
    { name: 'Plumbing Pro Supplies', contactName: 'Balu Rajan', phone: '9677790123', email: '', address: 'Koyambedu, Chennai - 600107', gstin: '', notes: 'PVC, CPVC pipes and fittings' },
    { name: 'Electro Wires & Co', contactName: 'Kannan', phone: '9543801234', email: 'kannan.electro@gmail.com', address: 'Guindy, Chennai - 600032', gstin: '33AAFEW2345F1ZS', notes: 'Finolex wires and electrical items' },
    { name: 'Durga Waterproofing', contactName: 'Priya Durga', phone: '9791912345', email: '', address: 'Velachery, Chennai - 600042', gstin: '', notes: 'Dr. Fixit and waterproofing compounds' },
    { name: 'Sri Venkat Granite Works', contactName: 'Venkat', phone: '9841023456', email: 'venkat.granite@gmail.com', address: 'Chromepet, Chennai - 600044', gstin: '33AABVG6789G1ZT', notes: 'Granite and marble flooring' },
  ]

  const supplierIds: string[] = []
  for (const sup of supplierDefs) {
    const existing = await prisma.supplier.findFirst({ where: { name: sup.name } })
    if (existing) {
      supplierIds.push(existing.id)
    } else {
      const created = await prisma.supplier.create({ data: sup })
      supplierIds.push(created.id)
    }
  }
  console.log(`✅ ${supplierIds.length} Suppliers ready`)

  // ─── Projects ────────────────────────────────────────────────────────────
  const projectDefs = [
    { ownerName: 'Rajesh Kumar', ownerPhone: '9841001001', siteLocation: 'Plot 42, Perambur, Chennai - 600011', startDate: new Date('2024-01-15'), status: 'COMPLETED', totalBudget: 3500000, notes: 'G+1 residential house, 1200 sqft' },
    { ownerName: 'Lakshmi Devi', ownerPhone: '9842002002', siteLocation: 'Door 7, Kolathur, Chennai - 600099', startDate: new Date('2024-03-01'), endDate: new Date('2024-11-30'), status: 'COMPLETED', totalBudget: 2800000, notes: 'Ground floor + stilt parking' },
    { ownerName: 'Anand Krishnamurthy', ownerPhone: '9843003003', siteLocation: 'Site 15, Mogappair West, Chennai - 600037', startDate: new Date('2024-06-01'), status: 'ACTIVE', totalBudget: 5200000, notes: 'G+2 duplex villa, 2400 sqft' },
    { ownerName: 'Meena Sundaram', ownerPhone: '9844004004', siteLocation: 'No.88, Ambattur, Chennai - 600053', startDate: new Date('2024-07-15'), status: 'ACTIVE', totalBudget: 1800000, notes: 'Commercial shop complex' },
    { ownerName: 'Suresh Balamurali', ownerPhone: '9845005005', siteLocation: 'SF 301, Poonamallee, Chennai - 600056', startDate: new Date('2024-08-01'), status: 'ACTIVE', totalBudget: 4100000, notes: 'G+1 house with terrace' },
    { ownerName: 'Priya Ganesh', ownerPhone: '9846006006', siteLocation: 'Plot 9, Avadi, Chennai - 600054', startDate: new Date('2024-09-01'), status: 'ACTIVE', totalBudget: 2200000, notes: 'Compact 900 sqft home' },
    { ownerName: 'Ravi Shankar', ownerPhone: '9847007007', siteLocation: 'No.5, Thiruvottiyur, Chennai - 600019', startDate: new Date('2024-10-01'), status: 'ACTIVE', totalBudget: 6500000, notes: '3-storey apartment (6 flats)' },
    { ownerName: 'Kamala Narayanan', ownerPhone: '9848008008', siteLocation: 'Block 3, Pallavaram, Chennai - 600043', startDate: new Date('2024-11-15'), status: 'ON_HOLD', totalBudget: 3000000, notes: 'G+1, on hold due to legal clearance' },
    { ownerName: 'Dinesh Selvam', ownerPhone: '9849009009', siteLocation: 'Plot 21, Madipakkam, Chennai - 600091', startDate: new Date('2025-01-01'), status: 'ACTIVE', totalBudget: 2600000, notes: 'New residential construction' },
    { ownerName: 'Vijaya Mani', ownerPhone: '9850010010', siteLocation: 'Sector 4, Anna Nagar, Chennai - 600040', startDate: new Date('2025-02-01'), status: 'ACTIVE', totalBudget: 7800000, notes: 'Luxury bungalow, 3500 sqft' },
    { ownerName: 'Bharathi Krishnan', ownerPhone: '9851011011', siteLocation: 'No.12, Velachery, Chennai - 600042', startDate: new Date('2025-03-15'), status: 'ACTIVE', totalBudget: 4500000, notes: 'Independent house G+2' },
    { ownerName: 'Karthik Sundaresan', ownerPhone: '9852012012', siteLocation: 'Plot 77, Chromepet, Chennai - 600044', startDate: new Date('2025-04-01'), status: 'ACTIVE', totalBudget: 3200000, notes: 'Home renovation + extension' },
  ]

  const projectIds: string[] = []
  const projectCount = await prisma.project.count()
  for (let i = 0; i < projectDefs.length; i++) {
    const existing = await prisma.project.findFirst({ where: { ownerName: projectDefs[i].ownerName } })
    if (existing) {
      projectIds.push(existing.id)
    } else {
      const year = projectDefs[i].startDate.getFullYear()
      const seq = String(projectCount + i + 1).padStart(3, '0')
      const projectCode = `DA-${year}-${seq}`
      const created = await prisma.project.create({ data: { projectCode, ...projectDefs[i] } })
      projectIds.push(created.id)
    }
  }
  console.log(`✅ ${projectIds.length} Projects ready`)

  // ─── Financial Entries ────────────────────────────────────────────────────
  const financialDefs = [
    { projectId: projectIds[0], entryType: 'ADVANCE', amount: 500000, description: 'Initial advance payment', entryDate: new Date('2024-01-20'), referenceNo: 'CHQ-001' },
    { projectId: projectIds[0], entryType: 'RECEIPT', amount: 800000, description: 'Slab work completion payment', entryDate: new Date('2024-04-15'), referenceNo: 'UPI-2345' },
    { projectId: projectIds[0], entryType: 'RECEIPT', amount: 700000, description: 'Finishing stage payment', entryDate: new Date('2024-08-10'), referenceNo: 'NEFT-6789' },
    { projectId: projectIds[1], entryType: 'ADVANCE', amount: 400000, description: 'Mobilization advance', entryDate: new Date('2024-03-05'), referenceNo: 'CHQ-002' },
    { projectId: projectIds[1], entryType: 'RECEIPT', amount: 600000, description: 'Foundation completion', entryDate: new Date('2024-05-20'), referenceNo: 'UPI-3456' },
    { projectId: projectIds[1], entryType: 'RECEIPT', amount: 500000, description: 'Roofing work payment', entryDate: new Date('2024-09-15'), referenceNo: 'CHQ-003' },
    { projectId: projectIds[2], entryType: 'ADVANCE', amount: 700000, description: 'Project advance', entryDate: new Date('2024-06-05'), referenceNo: 'NEFT-001' },
    { projectId: projectIds[2], entryType: 'RECEIPT', amount: 900000, description: '1st floor slab payment', entryDate: new Date('2024-10-01'), referenceNo: 'UPI-4567' },
    { projectId: projectIds[3], entryType: 'ADVANCE', amount: 300000, description: 'Commercial project advance', entryDate: new Date('2024-07-20'), referenceNo: 'CHQ-004' },
    { projectId: projectIds[3], entryType: 'RECEIPT', amount: 450000, description: 'Shell structure payment', entryDate: new Date('2024-11-01'), referenceNo: 'UPI-5678' },
    { projectId: projectIds[4], entryType: 'ADVANCE', amount: 600000, description: 'Work order advance', entryDate: new Date('2024-08-10'), referenceNo: 'NEFT-002' },
    { projectId: projectIds[5], entryType: 'ADVANCE', amount: 350000, description: 'Advance payment', entryDate: new Date('2024-09-10'), referenceNo: 'CHQ-005' },
    { projectId: projectIds[6], entryType: 'ADVANCE', amount: 1000000, description: 'Apartment project advance', entryDate: new Date('2024-10-05'), referenceNo: 'NEFT-003' },
    { projectId: projectIds[7], entryType: 'ADVANCE', amount: 250000, description: 'Initial token advance', entryDate: new Date('2024-11-20'), referenceNo: 'CHQ-006' },
    { projectId: projectIds[8], entryType: 'ADVANCE', amount: 400000, description: 'New project advance', entryDate: new Date('2025-01-05'), referenceNo: 'UPI-6789' },
    { projectId: projectIds[9], entryType: 'ADVANCE', amount: 1200000, description: 'Luxury bungalow advance', entryDate: new Date('2025-02-05'), referenceNo: 'NEFT-004' },
    { projectId: projectIds[9], entryType: 'RECEIPT', amount: 1500000, description: '2nd installment', entryDate: new Date('2025-04-15'), referenceNo: 'CHQ-007' },
    { projectId: projectIds[10], entryType: 'ADVANCE', amount: 650000, description: 'Project advance', entryDate: new Date('2025-03-20'), referenceNo: 'UPI-7890' },
    { projectId: projectIds[11], entryType: 'ADVANCE', amount: 500000, description: 'Renovation advance', entryDate: new Date('2025-04-05'), referenceNo: 'NEFT-005' },
    { projectId: projectIds[0], entryType: 'EXPENSE', amount: 45000, description: 'Site clearance & leveling', entryDate: new Date('2024-01-18'), referenceNo: '' },
  ]

  for (const fin of financialDefs) {
    const existing = await prisma.financialEntry.findFirst({ where: { projectId: fin.projectId, entryDate: fin.entryDate, amount: fin.amount } })
    if (!existing) await prisma.financialEntry.create({ data: fin })
  }
  console.log(`✅ ${financialDefs.length} Financial entries ready`)

  // ─── Employees ────────────────────────────────────────────────────────────
  const employeeDefs = [
    { name: 'Murugesan P', phone: '9876543201', role: 'MAESTRI', dailyWage: 1200, monthlyWage: null, joinDate: new Date('2022-01-01'), notes: 'Senior site foreman, 15 years exp' },
    { name: 'Subramaniam K', phone: '9765432102', role: 'MAESTRI', dailyWage: 1100, monthlyWage: null, joinDate: new Date('2022-06-01'), notes: 'Masonry specialist' },
    { name: 'Arumugam V', phone: '9654321203', role: 'KOTHANAR', dailyWage: 900, monthlyWage: null, joinDate: new Date('2023-01-15'), notes: 'Skilled brick layer' },
    { name: 'Selvakumar R', phone: '9543210304', role: 'KOTHANAR', dailyWage: 850, monthlyWage: null, joinDate: new Date('2023-03-01'), notes: 'Plastering specialist' },
    { name: 'Kandasamy S', phone: '9432109405', role: 'KOTHANAR', dailyWage: 800, monthlyWage: null, joinDate: new Date('2023-06-01'), notes: 'Tile fixing expert' },
    { name: 'Manikandan T', phone: '9321098506', role: 'CHITTHAL', dailyWage: 600, monthlyWage: null, joinDate: new Date('2023-07-01'), notes: 'Helper laborer' },
    { name: 'Rajan B', phone: '9210987607', role: 'CHITTHAL', dailyWage: 600, monthlyWage: null, joinDate: new Date('2023-07-15'), notes: 'Material handling' },
    { name: 'Periyasamy G', phone: '9109876708', role: 'CHITTHAL', dailyWage: 550, monthlyWage: null, joinDate: new Date('2023-09-01'), notes: 'General helper' },
    { name: 'Govindasamy H', phone: '9098765809', role: 'CHITTHAL', dailyWage: 550, monthlyWage: null, joinDate: new Date('2024-01-01'), notes: 'Site cleaner & helper' },
    { name: 'Sathiyamurthy L', phone: '8987654910', role: 'CHITTHAL', dailyWage: 600, monthlyWage: null, joinDate: new Date('2024-02-01'), notes: 'Scaffolding helper' },
    { name: 'Anbarasan N', phone: '8876543011', role: 'ENGINEER', dailyWage: null, monthlyWage: 35000, joinDate: new Date('2022-06-15'), notes: 'Civil engineer, site supervision' },
    { name: 'Karthikeyan M', phone: '8765432112', role: 'ENGINEER', dailyWage: null, monthlyWage: 32000, joinDate: new Date('2023-01-01'), notes: 'Structural designer' },
    { name: 'Logesh P', phone: '8654321213', role: 'MAESTRI', dailyWage: 950, monthlyWage: null, joinDate: new Date('2023-05-01'), notes: 'Electrical & plumbing supervisor' },
  ]

  const employeeIds: string[] = []
  for (const emp of employeeDefs) {
    const existing = await prisma.employee.findFirst({ where: { name: emp.name } })
    if (existing) {
      employeeIds.push(existing.id)
    } else {
      const created = await prisma.employee.create({ data: emp })
      employeeIds.push(created.id)
    }
  }
  console.log(`✅ ${employeeIds.length} Employees ready`)

  // ─── Purchases (with stock ledger) ───────────────────────────────────────
  const purchaseDefs = [
    { projectId: projectIds[0], supplierId: supplierIds[0], materialName: 'Cement (OPC 53)', quantity: 500, unit: 'Bags', unitPrice: 390, purchaseDate: new Date('2024-01-25'), invoiceNo: 'INV-ACT-001', notes: 'Foundation work cement' },
    { projectId: projectIds[0], supplierId: supplierIds[1], materialName: 'River Sand', quantity: 800, unit: 'CFT', unitPrice: 45, purchaseDate: new Date('2024-02-01'), invoiceNo: 'INV-SMA-001', notes: 'Plastering sand' },
    { projectId: projectIds[0], supplierId: supplierIds[2], materialName: 'Steel TMT Bar', quantity: 3000, unit: 'KG', unitPrice: 72, purchaseDate: new Date('2024-02-10'), invoiceNo: 'INV-VSI-001', notes: 'Column & beam steel' },
    { projectId: projectIds[0], supplierId: supplierIds[3], materialName: 'Red Bricks', quantity: 15000, unit: 'Nos', unitPrice: 8.5, purchaseDate: new Date('2024-03-01'), invoiceNo: 'INV-RBB-001', notes: 'Wall brickwork' },
    { projectId: projectIds[1], supplierId: supplierIds[0], materialName: 'Cement (OPC 53)', quantity: 400, unit: 'Bags', unitPrice: 395, purchaseDate: new Date('2024-03-10'), invoiceNo: 'INV-ACT-002', notes: 'RCC work' },
    { projectId: projectIds[1], supplierId: supplierIds[1], materialName: 'M-Sand', quantity: 600, unit: 'CFT', unitPrice: 40, purchaseDate: new Date('2024-03-15'), invoiceNo: 'INV-SMA-002', notes: 'Masonry work' },
    { projectId: projectIds[2], supplierId: supplierIds[0], materialName: 'Cement (OPC 53)', quantity: 700, unit: 'Bags', unitPrice: 392, purchaseDate: new Date('2024-06-15'), invoiceNo: 'INV-ACT-003', notes: 'Villa construction' },
    { projectId: projectIds[2], supplierId: supplierIds[2], materialName: 'Steel TMT Bar', quantity: 5000, unit: 'KG', unitPrice: 73, purchaseDate: new Date('2024-06-20'), invoiceNo: 'INV-VSI-002', notes: 'Duplex steel works' },
    { projectId: projectIds[2], supplierId: supplierIds[4], materialName: 'Floor Tiles (2x2)', quantity: 2400, unit: 'SqFt', unitPrice: 55, purchaseDate: new Date('2024-09-01'), invoiceNo: 'INV-STP-001', notes: 'Entire floor tiling' },
    { projectId: projectIds[2], supplierId: supplierIds[11], materialName: 'Granite (Kitchen)', quantity: 120, unit: 'SqFt', unitPrice: 180, purchaseDate: new Date('2024-09-15'), invoiceNo: 'INV-SVG-001', notes: 'Kitchen countertop' },
    { projectId: projectIds[3], supplierId: supplierIds[3], materialName: 'Hollow Blocks (6")', quantity: 8000, unit: 'Nos', unitPrice: 32, purchaseDate: new Date('2024-07-25'), invoiceNo: 'INV-RBB-002', notes: 'Commercial block walls' },
    { projectId: projectIds[4], supplierId: supplierIds[0], materialName: 'Cement (OPC 53)', quantity: 600, unit: 'Bags', unitPrice: 388, purchaseDate: new Date('2024-08-15'), invoiceNo: 'INV-ACT-004', notes: 'Foundation & slab' },
    { projectId: projectIds[4], supplierId: supplierIds[1], materialName: 'P-Sand', quantity: 500, unit: 'CFT', unitPrice: 42, purchaseDate: new Date('2024-08-20'), invoiceNo: 'INV-SMA-003', notes: 'Plastering work' },
    { projectId: projectIds[5], supplierId: supplierIds[3], materialName: 'Red Bricks', quantity: 8000, unit: 'Nos', unitPrice: 8.8, purchaseDate: new Date('2024-09-10'), invoiceNo: 'INV-RBB-003', notes: 'Wall construction' },
    { projectId: projectIds[6], supplierId: supplierIds[0], materialName: 'Cement (OPC 53)', quantity: 1200, unit: 'Bags', unitPrice: 385, purchaseDate: new Date('2024-10-10'), invoiceNo: 'INV-ACT-005', notes: 'Apartment concrete work' },
    { projectId: projectIds[6], supplierId: supplierIds[2], materialName: 'Steel TMT Bar', quantity: 10000, unit: 'KG', unitPrice: 74, purchaseDate: new Date('2024-10-15'), invoiceNo: 'INV-VSI-003', notes: 'Structural steel' },
    { projectId: projectIds[7], supplierId: supplierIds[0], materialName: 'Cement (OPC 53)', quantity: 300, unit: 'Bags', unitPrice: 390, purchaseDate: new Date('2024-11-25'), invoiceNo: 'INV-ACT-006', notes: 'Ongoing work' },
    { projectId: projectIds[8], supplierId: supplierIds[1], materialName: 'Coarse Aggregate (20mm)', quantity: 400, unit: 'CFT', unitPrice: 52, purchaseDate: new Date('2025-01-10'), invoiceNo: 'INV-SMA-004', notes: 'Foundation aggregate' },
    { projectId: projectIds[9], supplierId: supplierIds[6], materialName: 'Teak Timber', quantity: 150, unit: 'CFT', unitPrice: 850, purchaseDate: new Date('2025-03-01'), invoiceNo: 'INV-STP-002', notes: 'Luxury wood work' },
    { projectId: projectIds[9], supplierId: supplierIds[7], materialName: 'UPVC Window Frame', quantity: 24, unit: 'Nos', unitPrice: 6500, purchaseDate: new Date('2025-03-15'), invoiceNo: 'INV-KUS-001', notes: 'All windows' },
    { projectId: projectIds[10], supplierId: supplierIds[5], materialName: 'Asian Paints Interior', quantity: 300, unit: 'Litre', unitPrice: 185, purchaseDate: new Date('2025-04-01'), invoiceNo: 'INV-MPH-001', notes: 'Interior painting' },
    { projectId: projectIds[10], supplierId: supplierIds[4], materialName: 'Wall Tiles (1x2)', quantity: 800, unit: 'SqFt', unitPrice: 48, purchaseDate: new Date('2025-04-05'), invoiceNo: 'INV-STP-003', notes: 'Bathroom & kitchen tiles' },
    { projectId: projectIds[11], supplierId: supplierIds[5], materialName: 'Wall Putty', quantity: 500, unit: 'KG', unitPrice: 28, purchaseDate: new Date('2025-04-08'), invoiceNo: 'INV-MPH-002', notes: 'Renovation putty work' },
    { projectId: projectIds[11], supplierId: supplierIds[10], materialName: 'Dr. Fixit Waterproofing', quantity: 200, unit: 'KG', unitPrice: 95, purchaseDate: new Date('2025-04-10'), invoiceNo: 'INV-DWP-001', notes: 'Terrace waterproofing' },
    // Extra warehouse purchases (no project)
    { projectId: null, supplierId: supplierIds[2], materialName: 'Binding Wire (18 gauge)', quantity: 100, unit: 'KG', unitPrice: 85, purchaseDate: new Date('2024-01-10'), invoiceNo: 'INV-VSI-004', notes: 'Warehouse stock' },
    { projectId: null, supplierId: supplierIds[8], materialName: 'PVC Pipe (4")', quantity: 500, unit: 'RFt', unitPrice: 38, purchaseDate: new Date('2024-01-12'), invoiceNo: 'INV-PPS-001', notes: 'Warehouse stock' },
    { projectId: null, supplierId: supplierIds[9], materialName: 'Finolex Electrical Wire 6sqmm', quantity: 1000, unit: 'Meter', unitPrice: 42, purchaseDate: new Date('2024-01-14'), invoiceNo: 'INV-EWC-001', notes: 'Electrical warehouse' },
    { projectId: null, supplierId: supplierIds[4], materialName: 'Tile Adhesive (BAL)', quantity: 50, unit: 'Bags', unitPrice: 420, purchaseDate: new Date('2024-01-15'), invoiceNo: 'INV-STP-000', notes: 'Warehouse tile adhesive stock' },
    { projectId: null, supplierId: supplierIds[8], materialName: 'CPVC Pipe (1/2")', quantity: 200, unit: 'RFt', unitPrice: 55, purchaseDate: new Date('2024-01-16'), invoiceNo: 'INV-PPS-000', notes: 'Warehouse CPVC stock' },
    { projectId: null, supplierId: supplierIds[5], materialName: 'Weathershield Exterior Paint', quantity: 100, unit: 'Litre', unitPrice: 210, purchaseDate: new Date('2024-01-17'), invoiceNo: 'INV-MPH-000', notes: 'Warehouse paint stock' },
    { projectId: null, supplierId: supplierIds[6], materialName: 'Plywood 18mm BWR', quantity: 30, unit: 'Nos', unitPrice: 2200, purchaseDate: new Date('2024-01-18'), invoiceNo: 'INV-STP-00A', notes: 'Warehouse plywood stock' },
    { projectId: null, supplierId: supplierIds[4], materialName: 'Wall Tiles (1x2)', quantity: 200, unit: 'SqFt', unitPrice: 48, purchaseDate: new Date('2024-01-19'), invoiceNo: 'INV-STP-00B', notes: 'Warehouse wall tiles stock' },
    { projectId: null, supplierId: supplierIds[10], materialName: 'Dr. Fixit Waterproofing', quantity: 150, unit: 'KG', unitPrice: 95, purchaseDate: new Date('2024-01-20'), invoiceNo: 'INV-DWP-000', notes: 'Warehouse waterproofing stock' },
  ]

  for (const pur of purchaseDefs) {
    const matId = materials[pur.materialName]
    if (!matId) { console.warn(`⚠ Material not found: ${pur.materialName}`); continue }
    const totalCost = pur.quantity * pur.unitPrice

    const existingPur = await prisma.purchase.findFirst({ where: { invoiceNo: pur.invoiceNo } })
    if (!existingPur) {
      await prisma.$transaction(async (tx) => {
        const purchase = await tx.purchase.create({
          data: {
            projectId: pur.projectId,
            supplierId: pur.supplierId,
            materialId: matId,
            quantity: pur.quantity,
            unit: pur.unit,
            unitPrice: pur.unitPrice,
            totalCost,
            purchaseDate: pur.purchaseDate,
            invoiceNo: pur.invoiceNo,
            notes: pur.notes,
          },
        })
        const lastStock = await tx.stockLedger.findFirst({ where: { materialId: matId }, orderBy: { txnDate: 'desc' } })
        const newBalance = (lastStock?.balanceAfter ?? 0) + pur.quantity
        await tx.stockLedger.create({
          data: { materialId: matId, txnType: 'IN', quantity: pur.quantity, balanceAfter: newBalance, referenceType: 'PURCHASE', purchaseId: purchase.id, txnDate: pur.purchaseDate },
        })
      })
    }
  }
  console.log(`✅ ${purchaseDefs.length} Purchases ready (stock updated)`)

  // ─── Material Usage ───────────────────────────────────────────────────────
  const usageDefs = [
    { projectId: projectIds[0], materialName: 'Cement (OPC 53)', quantity: 120, unit: 'Bags', usageDate: new Date('2024-02-05'), notes: 'Foundation footing concrete' },
    { projectId: projectIds[0], materialName: 'Steel TMT Bar', quantity: 800, unit: 'KG', usageDate: new Date('2024-02-15'), notes: 'Column reinforcement' },
    { projectId: projectIds[0], materialName: 'River Sand', quantity: 200, unit: 'CFT', usageDate: new Date('2024-02-20'), notes: 'Plastering ground floor' },
    { projectId: projectIds[1], materialName: 'Cement (OPC 53)', quantity: 100, unit: 'Bags', usageDate: new Date('2024-03-20'), notes: 'Ground floor slab' },
    { projectId: projectIds[1], materialName: 'M-Sand', quantity: 150, unit: 'CFT', usageDate: new Date('2024-03-25'), notes: 'Block masonry work' },
    { projectId: projectIds[2], materialName: 'Cement (OPC 53)', quantity: 200, unit: 'Bags', usageDate: new Date('2024-07-01'), notes: '1st floor column concreting' },
    { projectId: projectIds[2], materialName: 'Steel TMT Bar', quantity: 1500, unit: 'KG', usageDate: new Date('2024-07-10'), notes: '1st floor beam & slab steel' },
    { projectId: projectIds[2], materialName: 'Floor Tiles (2x2)', quantity: 600, unit: 'SqFt', usageDate: new Date('2024-10-01'), notes: 'Ground floor tiling done' },
    { projectId: projectIds[3], materialName: 'Hollow Blocks (6")', quantity: 2000, unit: 'Nos', usageDate: new Date('2024-08-01'), notes: 'External wall construction' },
    { projectId: projectIds[4], materialName: 'Cement (OPC 53)', quantity: 150, unit: 'Bags', usageDate: new Date('2024-09-01'), notes: 'Foundation RCC' },
    { projectId: projectIds[4], materialName: 'P-Sand', quantity: 120, unit: 'CFT', usageDate: new Date('2024-09-10'), notes: 'Plastering work' },
    { projectId: projectIds[5], materialName: 'Red Bricks', quantity: 2000, unit: 'Nos', usageDate: new Date('2024-10-01'), notes: 'Wall construction' },
    { projectId: projectIds[6], materialName: 'Cement (OPC 53)', quantity: 300, unit: 'Bags', usageDate: new Date('2024-11-01'), notes: 'Ground floor slab concrete' },
    { projectId: projectIds[6], materialName: 'Steel TMT Bar', quantity: 3000, unit: 'KG', usageDate: new Date('2024-11-10'), notes: 'Structural frame steel' },
    { projectId: projectIds[9], materialName: 'Teak Timber', quantity: 50, unit: 'CFT', usageDate: new Date('2025-04-01'), notes: 'Main door & window frames' },
    { projectId: projectIds[10], materialName: 'Asian Paints Interior', quantity: 100, unit: 'Litre', usageDate: new Date('2025-04-10'), notes: '1st coat painting' },
  ]

  for (const usage of usageDefs) {
    const matId = materials[usage.materialName]
    if (!matId) { console.warn(`⚠ Material not found: ${usage.materialName}`); continue }
    const existingUsage = await prisma.materialUsage.findFirst({ where: { projectId: usage.projectId, materialId: matId, usageDate: usage.usageDate } })
    if (!existingUsage) {
      const lastStock = await prisma.stockLedger.findFirst({ where: { materialId: matId }, orderBy: { txnDate: 'desc' } })
      const currentBalance = lastStock?.balanceAfter ?? 0
      if (currentBalance >= usage.quantity) {
        await prisma.$transaction(async (tx) => {
          const u = await tx.materialUsage.create({
            data: { projectId: usage.projectId, materialId: matId, quantity: usage.quantity, unit: usage.unit, usageDate: usage.usageDate, notes: usage.notes },
          })
          await tx.stockLedger.create({
            data: { materialId: matId, txnType: 'OUT', quantity: usage.quantity, balanceAfter: currentBalance - usage.quantity, referenceType: 'USAGE', usageId: u.id, txnDate: usage.usageDate },
          })
        })
      } else {
        console.warn(`⚠ Skipped usage: ${usage.materialName} — insufficient stock (${currentBalance} < ${usage.quantity})`)
      }
    }
  }
  console.log(`✅ Material usage records ready`)

  // ─── Salary Entries ───────────────────────────────────────────────────────
  const salaryDefs = [
    { employeeId: employeeIds[10], projectId: projectIds[0], payType: 'MONTHLY', amount: 35000, daysWorked: null, periodFrom: new Date('2024-01-01'), periodTo: new Date('2024-01-31'), paidDate: new Date('2024-02-01'), notes: 'Jan salary' },
    { employeeId: employeeIds[0], projectId: projectIds[0], payType: 'DAILY', amount: 24000, daysWorked: 20, periodFrom: new Date('2024-01-15'), periodTo: new Date('2024-02-15'), paidDate: new Date('2024-02-16'), notes: 'Foreman wages' },
    { employeeId: employeeIds[2], projectId: projectIds[0], payType: 'WEEKLY', amount: 9000, daysWorked: 10, periodFrom: new Date('2024-02-01'), periodTo: new Date('2024-02-15'), paidDate: new Date('2024-02-16'), notes: 'Mason weekly wages' },
    { employeeId: employeeIds[5], projectId: projectIds[0], payType: 'DAILY', amount: 12000, daysWorked: 20, periodFrom: new Date('2024-02-01'), periodTo: new Date('2024-03-01'), paidDate: new Date('2024-03-02'), notes: 'Helper wages' },
    { employeeId: employeeIds[6], projectId: projectIds[0], payType: 'DAILY', amount: 12000, daysWorked: 20, periodFrom: new Date('2024-02-01'), periodTo: new Date('2024-03-01'), paidDate: new Date('2024-03-02'), notes: 'Helper wages' },
    { employeeId: employeeIds[11], projectId: projectIds[2], payType: 'MONTHLY', amount: 32000, daysWorked: null, periodFrom: new Date('2024-06-01'), periodTo: new Date('2024-06-30'), paidDate: new Date('2024-07-01'), notes: 'Structural engineer monthly' },
    { employeeId: employeeIds[1], projectId: projectIds[2], payType: 'DAILY', amount: 22000, daysWorked: 20, periodFrom: new Date('2024-06-01'), periodTo: new Date('2024-07-01'), paidDate: new Date('2024-07-02'), notes: 'Site foreman' },
    { employeeId: employeeIds[3], projectId: projectIds[2], payType: 'DAILY', amount: 17000, daysWorked: 20, periodFrom: new Date('2024-06-15'), periodTo: new Date('2024-07-15'), paidDate: new Date('2024-07-16'), notes: 'Mason wages - plastering' },
    { employeeId: employeeIds[4], projectId: projectIds[2], payType: 'DAILY', amount: 16000, daysWorked: 20, periodFrom: new Date('2024-09-01'), periodTo: new Date('2024-10-01'), paidDate: new Date('2024-10-02'), notes: 'Tile fixing wages' },
    { employeeId: employeeIds[10], projectId: projectIds[6], payType: 'MONTHLY', amount: 35000, daysWorked: null, periodFrom: new Date('2024-10-01'), periodTo: new Date('2024-10-31'), paidDate: new Date('2024-11-01'), notes: 'Oct salary - apartment project' },
    { employeeId: employeeIds[0], projectId: projectIds[6], payType: 'DAILY', amount: 24000, daysWorked: 20, periodFrom: new Date('2024-10-01'), periodTo: new Date('2024-11-01'), paidDate: new Date('2024-11-02'), notes: 'Foreman wages' },
    { employeeId: employeeIds[7], projectId: projectIds[6], payType: 'DAILY', amount: 11000, daysWorked: 20, periodFrom: new Date('2024-10-01'), periodTo: new Date('2024-11-01'), paidDate: new Date('2024-11-02'), notes: 'Helper wages' },
    { employeeId: employeeIds[8], projectId: projectIds[6], payType: 'DAILY', amount: 11000, daysWorked: 20, periodFrom: new Date('2024-10-01'), periodTo: new Date('2024-11-01'), paidDate: new Date('2024-11-02'), notes: 'Helper wages' },
    { employeeId: employeeIds[12], projectId: projectIds[4], payType: 'DAILY', amount: 19000, daysWorked: 20, periodFrom: new Date('2024-08-01'), periodTo: new Date('2024-09-01'), paidDate: new Date('2024-09-02'), notes: 'Electrician supervisor' },
    { employeeId: employeeIds[0], projectId: projectIds[1], payType: 'ADVANCE', amount: 5000, daysWorked: null, periodFrom: new Date('2024-03-01'), periodTo: new Date('2024-03-01'), paidDate: new Date('2024-03-01'), notes: 'Advance payment' },
    { employeeId: employeeIds[9], projectId: projectIds[9], payType: 'DAILY', amount: 12000, daysWorked: 20, periodFrom: new Date('2025-02-01'), periodTo: new Date('2025-03-01'), paidDate: new Date('2025-03-02'), notes: 'Scaffolding helper' },
    { employeeId: employeeIds[11], projectId: projectIds[9], payType: 'MONTHLY', amount: 32000, daysWorked: null, periodFrom: new Date('2025-02-01'), periodTo: new Date('2025-02-28'), paidDate: new Date('2025-03-01'), notes: 'Structural engineer' },
    { employeeId: employeeIds[1], projectId: projectIds[10], payType: 'DAILY', amount: 22000, daysWorked: 20, periodFrom: new Date('2025-03-15'), periodTo: new Date('2025-04-15'), paidDate: new Date('2025-04-16'), notes: 'Foreman wages April' },
    { employeeId: employeeIds[3], projectId: projectIds[11], payType: 'DAILY', amount: 17000, daysWorked: 20, periodFrom: new Date('2025-04-01'), periodTo: new Date('2025-05-01'), paidDate: new Date('2025-05-02'), notes: 'Renovation plastering' },
    { employeeId: employeeIds[5], projectId: projectIds[11], payType: 'DAILY', amount: 12000, daysWorked: 20, periodFrom: new Date('2025-04-01'), periodTo: new Date('2025-05-01'), paidDate: new Date('2025-05-02'), notes: 'Renovation helper' },
  ]

  for (const sal of salaryDefs) {
    const existing = await prisma.salaryEntry.findFirst({ where: { employeeId: sal.employeeId, projectId: sal.projectId, paidDate: sal.paidDate, amount: sal.amount } })
    if (!existing) await prisma.salaryEntry.create({ data: sal })
  }
  console.log(`✅ ${salaryDefs.length} Salary entries ready`)

  // ─── Small Works ──────────────────────────────────────────────────────────
  const smallWorkDefs = [
    { title: 'Compound Wall Repair', location: 'Warehouse Premises', description: 'Plastering crack repair on compound wall', workDate: new Date('2024-03-15'), mats: [{ name: 'Cement (OPC 53)', qty: 5, unit: 'Bags' }, { name: 'River Sand', qty: 10, unit: 'CFT' }] },
    { title: 'Office Toilet Tiling', location: 'Site Office, Ambattur', description: 'Wall and floor tiling for office toilet', workDate: new Date('2024-04-10'), mats: [{ name: 'Wall Tiles (1x2)', qty: 80, unit: 'SqFt' }, { name: 'Tile Adhesive (BAL)', qty: 3, unit: 'Bags' }] },
    { title: 'Water Tank Base', location: 'Godown, Poonamallee', description: 'Concrete base for water storage tank', workDate: new Date('2024-05-20'), mats: [{ name: 'Cement (OPC 53)', qty: 8, unit: 'Bags' }, { name: 'Coarse Aggregate (20mm)', qty: 20, unit: 'CFT' }] },
    { title: 'Watchman Room Construction', location: 'DA Office, Ambattur', description: 'Small 10x8 room for watchman', workDate: new Date('2024-06-01'), mats: [{ name: 'Red Bricks', qty: 1000, unit: 'Nos' }, { name: 'Cement (OPC 53)', qty: 15, unit: 'Bags' }, { name: 'River Sand', qty: 30, unit: 'CFT' }] },
    { title: 'Plumbing Repairs - Office', location: 'Head Office, Chennai', description: 'Leakage repair in office bathroom', workDate: new Date('2024-07-12'), mats: [{ name: 'CPVC Pipe (1/2")', qty: 20, unit: 'RFt' }] },
    { title: 'Electrical Wire Replacement', location: 'Site Office', description: 'Old wire replacement in office', workDate: new Date('2024-08-08'), mats: [{ name: 'Finolex Electrical Wire 6sqmm', qty: 100, unit: 'Meter' }] },
    { title: 'Staircase Tiling - Office', location: 'DA Office Building', description: 'Anti-skid tiling on office staircase', workDate: new Date('2024-09-05'), mats: [{ name: 'Floor Tiles (2x2)', qty: 120, unit: 'SqFt' }, { name: 'Tile Adhesive (BAL)', qty: 4, unit: 'Bags' }] },
    { title: 'Terrace Waterproofing', location: 'Godown Terrace', description: 'Waterproofing treatment for godown roof', workDate: new Date('2024-10-20'), mats: [{ name: 'Dr. Fixit Waterproofing', qty: 50, unit: 'KG' }] },
    { title: 'Parking Area Levelling', location: 'Office Parking Lot', description: 'Concrete levelling for parking area', workDate: new Date('2024-11-10'), mats: [{ name: 'Cement (OPC 53)', qty: 20, unit: 'Bags' }, { name: 'M-Sand', qty: 40, unit: 'CFT' }, { name: 'Coarse Aggregate (20mm)', qty: 50, unit: 'CFT' }] },
    { title: 'Boundary Wall Painting', location: 'Warehouse Perimeter', description: 'Exterior painting of boundary wall', workDate: new Date('2024-12-15'), mats: [{ name: 'Weathershield Exterior Paint', qty: 30, unit: 'Litre' }] },
    { title: 'Store Room Shelving', location: 'DA Godown', description: 'Wooden shelving for material storage', workDate: new Date('2025-01-20'), mats: [{ name: 'Plywood 18mm BWR', qty: 10, unit: 'Nos' }] },
    { title: 'Gate Plinth Work', location: 'Office Entrance', description: 'Concrete plinth and granite steps at gate', workDate: new Date('2025-02-10'), mats: [{ name: 'Cement (OPC 53)', qty: 6, unit: 'Bags' }, { name: 'Granite (Kitchen)', qty: 20, unit: 'SqFt' }] },
  ]

  for (const sw of smallWorkDefs) {
    const existing = await prisma.smallWork.findFirst({ where: { title: sw.title, workDate: sw.workDate } })
    if (!existing) {
      await prisma.$transaction(async (tx) => {
        const work = await tx.smallWork.create({ data: { title: sw.title, location: sw.location, description: sw.description, workDate: sw.workDate } })
        for (const mat of sw.mats) {
          const matId = materials[mat.name]
          if (!matId) { console.warn(`⚠ SmallWork mat not found: ${mat.name}`); continue }
          const lastStock = await tx.stockLedger.findFirst({ where: { materialId: matId }, orderBy: { txnDate: 'desc' } })
          const currentBalance = lastStock?.balanceAfter ?? 0
          if (currentBalance < mat.qty) { console.warn(`⚠ Skipping small work mat ${mat.name}: stock ${currentBalance} < ${mat.qty}`); continue }
          const swm = await tx.smallWorkMaterial.create({ data: { smallWorkId: work.id, materialId: matId, quantity: mat.qty, unit: mat.unit } })
          await tx.stockLedger.create({ data: { materialId: matId, txnType: 'OUT', quantity: mat.qty, balanceAfter: currentBalance - mat.qty, referenceType: 'SMALL_WORK', smallWorkId: swm.id, txnDate: sw.workDate } })
        }
      })
    }
  }
  console.log(`✅ ${smallWorkDefs.length} Small works ready`)

  // ─── Supplier-Material Links ───────────────────────────────────────────────
  const links = [
    { supplierId: supplierIds[0], materialNames: ['Cement (OPC 53)'] },
    { supplierId: supplierIds[1], materialNames: ['River Sand', 'M-Sand', 'P-Sand', 'Coarse Aggregate (20mm)'] },
    { supplierId: supplierIds[2], materialNames: ['Steel TMT Bar', 'Binding Wire (18 gauge)'] },
    { supplierId: supplierIds[3], materialNames: ['Red Bricks', 'Fly Ash Bricks', 'Hollow Blocks (6")'] },
    { supplierId: supplierIds[4], materialNames: ['Floor Tiles (2x2)', 'Wall Tiles (1x2)', 'Tile Adhesive (BAL)'] },
    { supplierId: supplierIds[5], materialNames: ['Asian Paints Interior', 'Weathershield Exterior Paint', 'Wall Putty'] },
    { supplierId: supplierIds[6], materialNames: ['Teak Timber', 'Plywood 18mm BWR'] },
    { supplierId: supplierIds[7], materialNames: ['UPVC Window Frame', 'Aluminium Main Door', 'Float Glass (5mm)'] },
    { supplierId: supplierIds[8], materialNames: ['PVC Pipe (4")', 'CPVC Pipe (1/2")'] },
    { supplierId: supplierIds[9], materialNames: ['Finolex Electrical Wire 6sqmm'] },
    { supplierId: supplierIds[10], materialNames: ['Dr. Fixit Waterproofing'] },
    { supplierId: supplierIds[11], materialNames: ['Granite (Kitchen)', 'Marble Flooring'] },
  ]
  for (const link of links) {
    for (const matName of link.materialNames) {
      const matId = materials[matName]
      if (!matId) continue
      const existing = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: link.supplierId, materialId: matId } } })
      if (!existing) await prisma.supplierMaterial.create({ data: { supplierId: link.supplierId, materialId: matId } })
    }
  }
  console.log('✅ Supplier-material links ready')

  console.log('\n🎉 All demo data seeded successfully!')
  console.log('📊 Summary:')
  console.log(`   Suppliers: ${supplierIds.length}`)
  console.log(`   Projects:  ${projectIds.length}`)
  console.log(`   Employees: ${employeeIds.length}`)
  console.log(`   Purchases: ${purchaseDefs.length}`)
  console.log(`   Salaries:  ${salaryDefs.length}`)
  console.log(`   SmallWork: ${smallWorkDefs.length}`)
  console.log(`   Financials:${financialDefs.length}`)
  console.log('\n🔑 Login: admin@deivenei.com | admin123')
  console.log('🌐 http://localhost:3000')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
