import { useState, useEffect } from "react";

export default function SearchAndFilters({
  inventory,
  searchQuery,
  setSearchQuery,
  selectedSuppliers,
  setSelectedSuppliers,
  selectedStatuses,
  setSelectedStatuses,
  selectedUOMs,
  setSelectedUOMs,
  showFilters,
  setShowFilters,
  applyQuickFilter,
  hasActiveFilters
}) {
  const [availableUOMs, setAvailableUOMs] = useState([]);

  // Extract available UOMs from inventory
  useEffect(() => {
    if (inventory) {
      const uoms = new Set();
      Object.values(inventory).forEach(items => {
        items.forEach(item => {
          if (item.uom) {
            uoms.add(item.uom);
          }
        });
      });
      setAvailableUOMs(Array.from(uoms).sort());
    }
  }, [inventory]);

  const handleSupplierToggle = (supplier) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplier) 
        ? prev.filter(s => s !== supplier)
        : [...prev, supplier]
    );
  };

  const handleStatusToggle = (status) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleUOMToggle = (uom) => {
    setSelectedUOMs(prev => 
      prev.includes(uom) 
        ? prev.filter(u => u !== uom)
        : [...prev, uom]
    );
  };

  const statusOptions = [
    { value: 'out', label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { value: 'low', label: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { value: 'medium', label: 'Medium Stock', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { value: 'good', label: 'Good Stock', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  ];

  return (
    <div className="mb-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-lg">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search items, suppliers, or units..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 touch-manipulation"
          >
            <span className="text-lg">✕</span>
          </button>
        )}
      </div>

      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => applyQuickFilter('out-of-stock')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
            selectedStatuses.includes('out') 
              ? 'bg-red-100 text-red-700 border-2 border-red-300' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
          }`}
        >
          🔴 Out of Stock
        </button>
        <button
          onClick={() => applyQuickFilter('low-stock')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
            selectedStatuses.includes('low') 
              ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
          }`}
        >
          🟠 Low Stock
        </button>
        <button
          onClick={() => applyQuickFilter('in-stock')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
            (selectedStatuses.includes('medium') && selectedStatuses.includes('good'))
              ? 'bg-green-100 text-green-700 border-2 border-green-300' 
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
          }`}
        >
          🟢 In Stock
        </button>
        {hasActiveFilters && (
          <button
            onClick={() => applyQuickFilter('clear')}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 transition-colors touch-manipulation"
          >
            ✕ Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 touch-manipulation"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>

          {/* Suppliers Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Suppliers</h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(inventory || {}).map(supplier => (
                <button
                  key={supplier}
                  onClick={() => handleSupplierToggle(supplier)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                    selectedSuppliers.includes(supplier)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {supplier}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Stock Status</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  onClick={() => handleStatusToggle(status.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation border-2 ${
                    selectedStatuses.includes(status.value)
                      ? `${status.bg} ${status.color} ${status.border}`
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* UOM Filter */}
          {availableUOMs.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Unit of Measure</h4>
              <div className="flex flex-wrap gap-2">
                {availableUOMs.map(uom => (
                  <button
                    key={uom}
                    onClick={() => handleUOMToggle(uom)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                      selectedUOMs.includes(uom)
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {uom}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => applyQuickFilter('clear')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(searchQuery || selectedSuppliers.length > 0 || selectedStatuses.length > 0 || selectedUOMs.length > 0) && !showFilters && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Active filters:</span>
            
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ✕
                </button>
              </span>
            )}
            
            {selectedSuppliers.map(supplier => (
              <span key={supplier} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                {supplier}
                <button
                  onClick={() => handleSupplierToggle(supplier)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  ✕
                </button>
              </span>
            ))}
            
            {selectedStatuses.map(status => {
              const statusInfo = statusOptions.find(s => s.value === status);
              return (
                <span key={status} className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusInfo?.bg} ${statusInfo?.color}`}>
                  {statusInfo?.label}
                  <button
                    onClick={() => handleStatusToggle(status)}
                    className="ml-1 hover:opacity-70"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            
            {selectedUOMs.map(uom => (
              <span key={uom} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                {uom}
                <button
                  onClick={() => handleUOMToggle(uom)}
                  className="ml-1 text-purple-500 hover:text-purple-700"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}