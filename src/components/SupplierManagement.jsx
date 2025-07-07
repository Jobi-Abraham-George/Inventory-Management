import { useState } from "react";

export default function SupplierManagement({ suppliers, inventory, onUpdateSupplier, onAddSupplier, onDeleteSupplier }) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactInfo: {
      phone: "",
      email: "",
      address: "",
      contactPerson: "",
      website: ""
    },
    businessInfo: {
      leadTimeDays: 2,
      minimumOrder: 100,
      paymentTerms: "Net 30",
      deliveryDays: [],
      notes: ""
    },
    status: "active"
  });

  // Get supplier statistics
  const getSupplierStats = (supplierId) => {
    const supplierItems = inventory.filter(item => item.supplierId === supplierId);
    const totalItems = supplierItems.length;
    const totalValue = supplierItems.reduce((sum, item) => {
      return sum + ((item.onHandQty || 0) * (item.pricing?.unitCost || 0));
    }, 0);
    const lowStockItems = supplierItems.filter(item => (item.onHandQty || 0) <= 5).length;
    const outOfStockItems = supplierItems.filter(item => (item.onHandQty || 0) === 0).length;
    
    return { totalItems, totalValue, lowStockItems, outOfStockItems };
  };

  const getSupplierIcon = (supplierName) => {
    const icons = {
      'Cash n Carry': '🏪',
      'Veggie Order': '🥬',
      'Saputo Order': '🧀',
      'Sysco Order': '🍟',
      'Maroon Order': '🐟',
      'Fancy Lebanese': '🥙'
    };
    return icons[supplierName] || '🏢';
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim()) return;
    
    const supplierId = newSupplier.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const supplierWithId = {
      ...newSupplier,
      id: supplierId,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString()
    };
    
    onAddSupplier(supplierId, supplierWithId);
    setNewSupplier({
      name: "",
      contactInfo: { phone: "", email: "", address: "", contactPerson: "", website: "" },
      businessInfo: { leadTimeDays: 2, minimumOrder: 100, paymentTerms: "Net 30", deliveryDays: [], notes: "" },
      status: "active"
    });
    setShowAddForm(false);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier({ ...supplier });
    setShowEditForm(true);
  };

  const handleUpdateSupplier = () => {
    if (!editingSupplier || !editingSupplier.name.trim()) return;
    
    const updatedSupplier = {
      ...editingSupplier,
      updatedAt: new Date().toLocaleDateString()
    };
    
    onUpdateSupplier(editingSupplier.id, updatedSupplier);
    setEditingSupplier(null);
    setShowEditForm(false);
  };

  const handleDeleteSupplier = (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      onDeleteSupplier(supplierId);
      if (selectedSupplier?.id === supplierId) {
        setSelectedSupplier(null);
      }
    }
  };

  const handleDeliveryDayToggle = (day, isEditing = false) => {
    const target = isEditing ? editingSupplier : newSupplier;
    const setter = isEditing ? setEditingSupplier : setNewSupplier;
    
    const currentDays = target.businessInfo.deliveryDays || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setter({
      ...target,
      businessInfo: {
        ...target.businessInfo,
        deliveryDays: updatedDays
      }
    });
  };

  const renderSupplierForm = (supplier, isEditing = false) => {
    const formData = isEditing ? editingSupplier : newSupplier;
    const setFormData = isEditing ? setEditingSupplier : setNewSupplier;

    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100 border-b border-slate-600 pb-2">
              📋 Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Supplier Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100 border-b border-slate-600 pb-2">
              📞 Contact Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Contact Person</label>
              <input
                type="text"
                value={formData.contactInfo.contactPerson}
                onChange={(e) => setFormData({
                  ...formData,
                  contactInfo: {...formData.contactInfo, contactPerson: e.target.value}
                })}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  contactInfo: {...formData.contactInfo, phone: e.target.value}
                })}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contactInfo: {...formData.contactInfo, email: e.target.value}
                })}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="orders@supplier.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
              <input
                type="url"
                value={formData.contactInfo.website}
                onChange={(e) => setFormData({
                  ...formData,
                  contactInfo: {...formData.contactInfo, website: e.target.value}
                })}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="www.supplier.com"
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-100 border-b border-slate-600 pb-2">
              💼 Business Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Lead Time (Days)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.businessInfo.leadTimeDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    businessInfo: {...formData.businessInfo, leadTimeDays: parseInt(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Minimum Order ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.businessInfo.minimumOrder}
                  onChange={(e) => setFormData({
                    ...formData,
                    businessInfo: {...formData.businessInfo, minimumOrder: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Payment Terms</label>
                <select
                  value={formData.businessInfo.paymentTerms}
                  onChange={(e) => setFormData({
                    ...formData,
                    businessInfo: {...formData.businessInfo, paymentTerms: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="COD">Cash on Delivery</option>
                  <option value="Prepaid">Prepaid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Delivery Days</label>
              <div className="flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDeliveryDayToggle(day, isEditing)}
                    className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                      (formData.businessInfo.deliveryDays || []).includes(day)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
              <textarea
                value={formData.contactInfo.address}
                onChange={(e) => setFormData({
                  ...formData,
                  contactInfo: {...formData.contactInfo, address: e.target.value}
                })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full business address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
              <textarea
                value={formData.businessInfo.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  businessInfo: {...formData.businessInfo, notes: e.target.value}
                })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes about this supplier..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-600">
          <button
            onClick={() => {
              if (isEditing) {
                setShowEditForm(false);
                setEditingSupplier(null);
              } else {
                setShowAddForm(false);
              }
            }}
            className="px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={isEditing ? handleUpdateSupplier : handleAddSupplier}
            disabled={!formData.name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEditing ? 'Update Supplier' : 'Add Supplier'}
          </button>
        </div>
      </div>
    );
  };

  const supplierList = Object.values(suppliers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Supplier Management</h2>
          <p className="text-slate-400">Manage your suppliers, contacts, and business terms</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Add New Supplier
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div>
          <h3 className="text-xl font-semibold text-slate-100 mb-4">Add New Supplier</h3>
          {renderSupplierForm(null, false)}
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && editingSupplier && (
        <div>
          <h3 className="text-xl font-semibold text-slate-100 mb-4">Edit Supplier</h3>
          {renderSupplierForm(editingSupplier, true)}
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {supplierList.map(supplier => {
          const stats = getSupplierStats(supplier.id);
          return (
            <div key={supplier.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              {/* Supplier Header */}
              <div className="bg-slate-700 p-4 border-b border-slate-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-xl">{getSupplierIcon(supplier.name)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">{supplier.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.status === 'active' ? 'bg-green-600 text-green-100' :
                          supplier.status === 'inactive' ? 'bg-red-600 text-red-100' :
                          'bg-yellow-600 text-yellow-100'
                        }`}>
                          {supplier.status}
                        </span>
                        <span className="text-xs text-slate-400">
                          {stats.totalItems} items
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditSupplier(supplier)}
                      className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Edit supplier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Delete supplier"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* Supplier Details */}
              <div className="p-4 space-y-4">
                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">📞 Contact</h4>
                  <div className="space-y-1 text-sm text-slate-400">
                    {supplier.contactInfo.contactPerson && (
                      <div>👤 {supplier.contactInfo.contactPerson}</div>
                    )}
                    {supplier.contactInfo.phone && (
                      <div>📱 {supplier.contactInfo.phone}</div>
                    )}
                    {supplier.contactInfo.email && (
                      <div>📧 {supplier.contactInfo.email}</div>
                    )}
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">💼 Business Terms</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                    <div>📅 {supplier.businessInfo.leadTimeDays}d lead time</div>
                    <div>💰 ${supplier.businessInfo.minimumOrder} min</div>
                    <div className="col-span-2">💳 {supplier.businessInfo.paymentTerms}</div>
                  </div>
                </div>

                {/* Delivery Days */}
                {supplier.businessInfo.deliveryDays && supplier.businessInfo.deliveryDays.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">🚚 Delivery Days</h4>
                    <div className="flex flex-wrap gap-1">
                      {supplier.businessInfo.deliveryDays.map(day => (
                        <span key={day} className="px-2 py-1 bg-blue-600 text-blue-100 text-xs rounded">
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">📊 Inventory Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-slate-400">
                      💵 Value: <span className="text-slate-300">${stats.totalValue.toFixed(2)}</span>
                    </div>
                    <div className="text-slate-400">
                      📦 Items: <span className="text-slate-300">{stats.totalItems}</span>
                    </div>
                    {stats.lowStockItems > 0 && (
                      <div className="text-orange-400">
                        ⚠️ Low: {stats.lowStockItems}
                      </div>
                    )}
                    {stats.outOfStockItems > 0 && (
                      <div className="text-red-400">
                        ❌ Out: {stats.outOfStockItems}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {supplierList.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No suppliers yet</h3>
          <p className="text-slate-400 mb-4">Add your first supplier to get started</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Supplier
          </button>
        </div>
      )}
    </div>
  );
}