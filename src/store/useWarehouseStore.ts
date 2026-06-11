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
  type: "Warehouse" | "Pharmacy" | "Cold Storage" | "Clinic"
  location: string
  status: "Active" | "Inactive"
  capacity: number // percentage
  manager: string
}

export interface InventoryItem {
  id: string
  productId: string
  warehouseId: string
  lotNumber: string
  expirationDate: string
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
  originWarehouseId: string // The warehouse/ward requesting the items
  destinationWarehouseId: string // The warehouse serving the items
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
  destination: string // Warehouse ID for Inbound, Customer name or Warehouse ID for Outbound
  status: "Draft" | "Shipped" | "Receiving" | "Received" | "Partial" | "Cancelled"
  trackingNumber?: string
  carrier?: string
  shippedDate?: string
  receivedDate?: string
  items: ShipmentItem[]
  requisitionId?: string
}

interface WarehouseState {
  products: Product[]
  warehouses: Warehouse[]
  inventory: InventoryItem[]
  requisitions: Requisition[]
  shipments: Shipment[]

  // Product Actions
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (product: Product) => void

  // Warehouse Actions
  addWarehouse: (warehouse: Omit<Warehouse, "id" | "capacity">) => void

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
  fulfillRequisition: (id: string) => void // Spawns outbound shipment

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
}

// Initial Mock Data
const initialProducts: Product[] = [
  {
    id: "PROD-001",
    sku: "AMOX-250",
    name: "Amoxicillin 250mg",
    category: "Medications",
    unitOfMeasure: "Box",
    status: "Active",
    minLevel: 100,
    description: "Broad-spectrum antibiotic medication capsule.",
  },
  {
    id: "PROD-002",
    sku: "SYR-5ML",
    name: "Sterile Syringes 5ml",
    category: "Consumables",
    unitOfMeasure: "Pack",
    status: "Active",
    minLevel: 500,
    description: "Individually wrapped single-use sterile medical syringes.",
  },
  {
    id: "PROD-003",
    sku: "SAL-1L",
    name: "Normal Saline 1L",
    category: "Fluids",
    unitOfMeasure: "Bag",
    status: "Active",
    minLevel: 200,
    description: "Intravenous Normal Saline Solution 0.9% 1000ml infusion.",
  },
  {
    id: "PROD-004",
    sku: "MSK-SURG",
    name: "Surgical Masks 3-Ply",
    category: "PPE",
    unitOfMeasure: "Box",
    status: "Active",
    minLevel: 300,
    description: "Disposable 3-layer surgical protective face masks (50/box).",
  },
  {
    id: "PROD-005",
    sku: "PARA-500",
    name: "Paracetamol 500mg",
    category: "Medications",
    unitOfMeasure: "Bottle",
    status: "Active",
    minLevel: 150,
    description: "Analgesic and antipyretic tablets for pain relief.",
  },
]

const initialWarehouses: Warehouse[] = [
  {
    id: "WH-001",
    code: "CWH",
    name: "Central Warehouse",
    type: "Warehouse",
    location: "Zone A, Logistics Center",
    status: "Active",
    capacity: 82,
    manager: "Alice Vance",
  },
  {
    id: "WH-002",
    code: "PHW",
    name: "Pharmacy Ward",
    type: "Pharmacy",
    location: "Building B, Ground Floor",
    status: "Active",
    capacity: 45,
    manager: "Bob Miller",
  },
  {
    id: "WH-003",
    code: "CSH",
    name: "Cold Storage Hub",
    type: "Cold Storage",
    location: "Zone C, Temp Controlled",
    status: "Active",
    capacity: 28,
    manager: "Charlie Green",
  },
]

