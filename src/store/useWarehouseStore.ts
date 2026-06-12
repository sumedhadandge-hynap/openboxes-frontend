import { create } from "zustand"

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  unitOfMeasure: string
  status: "Active" | "Inactive"
  minLevel: number
  description: string
}

export interface Warehouse {
  id: string
  code: string
  name: string
  type: "Warehouse" | "Laboratory" | "Filling Station"
  location: string
  status: "Active" | "Inactive"
  capacity: number // percentage
  manager: string
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  gstin: string
}

export interface WarehouseZone {
  id: string
  warehouseId: string
  name: string
}

export interface BinLocation {
  id: string
  warehouseId: string
  zoneId: string
  code: string
}

export interface Category {
  id: string
  name: string
}

export interface UnitOfMeasure {
  id: string
  name: string
}

export interface InventoryItem {
  id: string
  productId: string
  warehouseId: string
  lotNumber: string
  expirationDate: string // certification/expiry date
  binLocation: string
  quantityOnHand: number
}

export interface RequisitionItem {
  productId: string
  quantityRequested: number
  quantityFulfilled: number
}

export interface Requisition {
  id: string
  requestNumber: string
  originWarehouseId: string 
  destinationWarehouseId: string 
  requestedBy: string
  requestedDate: string
  urgency: "High" | "Medium" | "Low"
  status: "Draft" | "Pending Approval" | "Approved" | "Fulfilling" | "Completed" | "Rejected"
  items: RequisitionItem[]
}

export interface ShipmentItem {
  productId: string
  quantityShipped: number
  quantityReceived: number
  lotNumber: string
  expirationDate: string
  binLocation?: string
}

export interface Shipment {
  id: string
  shipmentNumber: string
  type: "Inbound" | "Outbound"
  origin: string // Supplier name for Inbound, Warehouse ID for Outbound
  destination: string // Warehouse ID for Inbound, Customer/Project ID for Outbound
  status: "Draft" | "Shipped" | "Receiving" | "Received" | "Partial" | "Cancelled"
  trackingNumber?: string
  carrier?: string
  shippedDate?: string
  receivedDate?: string
  items: ShipmentItem[]
  requisitionId?: string
}

// Procurement Purchase Orders
export interface PurchaseOrderItem {
  productId: string
  quantityOrdered: number
  unitPrice: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplier: string
  status: "Draft" | "Pending Approval" | "Approved" | "Completed" | "Cancelled"
  orderDate: string
  deliveryDate: string
  items: PurchaseOrderItem[]
  warehouseId?: string
}

// Projects
export interface ProjectItem {
  productId: string
  quantityAllocated: number
}

export interface Project {
  id: string
  code: string
  name: string
  description: string
  manager: string
  status: "Planning" | "Active" | "Completed" | "On Hold"
  allocatedItems: ProjectItem[]
}

interface WarehouseState {
  products: Product[]
  warehouses: Warehouse[]
  inventory: InventoryItem[]
  requisitions: Requisition[]
  shipments: Shipment[]
  purchaseOrders: PurchaseOrder[]
  projects: Project[]
  suppliers: Supplier[]
  zones: WarehouseZone[]
  binLocations: BinLocation[]
  categories: Category[]
  uoms: UnitOfMeasure[]
  selectedWarehouseId: string | null
  setSelectedWarehouseId: (id: string | null) => void

  // Product Actions
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (product: Product) => void

  // Warehouse Actions
  addWarehouse: (warehouse: Omit<Warehouse, "id" | "capacity">) => void
  removeWarehouse: (id: string) => void

  // Inventory Actions
  adjustStock: (
    warehouseId: string,
    productId: string,
    lotNumber: string,
    expirationDate: string,
    binLocation: string,
    newQuantity: number
  ) => void
  transferStock: (
    fromWarehouseId: string,
    toWarehouseId: string,
    productId: string,
    lotNumber: string,
    fromBin: string,
    toBin: string,
    quantity: number
  ) => void

  // Requisition Actions
  createRequisition: (requisition: Omit<Requisition, "id" | "requestNumber" | "status" | "requestedDate">) => void
  approveRequisition: (id: string) => void
  rejectRequisition: (id: string) => void
  fulfillRequisition: (id: string) => void 

  // Shipment Actions
  createShipment: (shipment: Omit<Shipment, "id" | "shipmentNumber" | "status"> & { status?: Shipment["status"] }) => void
  receiveShipment: (
    shipmentId: string,
    receivedItems: { productId: string; lotNumber: string; expirationDate: string; binLocation: string; quantityReceived: number }[]
  ) => void
  pickPackShipOutbound: (
    shipmentId: string,
    carrier: string,
    trackingNumber: string,
    packedItems: { productId: string; lotNumber: string; binLocation: string; quantity: number }[]
  ) => void

