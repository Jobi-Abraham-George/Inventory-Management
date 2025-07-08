import { useState, useMemo } from 'react';

export default function SupplierManagement({ suppliers, inventory, onUpdateSupplier, onAddSupplier, onDeleteSupplier }) {
  const [activeView, setActiveView] = useState('list'); // list, add, edit
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Supplier form state
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      contactPerson: '',
      website: ''
    },
    businessInfo: {
      leadTimeDays: 2,
      minimumOrder: 100,
      paymentTerms: 'Net 30',
      deliveryDays: [],
      notes: ''
    },
    status: 'active'
  });

  // Calculate supplier performance metrics
  const getSupplierMetrics = (supplierId) => {
    const supplierItems = inventory.filter(item => item.supplierId === supplierId);
    const totalItems = supplierItems.length;
    const totalValue = supplierItems.reduce((sum, item) => 
      sum + ((item.onHandQty || 0) * (item.pricing?.unitCost || 0)), 0
    );
    const lowStockItems = supplierItems.filter(item => (item.onHandQty || 0) <= 5 && (item.onHandQty || 0) > 0).length;
    const outOfStockItems = supplierItems.filter(item => (item.onHandQty || 0) === 0).length;
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      stockHealth: totalItems > 0 ? ((totalItems - outOfStockItems - lowStockItems) / totalItems * 100) : 100
    };
  };

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    const supplierArray = Object.values(suppliers || {});
    return supplierArray.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          supplier.contactInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          supplier.contactInfo?.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchQuery, statusFilter]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (activeView === 'add') {
      const newId = supplierForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const newSupplier = {
        ...supplierForm,
        id: newId,
        createdAt: new Date().toLocaleDateString(),
        updatedAt: new Date().toLocaleDateString()
      };
      onAddSupplier(newId, newSupplier);
    } else if (activeView === 'edit' && selectedSupplier) {
      const updatedSupplier = {
        ...supplierForm,
        id: selectedSupplier.id,
        createdAt: selectedSupplier.createdAt,
        updatedAt: new Date().toLocaleDateString()
      };
      onUpdateSupplier(selectedSupplier.id, updatedSupplier);
    }
    
    // Reset form and return to list
    resetForm();
    setActiveView('list');
  };

  // Reset form
  const resetForm = () => {
    setSupplierForm({
      name: '',
      contactInfo: {
        phone: '',
        email: '',
        address: '',
        contactPerson: '',
        website: ''
      },
      businessInfo: {
        leadTimeDays: 2,
        minimumOrder: 100,
        paymentTerms: 'Net 30',
        deliveryDays: [],
        notes: ''
      },
      status: 'active'
    });
    setSelectedSupplier(null);
  };

  // Start editing a supplier
  const startEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setSupplierForm({ ...supplier });
    setActiveView('edit');
  };

  // Handle delete with confirmation
  const handleDelete = (supplier) => {
    if (window.confirm(`Are you sure you want to delete ${supplier.name}? This will also remove all associated inventory items.`)) {
      onDeleteSupplier(supplier.id);
    }
  };

  // Handle delivery days
  const toggleDeliveryDay = (day) => {
    const currentDays = supplierForm.businessInfo.deliveryDays || [];
    const updatedDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    
    setSupplierForm(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        deliveryDays: updatedDays
      }
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
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

  // Render supplier list view
  if (activeView === 'list') {
    return (
      <div className="py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Supplier Management</h2>
            <p className="text-slate-400">Manage your restaurant suppliers and vendor relationships</p>
          </div>
          <button
            onClick={() => setActiveView('add')}
            className="mt-4 sm:mt-0 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
          >
            <span className="mr-2">➕</span>
            Add New Supplier
          </button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search suppliers by name, email, or contact person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Suppliers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => {
            const metrics = getSupplierMetrics(supplier.id);
            return (
              <div key={supplier.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors">
                {/* Supplier Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl mr-3">{getSupplierIcon(supplier.name)}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">{supplier.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.status === 'active' 
                            ? 'bg-green-900/50 text-green-300 border border-green-600' 
                            : 'bg-red-900/50 text-red-300 border border-red-600'
                        }`}>
                          {supplier.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(supplier)}
                      className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit Supplier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(supplier)}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete Supplier"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-300">
                    <span className="mr-2">👤</span>
                    {supplier.contactInfo?.contactPerson || 'No contact person'}
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <span className="mr-2">📞</span>
                    {supplier.contactInfo?.phone || 'No phone'}
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <span className="mr-2">📧</span>
                    {supplier.contactInfo?.email || 'No email'}
                  </div>
                </div>

                {/* Business Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-slate-400">Lead Time</div>
                    <div className="text-slate-100 font-medium">{supplier.businessInfo?.leadTimeDays || 0} days</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Min Order</div>
                    <div className="text-slate-100 font-medium">${supplier.businessInfo?.minimumOrder || 0}</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-400">Total Items</div>
                      <div className="text-slate-100 font-bold">{metrics.totalItems}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total Value</div>
                      <div className="text-green-400 font-bold">{formatCurrency(metrics.totalValue)}</div>
                    </div>
                  </div>
                  
                  {metrics.totalItems > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Stock Health</span>
                        <span>{Math.round(metrics.stockHealth)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metrics.stockHealth >= 80 ? 'bg-green-500' :
                            metrics.stockHealth >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${metrics.stockHealth}%` }}
                        ></div>
                      </div>
                      
                      {(metrics.lowStockItems > 0 || metrics.outOfStockItems > 0) && (
                        <div className="flex space-x-3 mt-2 text-xs">
                          {metrics.lowStockItems > 0 && (
                            <span className="text-orange-400">🟠 {metrics.lowStockItems} low</span>
                          )}
                          {metrics.outOfStockItems > 0 && (
                            <span className="text-red-400">🔴 {metrics.outOfStockItems} out</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSuppliers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏭</div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No suppliers found' : 'No suppliers yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first supplier to get started'
              }
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <button
                onClick={() => setActiveView('add')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add First Supplier
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render add/edit form
  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {activeView === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
          </h2>
          <p className="text-slate-400">
            {activeView === 'add' 
              ? 'Enter supplier information to add them to your system'
              : 'Update supplier information and business details'
            }
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setActiveView('list');
          }}
          className="px-4 py-2 text-slate-400 hover:text-slate-100 transition-colors"
        >
          ← Back to List
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierForm.name}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={supplierForm.status}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={supplierForm.contactInfo.contactPerson}
                    onChange={(e) => setSupplierForm(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, contactPerson: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Primary contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={supplierForm.contactInfo.phone}
                    onChange={(e) => setSupplierForm(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, phone: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={supplierForm.contactInfo.email}
                    onChange={(e) => setSupplierForm(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, email: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="supplier@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={supplierForm.contactInfo.website}
                    onChange={(e) => setSupplierForm(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, website: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="www.supplier.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={supplierForm.contactInfo.address}
                    onChange={(e) => setSupplierForm(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, address: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4">Business Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Lead Time (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={supplierForm.businessInfo.leadTimeDays}
                      onChange={(e) => setSupplierForm(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, leadTimeDays: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Minimum Order ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={supplierForm.businessInfo.minimumOrder}
                      onChange={(e) => setSupplierForm(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, minimumOrder: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Payment Terms
                  </label>
                  <select
                    value={supplierForm.businessInfo.paymentTerms}
                    onChange={(e) => setSupplierForm(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, paymentTerms: e.target.value }
                    }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Delivery Days
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(supplierForm.businessInfo.deliveryDays || []).includes(day)}
                          onChange={() => toggleDeliveryDay(day)}
                          className="mr-2 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-300">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={supplierForm.businessInfo.notes}
                    onChange={(e) => setSupplierForm(prev => ({
                      ...prev,
                      businessInfo: { ...prev.businessInfo, notes: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Additional notes about this supplier..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            {activeView === 'add' ? 'Add Supplier' : 'Update Supplier'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setActiveView('list');
            }}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}