const initialInventory: InventoryItem[] = [
  {
    id: "INV-001",
    productId: "PROD-001",
    warehouseId: "WH-001",
    lotNumber: "LOT-2026A",
    expirationDate: "2028-06-30",
    binLocation: "BIN-A1",
    quantityOnHand: 1200,
  },
  {
    id: "INV-002",
    productId: "PROD-002",
    warehouseId: "WH-001",
    lotNumber: "LOT-2026B",
    expirationDate: "2029-12-31",
    binLocation: "BIN-B3",
    quantityOnHand: 3000,
  },
  {
    id: "INV-003",
    productId: "PROD-003",
    warehouseId: "WH-001",
    lotNumber: "LOT-2026C",
    expirationDate: "2027-09-15",
    binLocation: "BIN-C2",
    quantityOnHand: 800,
  },
  {
    id: "INV-004",
    productId: "PROD-004",
    warehouseId: "WH-001",
    lotNumber: "LOT-2026D",
    expirationDate: "2031-01-01",
    binLocation: "BIN-D1",
    quantityOnHand: 1500,
  },
  {
    id: "INV-005",
    productId: "PROD-001",
    warehouseId: "WH-002",
    lotNumber: "LOT-2026A",
    expirationDate: "2028-06-30",
    binLocation: "SHELF-1",
    quantityOnHand: 50,
  },
  {
    id: "INV-006",
    productId: "PROD-005",
    warehouseId: "WH-002",
    lotNumber: "LOT-2026E",
    expirationDate: "2028-04-10",
    binLocation: "SHELF-3",
    quantityOnHand: 200,
  },
]

const initialRequisitions: Requisition[] = [
  {
    id: "REQ-001",
    requestNumber: "REQ-2026-001",
    originWarehouseId: "WH-002",
    destinationWarehouseId: "WH-001",
    requestedBy: "Dr. Sarah Adams",
    requestedDate: "2026-06-10",
    urgency: "High",
    status: "Pending Approval",
    items: [
      { productId: "PROD-001", quantityRequested: 100, quantityFulfilled: 0 },
      { productId: "PROD-002", quantityRequested: 500, quantityFulfilled: 0 },
    ],
  },
  {
    id: "REQ-002",
    requestNumber: "REQ-2026-002",
    originWarehouseId: "WH-002",
    destinationWarehouseId: "WH-001",
    requestedBy: "Nurse Kelly",
    requestedDate: "2026-06-05",
    urgency: "Medium",
    status: "Completed",
    items: [
      { productId: "PROD-005", quantityRequested: 50, quantityFulfilled: 50 },
    ],
  },
]

const initialShipments: Shipment[] = [
  {
    id: "SH-001",
    shipmentNumber: "SH-2026-001",
    type: "Inbound",
    origin: "Global Pharma Corp",
    destination: "WH-001",
    status: "Shipped",
    trackingNumber: "TRK8849204",
    carrier: "DHL Express",
    shippedDate: "2026-06-08",
    items: [
      { productId: "PROD-001", quantityShipped: 500, quantityReceived: 0, lotNumber: "LOT-2026F", expirationDate: "2028-10-31" },
      { productId: "PROD-005", quantityShipped: 400, quantityReceived: 0, lotNumber: "LOT-2026G", expirationDate: "2028-09-30" },
    ],
  },
  {
    id: "SH-002",
    shipmentNumber: "SH-2026-002",
    type: "Inbound",
    origin: "MedSupply Inc",
    destination: "WH-003",
    status: "Received",
    trackingNumber: "TRK1102934",
    carrier: "FedEx",
    shippedDate: "2026-06-02",
    receivedDate: "2026-06-05",
    items: [
      { productId: "PROD-003", quantityShipped: 1000, quantityReceived: 1000, lotNumber: "LOT-2026H", expirationDate: "2027-11-20", binLocation: "BIN-CS1" },
    ],
  },
]

// Fetch state helpers
const getSavedState = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key)
  if (!data) return fallback
  try {
    return JSON.parse(data)
  } catch {
    return fallback
  }
}