  // Purchase Order Actions
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "poNumber" | "status" | "orderDate">) => void
  approvePurchaseOrder: (id: string) => void
  completePurchaseOrder: (id: string) => void

  // Project Actions
  addProject: (project: Omit<Project, "id" | "allocatedItems">) => void
  allocateProjectStock: (projectId: string, warehouseId: string, productId: string, quantity: number) => boolean

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, "id">) => void
  removeSupplier: (id: string) => void

  // Layout & Master Actions
  addZone: (warehouseId: string, name: string) => void
  removeZone: (id: string) => void
  addBin: (warehouseId: string, zoneId: string, code: string) => void
  removeBin: (id: string) => void
  addCategory: (name: string) => void
  removeCategory: (id: string) => void
  addUom: (name: string) => void
  removeUom: (id: string) => void
}

// Initial Fireplan safety WMS mock data
const initialProducts: Product[] = [
  {
    id: "PROD-001",
    sku: "SPR-PEND-68",
    name: "Pendent Fire Sprinkler 68°C",
    category: "Sprinklers",
    unitOfMeasure: "Each",
    status: "Active",
    minLevel: 100,
    description: "Standard response pendent sprinkler, 1/2 inch NPT, 68°C glass bulb rating for ceiling layouts.",
  },
  {
    id: "PROD-002",
    sku: "FAP-ADDR-08",
    name: "Addressable Fire Alarm Panel 8-Loop",
    category: "Electronics",
    unitOfMeasure: "Each",
    status: "Active",
    minLevel: 5,
    description: "Intelligent addressable fire alarm control panel supporting up to 8 loops and 2000 devices.",
  },
  {
    id: "PROD-003",
    sku: "EXT-CO2-45",
    name: "CO2 Fire Extinguisher 4.5kg",
    category: "Extinguishers",
    unitOfMeasure: "Each",
    status: "Active",
    minLevel: 50,
    description: "Carbon dioxide fire extinguisher with discharge horn, aluminum cylinder, rating 55B for electrical fires.",
  },
  {
    id: "PROD-004",
    sku: "VAL-BTFY-04",
    name: "Grooved Butterfly Valve 4\"",
    category: "Pipes & Valves",
    unitOfMeasure: "Each",
    status: "Active",
    minLevel: 20,
    description: "4-inch ductile iron grooved-end butterfly valve with tamper switch, double-sealed design.",
  },
  {
    id: "PROD-005",
    sku: "CYL-FM200-80",
    name: "FM200 Suppression Cylinder 80L",
    category: "Suppression",
    unitOfMeasure: "Cylinder",
    status: "Active",
    minLevel: 10,
    description: "80-litre gas suppression cylinder pre-charged with HFC-227ea clean agent, complete with discharge valve.",
  },
]

const initialWarehouses: Warehouse[] = [
  {
    id: "WH-001",
    code: "CPY",
    name: "Central Piping & Heavy Warehouse",
    type: "Warehouse",
    location: "Logistics Zone B, Bhosari Industrial Area, Pune",
    status: "Active",
    capacity: 82,
    manager: "Rahul Maske",
  },
  {
    id: "WH-002",
    code: "EIL",
    name: "Electronics & Instrument Lab",
    type: "Laboratory",
    location: "Building C, Kanjurmarg West, Mumbai",
    status: "Active",
    capacity: 45,
    manager: "Jane Smith",
  },
  {
    id: "WH-003",
    code: "GFS",
    name: "Gas Filling & Suppression Station",
    type: "Filling Station",
    location: "Plot No. 12, Ambattur Industrial Estate, Chennai",
    status: "Active",
    capacity: 28,
    manager: "Suresh Kumar",
  },
  {
    id: "WH-004",
    code: "HYD",
    name: "Hyderabad Suppression & Logistics Hub",
    type: "Warehouse",
    location: "Logistics Park, Jeedimetla, Hyderabad",
    status: "Active",
    capacity: 15,
    manager: "K. Srinivasa Rao",
  },
  {
    id: "WH-005",
    code: "KSS",
    name: "Kolkata Suppression Station",
    type: "Filling Station",
    location: "Salt Lake City, Sector V, Kolkata",
    status: "Active",
    capacity: 10,
    manager: "Pranab Roy",
  },
]

const initialZones: WarehouseZone[] = [
  { id: "Z-001", warehouseId: "WH-001", name: "Zone A - Piping Warehouse" },
  { id: "Z-002", warehouseId: "WH-001", name: "Zone B - Valves Rack" },
  { id: "Z-003", warehouseId: "WH-002", name: "Zone A - Instruments" },
  { id: "Z-004", warehouseId: "WH-003", name: "Zone A - Gas Station" },
  { id: "Z-005", warehouseId: "WH-004", name: "Zone A - Hyderabad Warehouse" },
  { id: "Z-006", warehouseId: "WH-005", name: "Zone A - Cylinders" },
]

