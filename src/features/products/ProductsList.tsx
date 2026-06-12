import { useState } from "react"
import { Link } from "react-router-dom"
import { useWarehouseStore, type Product } from "@/store/useWarehouseStore"
import { Search, Plus, Edit, Eye, AlertCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function ProductsList() {
  const { products, inventory, addProduct, updateProduct, categories: storeCategories, uoms: storeUoms } = useWarehouseStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  
  // Dialog state
  const [isOpen, setIsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Form fields
  const [sku, setSku] = useState("")
  const [name, setName] = useState("")
  const [category, setCategory] = useState(storeCategories[0]?.name || "Sprinklers")
  const [unitOfMeasure, setUnitOfMeasure] = useState(storeUoms[0]?.name || "Each")
  const [minLevel, setMinLevel] = useState(10)
  const [status, setStatus] = useState<"Active" | "Inactive">("Active")
  const [description, setDescription] = useState("")


  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setSku(product.sku)
    setName(product.name)
    setCategory(product.category)
    setUnitOfMeasure(product.unitOfMeasure)
    setMinLevel(product.minLevel)
    setStatus(product.status)
    setDescription(product.description)
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sku || !name) return

    const productData = {
      sku,
      name,
      category,
      unitOfMeasure,
      minLevel: Number(minLevel),
      status,
      description,
    }

    if (editingProduct) {
      updateProduct({ ...productData, id: editingProduct.id })
    } else {
      addProduct(productData)
    }
    setIsOpen(false)
  }

  // Calculate stock levels per product
  const getProductStock = (productId: string) => {
    return inventory
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantityOnHand, 0)
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = ["All", ...storeCategories.map((c) => c.name)]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Product Catalog
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your master list of fire protection equipment, track SKU codes, categories, and safety stock thresholds.
          </p>
        </div>
        <Link to="/products/create">
          <Button className="rounded-xl shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/40 backdrop-blur-sm p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by SKU, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => {
          const stock = getProductStock(product.id)
          const isLowStock = stock < product.minLevel

          return (
            <Card
              key={product.id}
              className="relative overflow-hidden border border-white/5 bg-background/30 backdrop-blur-md hover:bg-background/50 transition-all hover:shadow-md rounded-2xl"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
                      {product.sku}
                    </span>
                    <h3 className="font-bold text-lg mt-0.5 line-clamp-1 hover:text-primary transition-colors">
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                  </div>
                  <Badge variant={product.status === "Active" ? "default" : "secondary"} className="rounded-full">
                    {product.status}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 h-10">
                  {product.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5">
                  <div>
                    <span className="text-xs text-muted-foreground block">Category</span>
                    <span className="font-semibold text-sm">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">UOM</span>
                    <span className="font-semibold text-sm">{product.unitOfMeasure}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 bg-muted/30 p-3 rounded-xl">
                  <div>
                    <span className="text-xs text-muted-foreground block">In Stock Total</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-xl font-black ${isLowStock ? "text-rose-500" : "text-emerald-500"}`}>
                        {stock}
                      </span>
                      <span className="text-xs text-muted-foreground">/ min {product.minLevel}</span>
                    </div>
                  </div>
                  
                  {isLowStock ? (
                    <div className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg text-xs font-bold border border-rose-500/10">
                      <AlertCircle className="h-3.5 w-3.5" /> Low Stock
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-500/10">
                      <ShoppingBag className="h-3.5 w-3.5" /> Stocked
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 justify-end">
                  <Link to={`/products/${product.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-lg h-9">
                      <Eye className="h-4 w-4 mr-1.5" /> View Stock
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} className="rounded-lg h-9 border-white/10">
                    <Edit className="h-4 w-4 mr-1.5" /> Edit
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-background/20 rounded-2xl border border-dashed border-white/10">
            No products found matching filters.
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-white/10 glass-card">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                Fill in the product details to update the product catalog catalog.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sku">SKU Code *</Label>
                  <Input
                    id="sku"
                    placeholder="e.g. AMOX-500"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Pendent Fire Sprinkler 68°C"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {storeCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    {storeCategories.length === 0 && (
                      <option value="Sprinklers">Sprinklers</option>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="uom">Unit of Measure</Label>
                  <select
                    id="uom"
                    value={unitOfMeasure}
                    onChange={(e) => setUnitOfMeasure(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {storeUoms.map((uom) => (
                      <option key={uom.id} value={uom.name}>{uom.name}</option>
                    ))}
                    {storeUoms.length === 0 && (
                      <option value="Each">Each</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="minLevel">Minimum Stock Level</Label>
                  <Input
                    id="minLevel"
                    type="number"
                    value={minLevel}
                    onChange={(e) => setMinLevel(Number(e.target.value))}
                    min={0}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "Active" | "Inactive")}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Product Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe the fire safety specifications, certifications, installation guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[80px] p-3 rounded-xl border border-input bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