const saveState = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  products: getSavedState("ob_products", initialProducts),
  warehouses: getSavedState("ob_warehouses", initialWarehouses),
  inventory: getSavedState("ob_inventory", initialInventory),
  requisitions: getSavedState("ob_requisitions", initialRequisitions),
  shipments: getSavedState("ob_shipments", initialShipments),

  addProduct: (newProd) => {
    const products = get().products
    const id = `PROD-${String(products.length + 1).padStart(3, "0")}`
    const productWithId = { ...newProd, id }
    const updated = [...products, productWithId]
    saveState("ob_products", updated)
    set({ products: updated })
  },

  updateProduct: (updatedProd) => {
    const products = get().products.map((p) => (p.id === updatedProd.id ? updatedProd : p))
    saveState("ob_products", products)
    set({ products })
  },

  addWarehouse: (newWH) => {
    const warehouses = get().warehouses
    const id = `WH-${String(warehouses.length + 1).padStart(3, "0")}`
    const whWithId = { ...newWH, id, capacity: 0 }
    const updated = [...warehouses, whWithId]
    saveState("ob_warehouses", updated)
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

    saveState("ob_inventory", inventory)
    set({ inventory })
  },

  transferStock: (fromWarehouseId, toWarehouseId, productId, lotNumber, fromBin, toBin, quantity) => {
    const inventory = [...get().inventory]
    
    // Find source inventory
    const sourceIdx = inventory.findIndex(
      (item) =>
        item.warehouseId === fromWarehouseId &&
        item.productId === productId &&
        item.lotNumber === lotNumber &&
        item.binLocation === fromBin
    )

    if (sourceIdx === -1 || inventory[sourceIdx].quantityOnHand < quantity) return

    // Deduct from source
    inventory[sourceIdx].quantityOnHand -= quantity
    const expDate = inventory[sourceIdx].expirationDate
    if (inventory[sourceIdx].quantityOnHand === 0) {
      inventory.splice(sourceIdx, 1)
    }

    // Add to destination
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

    saveState("ob_inventory", inventory)
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
    saveState("ob_requisitions", updated)
    set({ requisitions: updated })
  },

  approveRequisition: (id) => {
    const requisitions = get().requisitions.map((r) => (r.id === id ? { ...r, status: "Approved" as const } : r))
    saveState("ob_requisitions", requisitions)
    set({ requisitions })
  },

  rejectRequisition: (id) => {
    const requisitions = get().requisitions.map((r) => (r.id === id ? { ...r, status: "Rejected" as const } : r))
    saveState("ob_requisitions", requisitions)
    set({ requisitions })
  },

  fulfillRequisition: (id) => {
    const req = get().requisitions.find((r) => r.id === id)
    if (!req) return

    // Create Outbound Shipment automatically
    const shipments = get().shipments
    const newShipmentId = `SH-${Math.random().toString(36).substring(2, 9)}`
    const shipmentNumber = `SH-OUT-${String(shipments.length + 1).padStart(3, "0")}`
    
    // Map requisition items to shipment items
    const shipmentItems: ShipmentItem[] = req.items.map((it) => ({
      productId: it.productId,
      quantityShipped: it.quantityRequested,
      quantityReceived: 0,
      lotNumber: "LOT-PICKED", // to be populated during picking
      expirationDate: "",
    }))

    const newShipment: Shipment = {
      id: newShipmentId,
      shipmentNumber,
      type: "Outbound",
      origin: req.destinationWarehouseId, // Serving warehouse is origin
      destination: req.originWarehouseId, // Requesting ward is destination
      status: "Draft",
      items: shipmentItems,
      requisitionId: req.id,
    }

    const updatedShipments = [newShipment, ...shipments]
    saveState("ob_shipments", updatedShipments)

    const updatedRequisitions = get().requisitions.map((r) =>
      r.id === id ? { ...r, status: "Fulfilling" as const } : r
    )
    saveState("ob_requisitions", updatedRequisitions)

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
    saveState("ob_shipments", updated)
    set({ shipments: updated })
  },

  receiveShipment: (shipmentId, receivedItems) => {
    const shipments = get().shipments.map((s) => {
      if (s.id !== shipmentId) return s

      // Map incoming details
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

      // Check if completely or partially received
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

    // Update Inventory
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

    // If shipment was tied to a Requisition, mark requisition as Completed
    let requisitions = [...get().requisitions]
    if (targetShipment?.requisitionId) {
      requisitions = requisitions.map((req) => {
        if (req.id === targetShipment.requisitionId) {
          // Update fulfilled quantities on requisition items
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

    saveState("ob_shipments", shipments)
    saveState("ob_inventory", inventory)
    saveState("ob_requisitions", requisitions)

    set({ shipments, inventory, requisitions })
  },

  pickPackShipOutbound: (shipmentId, carrier, trackingNumber, packedItems) => {
    const shipments = get().shipments.map((s) => {
      if (s.id !== shipmentId) return s

      // Update shipment items to include chosen lots & exp dates from pickedItems
      const updatedItems = s.items.map((originalItem) => {
        const matchingPicked = packedItems.find((p) => p.productId === originalItem.productId)
        // Find actual inventory details to get expiration date
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

    // Deduct stock from origin warehouse
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
            inventory.splice(itemIdx, 1) // Remove item if quantity falls to zero
          }
        }
      })
    }

    saveState("ob_shipments", shipments)
    saveState("ob_inventory", inventory)

    set({ shipments, inventory })
  },
}))