const initialBins: BinLocation[] = [
  { id: "B-001", warehouseId: "WH-001", zoneId: "Z-001", code: "BIN-SPR-01" },
  { id: "B-002", warehouseId: "WH-001", zoneId: "Z-001", code: "BIN-SPR-02" },
  { id: "B-003", warehouseId: "WH-001", zoneId: "Z-002", code: "WH-VALV-02" },
  { id: "B-004", warehouseId: "WH-001", zoneId: "Z-002", code: "BIN-EXT-A2" },
  { id: "B-005", warehouseId: "WH-002", zoneId: "Z-003", code: "SHELF-EL-04" },
  { id: "B-006", warehouseId: "WH-003", zoneId: "Z-004", code: "STATION-GAS-01" },
  { id: "B-007", warehouseId: "WH-004", zoneId: "Z-005", code: "HYD-BIN-01" },
  { id: "B-008", warehouseId: "WH-005", zoneId: "Z-006", code: "KOL-BIN-01" },
]

const initialCategories: Category[] = [
  { id: "CAT-001", name: "Sprinklers" },
  { id: "CAT-002", name: "Electronics" },
  { id: "CAT-003", name: "Extinguishers" },
  { id: "CAT-004", name: "Pipes & Valves" },
  { id: "CAT-005", name: "Suppression" },
]

const initialUoms: UnitOfMeasure[] = [
  { id: "UOM-001", name: "Each" },
  { id: "UOM-002", name: "Pack" },
  { id: "UOM-003", name: "Meter" },
  { id: "UOM-004", name: "Box" },
  { id: "UOM-005", name: "Cylinder" },
]

const initialInventory: InventoryItem[] = [
  {
    id: "INV-001",
    productId: "PROD-001",
    warehouseId: "WH-001",
    lotNumber: "LOT-2026A",
    expirationDate: "2029-06-30",
    binLocation: "BIN-SPR-01",
    quantityOnHand: 450,
  },
  {
    id: "INV-002",
    productId: "PROD-002",
    warehouseId: "WH-002",
    lotNumber: "LOT-ELEC-05",
    expirationDate: "2028-12-31",
    binLocation: "SHELF-EL-04",
    quantityOnHand: 12,
  },
  {
    id: "INV-003",
    productId: "PROD-003",
    warehouseId: "WH-001",
    lotNumber: "LOT-EXT-02",
    expirationDate: "2031-09-15",
    binLocation: "BIN-EXT-A2",
    quantityOnHand: 180,
  },
  {
    id: "INV-004",
    productId: "PROD-004",
    warehouseId: "WH-001",
    lotNumber: "LOT-VALV-12",
    expirationDate: "2030-01-01",
    binLocation: "WH-VALV-02",
    quantityOnHand: 35,
  },
  {
    id: "INV-005",
    productId: "PROD-005",
    warehouseId: "WH-003",
    lotNumber: "LOT-GAS-80",
    expirationDate: "2028-04-10",
    binLocation: "STATION-GAS-01",
    quantityOnHand: 18,
  },
  {
    id: "INV-006",
    productId: "PROD-001",
    warehouseId: "WH-004",
    lotNumber: "LOT-HYD-01",
    expirationDate: "2030-05-15",
    binLocation: "HYD-BIN-01",
    quantityOnHand: 150,
  },
  {
    id: "INV-007",
    productId: "PROD-005",
    warehouseId: "WH-005",
    lotNumber: "LOT-KOL-01",
    expirationDate: "2029-09-20",
    binLocation: "KOL-BIN-01",
    quantityOnHand: 8,
  },
]

const initialRequisitions: Requisition[] = [
  {
    id: "REQ-001",
    requestNumber: "REQ-2026-001",
    originWarehouseId: "WH-002",
    destinationWarehouseId: "WH-001",
    requestedBy: "Priya Patel",
    requestedDate: "2026-06-10",
    urgency: "High",
    status: "Pending Approval",
    items: [
      { productId: "PROD-001", quantityRequested: 100, quantityFulfilled: 0 },
      { productId: "PROD-004", quantityRequested: 5, quantityFulfilled: 0 },
    ],
  },
  {
    id: "REQ-002",
    requestNumber: "REQ-2026-002",
    originWarehouseId: "WH-002",
    destinationWarehouseId: "WH-001",
    requestedBy: "Dr. Sarah Adams",
    requestedDate: "2026-06-05",
    urgency: "Medium",
    status: "Completed",
    items: [
      { productId: "PROD-001", quantityRequested: 50, quantityFulfilled: 50 },
    ],
  },
]

const initialShipments: Shipment[] = [
  {
    id: "SH-001",
    shipmentNumber: "SH-2026-001",
    type: "Inbound",
    origin: "HD Fire Protect Pvt. Ltd.",
    destination: "WH-001",
    status: "Shipped",
    trackingNumber: "TRK-HD-88492",
    carrier: "V-Trans Logistics",
    shippedDate: "2026-06-08",
    items: [
      { productId: "PROD-001", quantityShipped: 500, quantityReceived: 0, lotNumber: "LOT-SPR-2026", expirationDate: "2031-10-31" },
      { productId: "PROD-004", quantityShipped: 20, quantityReceived: 0, lotNumber: "LOT-VAL-2026", expirationDate: "2031-09-30" },
    ],
  },
  {
    id: "SH-002",
    shipmentNumber: "SH-2026-002",
    type: "Inbound",
    origin: "Tyco Safety Products",
    destination: "WH-003",
    status: "Received",
    trackingNumber: "TRK-TY-11029",
    carrier: "Blue Dart",
    shippedDate: "2026-06-02",
    receivedDate: "2026-06-05",
    items: [
      { productId: "PROD-005", quantityShipped: 10, quantityReceived: 10, lotNumber: "LOT-SUP-2026", expirationDate: "2030-11-20", binLocation: "STATION-GAS-01" },
    ],
  },
]

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-001",
    poNumber: "PO-2026-001",
    supplier: "HD Fire Protect Pvt. Ltd.",
    status: "Approved",
    orderDate: "2026-06-01",
    deliveryDate: "2026-06-15",
    items: [
      { productId: "PROD-001", quantityOrdered: 500, unitPrice: 420 },
      { productId: "PROD-004", quantityOrdered: 20, unitPrice: 2800 },
    ],
    warehouseId: "WH-001",
  },
  {
    id: "PO-002",
    poNumber: "PO-2026-002",
    supplier: "Tyco Safety Products",
    status: "Completed",
    orderDate: "2026-05-20",
    deliveryDate: "2026-06-05",
    items: [
      { productId: "PROD-005", quantityOrdered: 10, unitPrice: 24500 },
    ],
    warehouseId: "WH-003",
  },
  {
    id: "PO-003",
    poNumber: "PO-2026-003",
    supplier: "Siemens India Ltd.",
    status: "Pending Approval",
    orderDate: "2026-06-10",
    deliveryDate: "2026-06-28",
    items: [
      { productId: "PROD-002", quantityOrdered: 3, unitPrice: 85000 },
    ],
    warehouseId: "WH-002",
  },
]

const initialProjects: Project[] = [
  {
    id: "PRJ-001",
    code: "METRO-L3",
    name: "Mumbai Metro Line 3 Fire Hydrant System",
    description: "Installation and commissioning of complete fire hydrant and sprinkler piping across 5 underground stations.",
    manager: "Amit Sharma",
    status: "Active",
    allocatedItems: [
      { productId: "PROD-001", quantityAllocated: 250 },
      { productId: "PROD-004", quantityAllocated: 8 },
    ],
  },
  {
    id: "PRJ-002",
    code: "TCS-HINJ",
    name: "TCS Hinjawadi Sprinkler Retrofitting",
    description: "Upgradation of existing fire alarm network and sprinkler network in Phase 2 campus.",
    manager: "Priya Patel",
    status: "Planning",
    allocatedItems: [],
  },
  {
    id: "PRJ-003",
    code: "ADANI-DC",
    name: "Adani Navi Mumbai Data Center suppression",
    description: "Gas based clean agent fire suppression system setup for computer servers halls A, B & C.",
    manager: "Vikram Singh",
    status: "Active",
    allocatedItems: [
      { productId: "PROD-005", quantityAllocated: 6 },
    ],
  },
]

const initialSuppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "HD Fire Protect Pvt. Ltd.",
    contactPerson: "Rajesh Mehta",
    email: "sales@hdfire.com",
    phone: "+91 22 2682 4000",
    address: "Kemp Plaza, Chincholi Bunder, Malad West, Mumbai",
    gstin: "27AAFCH8829F1Z9",
  },
  {
    id: "SUP-002",
    name: "Tyco Safety Products",
    contactPerson: "Siddharth Rao",
    email: "siddharth.rao@tycosafety.com",
    phone: "+91 22 6110 2000",
    address: "Solitaire Corporate Park, Andheri East, Mumbai",
    gstin: "27AABCT1129A1ZX",
  },
  {
    id: "SUP-003",
    name: "Siemens India Ltd.",
    contactPerson: "Nikhil Joshi",
    email: "nikhil.joshi@siemens.com",
    phone: "+91 22 3967 7000",
    address: "Birla Aurora, Dr. Annie Besant Road, Worli, Mumbai",
    gstin: "27AACCS4492D1ZY",
  },
  {
    id: "SUP-004",
    name: "Honeywell Security & Fire",
    contactPerson: "Ankit Srivastava",
    email: "ankit.srivastava@honeywell.com",
    phone: "+91 124 497 5000",
    address: "Sector 36, Gurugram, Haryana",
    gstin: "06AAACH7731F2Z8",
  },
]

const getSavedState = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key)
  if (!data) return fallback
  try {
    return JSON.parse(data)
  } catch {
    return fallback
  }
}

const saveState = (key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  products: getSavedState("ob_products_fire", initialProducts),
  warehouses: getSavedState("ob_warehouses_fire", initialWarehouses),
  inventory: getSavedState("ob_inventory_fire", initialInventory),
  requisitions: getSavedState("ob_requisitions_fire", initialRequisitions),
  shipments: getSavedState("ob_shipments_fire", initialShipments),
  purchaseOrders: getSavedState("ob_purchase_orders_fire", initialPurchaseOrders),
  projects: getSavedState("ob_projects_fire", initialProjects),
  suppliers: getSavedState("ob_suppliers_fire", initialSuppliers),
  zones: getSavedState("ob_zones_fire", initialZones),
  binLocations: getSavedState("ob_bins_fire", initialBins),
  categories: getSavedState("ob_categories_fire", initialCategories),
  uoms: getSavedState("ob_uoms_fire", initialUoms),
  selectedWarehouseId: getSavedState<string | null>("ob_selected_warehouse_id_fire", null),
  setSelectedWarehouseId: (id) => {
    saveState("ob_selected_warehouse_id_fire", id)
    set({ selectedWarehouseId: id })
  },

  addProduct: (newProd) => {
    const products = get().products
    const id = `PROD-${String(products.length + 1).padStart(3, "0")}`
    const productWithId = { ...newProd, id }
    const updated = [...products, productWithId]
    saveState("ob_products_fire", updated)
    set({ products: updated })
  },

  updateProduct: (updatedProd) => {
    const products = get().products.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    saveState("ob_products_fire", products)
    set({ products })
  },

  addWarehouse: (newWH) => {
    const warehouses = get().warehouses
    const id = `WH-${String(warehouses.length + 1).padStart(3, "0")}`
    const whWithId = { ...newWH, id, capacity: 0 }
    const updated = [...warehouses, whWithId]
    saveState("ob_warehouses_fire", updated)
    set({ warehouses: updated })
  },

  adjustStock: (warehouseId, productId, lotNumber, expirationDate, binLocation, newQuantity) => {
    const inventory = [...get().inventory]
    const index = inventory.findIndex(
      (item) =>
        item.warehouseId === warehouseId &&
        item.productId === productId &&
        item.lotNumber === lotNumber &&
        item.binLocation === binLocation
    )

    if (index !== -1) {
      if (newQuantity <= 0) {
        inventory.splice(index, 1)
      } else {
        inventory[index].quantityOnHand = newQuantity
      }
    } else if (newQuantity > 0) {
      inventory.push({
        id: `INV-${Math.random().toString(36).substring(2, 9)}`,
        warehouseId,
        productId,
        lotNumber,
        expirationDate,
        binLocation,
        quantityOnHand: newQuantity,
      })
    }

    saveState("ob_inventory_fire", inventory)
    set({ inventory })
  },

  transferStock: (fromWarehouseId, toWarehouseId, productId, lotNumber, fromBin, toBin, quantity) => {
    const inventory = [...get().inventory]
    
    const sourceIdx = inventory.findIndex(
      (item) =>
        item.warehouseId === fromWarehouseId &&
        item.productId === productId &&
        item.lotNumber === lotNumber &&
        item.binLocation === fromBin
    )

    if (sourceIdx === -1 || inventory[sourceIdx].quantityOnHand < quantity) return

    inventory[sourceIdx].quantityOnHand -= quantity
    const expDate = inventory[sourceIdx].expirationDate
    if (inventory[sourceIdx].quantityOnHand === 0) {
      inventory.splice(sourceIdx, 1)
    }

    const destIdx = inventory.findIndex(
      (item) =>
        item.warehouseId === toWarehouseId &&
        item.productId === productId &&
        item.lotNumber === lotNumber &&
        item.binLocation === toBin
    )

    if (destIdx !== -1) {
      inventory[destIdx].quantityOnHand += quantity
    } else {
      inventory.push({
        id: `INV-${Math.random().toString(36).substring(2, 9)}`,
        warehouseId: toWarehouseId,
        productId,
        lotNumber,
        expirationDate: expDate,
        binLocation: toBin,
        quantityOnHand: quantity,
      })
    }

    saveState("ob_inventory_fire", inventory)
    set({ inventory })
  },

  createRequisition: (reqData) => {
    const requisitions = get().requisitions
    const id = `REQ-${Math.random().toString(36).substring(2, 9)}`
    const requestNumber = `REQ-2026-${String(requisitions.length + 1).padStart(3, "0")}`
    const requestedDate = new Date().toISOString().split("T")[0]
    
    const newReq: Requisition = {
      ...reqData,
      id,
      requestNumber,
      requestedDate,
      status: "Pending Approval",
    }
    
    const updated = [newReq, ...requisitions]
    saveState("ob_requisitions_fire", updated)
    set({ requisitions: updated })
  },

  approveRequisition: (id) => {
    const requisitions = get().requisitions.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r))
    saveState("ob_requisitions_fire", requisitions)
    set({ requisitions })
  },

  rejectRequisition: (id) => {
    const requisitions = get().requisitions.map((r) => (r.id === id ? { ...r, status: "Rejected" as const } : r))
    saveState("ob_requisitions_fire", requisitions)
    set({ requisitions })
  },

  fulfillRequisition: (id) => {
    const req = get().requisitions.find((r) => r.id === id)
    if (!req) return

    const shipments = get().shipments
    const newShipmentId = `SH-${Math.random().toString(36).substring(2, 9)}`
    const shipmentNumber = `SH-OUT-${String(shipments.length + 1).padStart(3, "0")}`
    
    const shipmentItems: ShipmentItem[] = req.items.map((it) => ({
      productId: it.productId,
      quantityShipped: it.quantityRequested,
      quantityReceived: 0,
      lotNumber: "LOT-PICKED", 
      expirationDate: "",
    }))

    const newShipment: Shipment = {
      id: newShipmentId,
      shipmentNumber,
      type: "Outbound",
      origin: req.destinationWarehouseId, 
      destination: req.originWarehouseId, 
      status: "Draft",
      items: shipmentItems,
      requisitionId: req.id,
    }

    const updatedShipments = [newShipment, ...shipments]
    saveState("ob_shipments_fire", updatedShipments)

    const updatedRequisitions = get().requisitions.map((r) =>
      r.id === id ? { ...r, status: "Fulfilling" as const } : r
    )
    saveState("ob_requisitions_fire", updatedRequisitions)

    set({ shipments: updatedShipments, requisitions: updatedRequisitions })
  },

  createShipment: (shipmentData) => {
    const shipments = get().shipments
    const prefix = shipmentData.type === "Inbound" ? "SH-IN" : "SH-OUT"
    const shipmentNumber = `${prefix}-${String(shipments.length + 1).padStart(3, "0")}`
    const id = `SH-${Math.random().toString(36).substring(2, 9)}`
    
    const newShipment: Shipment = {
      ...shipmentData,
      id,
      shipmentNumber,
      status: shipmentData.status || "Draft",
    }
    
    const updated = [newShipment, ...shipments]
    saveState("ob_shipments_fire", updated)
    set({ shipments: updated })
  },

  receiveShipment: (shipmentId, receivedItems) => {
    const shipments = get().shipments.map((s) => {
      if (s.id !== shipmentId) return s

      const updatedItems = s.items.map((originalItem) => {
        const matchingReceived = receivedItems.find((r) => r.productId === originalItem.productId)
        return {
          ...originalItem,
          quantityReceived: matchingReceived ? matchingReceived.quantityReceived : originalItem.quantityReceived,
          lotNumber: matchingReceived ? matchingReceived.lotNumber : originalItem.lotNumber,
          expirationDate: matchingReceived ? matchingReceived.expirationDate : originalItem.expirationDate,
          binLocation: matchingReceived ? matchingReceived.binLocation : originalItem.binLocation,
        }
      })

      const totalShipped = s.items.reduce((sum, item) => sum + item.quantityShipped, 0)
      const totalReceived = receivedItems.reduce((sum, item) => sum + item.quantityReceived, 0)
      const status: Shipment["status"] = totalReceived === 0 ? "Shipped" : totalReceived >= totalShipped ? "Received" : "Partial"

      return {
        ...s,
        status,
        receivedDate: new Date().toISOString().split("T")[0],
        items: updatedItems,
      }
    })

    const inventory = [...get().inventory]
    const targetShipment = get().shipments.find((s) => s.id === shipmentId)
    const destinationWarehouse = targetShipment?.destination

    if (destinationWarehouse) {
      receivedItems.forEach((r) => {
        if (r.quantityReceived <= 0) return
        
        const existingIdx = inventory.findIndex(
          (item) =>
            item.warehouseId === destinationWarehouse &&
            item.productId === r.productId &&
            item.lotNumber === r.lotNumber &&
            item.binLocation === r.binLocation
        )

        if (existingIdx !== -1) {
          inventory[existingIdx].quantityOnHand += r.quantityReceived
        } else {
          inventory.push({
            id: `INV-${Math.random().toString(36).substring(2, 9)}`,
            warehouseId: destinationWarehouse,
            productId: r.productId,
            lotNumber: r.lotNumber,
            expirationDate: r.expirationDate,
            binLocation: r.binLocation,
            quantityOnHand: r.quantityReceived,
          })
        }
      })
    }

    let requisitions = [...get().requisitions]
    if (targetShipment?.requisitionId) {
      requisitions = requisitions.map((req) => {
        if (req.id === targetShipment.requisitionId) {
          const updatedReqItems = req.items.map((reqIt) => {
            const shipIt = receivedItems.find((ri) => ri.productId === reqIt.productId)
            return {
              ...reqIt,
              quantityFulfilled: reqIt.quantityFulfilled + (shipIt?.quantityReceived || 0),
            }
          })

          return {
            ...req,
            status: "Completed" as const,
            items: updatedReqItems,
          }
        }
        return req
      })
    }

    saveState("ob_shipments_fire", shipments)
    saveState("ob_inventory_fire", inventory)
    saveState("ob_requisitions_fire", requisitions)

    set({ shipments, inventory, requisitions })
  },

  pickPackShipOutbound: (shipmentId, carrier, trackingNumber, packedItems) => {
    const shipments = get().shipments.map((s) => {
      if (s.id !== shipmentId) return s

      const updatedItems = s.items.map((originalItem) => {
        const matchingPicked = packedItems.find((p) => p.productId === originalItem.productId)
        const invDetails = get().inventory.find(
          (inv) => inv.productId === originalItem.productId && inv.lotNumber === matchingPicked?.lotNumber
        )

        return {
          ...originalItem,
          lotNumber: matchingPicked ? matchingPicked.lotNumber : originalItem.lotNumber,
          expirationDate: invDetails?.expirationDate || "",
          binLocation: matchingPicked ? matchingPicked.binLocation : originalItem.binLocation,
        }
      })

      return {
        ...s,
        status: "Shipped" as const,
        carrier,
        trackingNumber,
        shippedDate: new Date().toISOString().split("T")[0],
        items: updatedItems,
      }
    })

    const targetShipment = get().shipments.find((s) => s.id === shipmentId)
    const originWarehouse = targetShipment?.origin
    const inventory = [...get().inventory]

    if (originWarehouse) {
      packedItems.forEach((p) => {
        const itemIdx = inventory.findIndex(
          (item) =>
            item.warehouseId === originWarehouse &&
            item.productId === p.productId &&
            item.lotNumber === p.lotNumber &&
            item.binLocation === p.binLocation
        )

        if (itemIdx !== -1) {
          inventory[itemIdx].quantityOnHand -= p.quantity
          if (inventory[itemIdx].quantityOnHand <= 0) {
            inventory.splice(itemIdx, 1) 
          }
        }
      })
    }

    saveState("ob_shipments_fire", shipments)
    saveState("ob_inventory_fire", inventory)

    set({ shipments, inventory })
  },

  createPurchaseOrder: (poData) => {
    const purchaseOrders = get().purchaseOrders
    const id = `PO-${Math.random().toString(36).substring(2, 9)}`
    const poNumber = `PO-2026-${String(purchaseOrders.length + 1).padStart(3, "0")}`
    const orderDate = new Date().toISOString().split("T")[0]

    const newPO: PurchaseOrder = {
      ...poData,
      id,
      poNumber,
      orderDate,
      status: "Pending Approval",
      warehouseId: get().selectedWarehouseId || undefined,
    }

    const updated = [newPO, ...purchaseOrders]
    saveState("ob_purchase_orders_fire", updated)
    set({ purchaseOrders: updated })
  },

  approvePurchaseOrder: (id) => {
    const purchaseOrders = get().purchaseOrders.map((po) =>
      po.id === id ? { ...po, status: "Approved" as const } : po
    )
    saveState("ob_purchase_orders_fire", purchaseOrders)
    set({ purchaseOrders })
  },

  completePurchaseOrder: (id) => {
    const purchaseOrders = get().purchaseOrders.map((po) =>
      po.id === id ? { ...po, status: "Completed" as const } : po
    )
    saveState("ob_purchase_orders_fire", purchaseOrders)
    set({ purchaseOrders })
  },

  addProject: (projData) => {
    const projects = get().projects
    const id = `PRJ-${Math.random().toString(36).substring(2, 9)}`
    const newProj: Project = {
      ...projData,
      id,
      allocatedItems: [],
    }

    const updated = [...projects, newProj]
    saveState("ob_projects_fire", updated)
    set({ projects: updated })
  },

  allocateProjectStock: (projectId, warehouseId, productId, quantity) => {
    const inventory = [...get().inventory]
    
    // Find all inventory items for this product in this warehouse
    const availItems = inventory.filter(
      (item) => item.warehouseId === warehouseId && item.productId === productId
    )
    const totalAvail = availItems.reduce((sum, item) => sum + item.quantityOnHand, 0)

    if (totalAvail < quantity) return false // Insufficient stock

    // Deduct stock from warehouse inventory (FIFO/LIFO doesn't strictly matter for mock, let's deduct from the first items)
    let remainingToDeduct = quantity
    for (const item of inventory) {
      if (item.warehouseId === warehouseId && item.productId === productId) {
        if (item.quantityOnHand >= remainingToDeduct) {
          item.quantityOnHand -= remainingToDeduct
          break
        } else {
          remainingToDeduct -= item.quantityOnHand
          item.quantityOnHand = 0
        }
      }
    }

    // Clean up zero-quantity inventory items
    const cleanedInventory = inventory.filter((item) => item.quantityOnHand > 0)

    // Update Project allocation
    const projects = get().projects.map((proj) => {
      if (proj.id !== projectId) return proj

      const items = [...proj.allocatedItems]
      const existingIdx = items.findIndex((it) => it.productId === productId)
      if (existingIdx !== -1) {
        items[existingIdx].quantityAllocated += quantity
      } else {
        items.push({ productId, quantityAllocated: quantity })
      }

      return {
        ...proj,
        allocatedItems: items,
      }
    })

    saveState("ob_inventory_fire", cleanedInventory)
    saveState("ob_projects_fire", projects)
    
    set({ inventory: cleanedInventory, projects })
    return true
  },

  removeWarehouse: (id) => {
    const updated = get().warehouses.filter((w) => w.id !== id)
    saveState("ob_warehouses_fire", updated)
    set({ warehouses: updated })
  },

  addSupplier: (newSup) => {
    const suppliers = get().suppliers
    const id = `SUP-${String(suppliers.length + 1).padStart(3, "0")}`
    const supWithId = { ...newSup, id }
    const updated = [...suppliers, supWithId]
    saveState("ob_suppliers_fire", updated)
    set({ suppliers: updated })
  },

  removeSupplier: (id) => {
    const updated = get().suppliers.filter((s) => s.id !== id)
    saveState("ob_suppliers_fire", updated)
    set({ suppliers: updated })
  },

  addZone: (warehouseId, name) => {
    const zones = get().zones
    const id = `Z-${String(zones.length + 1).padStart(3, "0")}`
    const updated = [...zones, { id, warehouseId, name }]
    saveState("ob_zones_fire", updated)
    set({ zones: updated })
  },

  removeZone: (id) => {
    const updated = get().zones.filter((z) => z.id !== id)
    const updatedBins = get().binLocations.filter((b) => b.zoneId !== id)
    saveState("ob_zones_fire", updated)
    saveState("ob_bins_fire", updatedBins)
    set({ zones: updated, binLocations: updatedBins })
  },

  addBin: (warehouseId, zoneId, code) => {
    const bins = get().binLocations
    const id = `B-${String(bins.length + 1).padStart(3, "0")}`
    const updated = [...bins, { id, warehouseId, zoneId, code }]
    saveState("ob_bins_fire", updated)
    set({ binLocations: updated })
  },

  removeBin: (id) => {
    const updated = get().binLocations.filter((b) => b.id !== id)
    saveState("ob_bins_fire", updated)
    set({ binLocations: updated })
  },

  addCategory: (name) => {
    const categories = get().categories
    const id = `CAT-${String(categories.length + 1).padStart(3, "0")}`
    const updated = [...categories, { id, name }]
    saveState("ob_categories_fire", updated)
    set({ categories: updated })
  },

  removeCategory: (id) => {
    const updated = get().categories.filter((c) => c.id !== id)
    saveState("ob_categories_fire", updated)
    set({ categories: updated })
  },

  addUom: (name) => {
    const uoms = get().uoms
    const id = `UOM-${String(uoms.length + 1).padStart(3, "0")}`
    const updated = [...uoms, { id, name }]
    saveState("ob_uoms_fire", updated)
    set({ uoms: updated })
  },

  removeUom: (id) => {
    const updated = get().uoms.filter((u) => u.id !== id)
    saveState("ob_uoms_fire", updated)
    set({ uoms: updated })
  },
}))
