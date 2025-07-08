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
    try {
      if (inventory) {
        const uoms = new Set();
        Object.values(inventory).forEach(items => {
          if (Array.isArray(items)) {
            items.forEach(item => {
              if (item && item.uom) {
                uoms.add(item.uom);
              }
            });
          }
        });
        setAvailableUOMs(Array.from(uoms).sort());
      }
    } catch (error) {
      console.error("Error extracting UOMs:", error);
      setAvailableUOMs([]);
    }
  }, [inventory]);

  const handleSupplierToggle = (supplier) => {
    try {
      setSelectedSuppliers(prev => 
        prev.includes(supplier) 
          ? prev.filter(s => s !== supplier)
          : [...prev, supplier]
      );
    } catch (error) {
      console.error("Error toggling supplier:", error);
    }
  };

  const handleStatusToggle = (status) => {
    try {
      setSelectedStatuses(prev => 
        prev.includes(status) 
          ? prev.filter(s => s !== status)
          : [...prev, status]
      );
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleUOMToggle = (uom) => {
    try {
      setSelectedUOMs(prev => 
        prev.includes(uom) 
          ? prev.filter(u => u !== uom)
          : [...prev, uom]
      );
    } catch (error) {
      console.error("Error toggling UOM:", error);
    }
  };

  const handleSearchChange = (e) => {
    try {
      const value = e.target.value;
      console.log("Search input changed:", value); // Debug logging
      // Sanitize the input to prevent any issues
      const sanitizedValue = value.replace(/[<>]/g, '');
      console.log("Sanitized search value:", sanitizedValue); // Debug logging
      setSearchQuery(sanitizedValue);
    } catch (error) {
      console.error("Error handling search change:", error);
    }
  };

  const handleSearchClear = () => {
    try {
      console.log("Clearing search"); // Debug logging
      setSearchQuery("");
    } catch (error) {
      console.error("Error clearing search:", error);
    }
  };

  const statusOptions = [
    { value: 'out', label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { value: 'low', label: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    { value: 'medium', label: 'Medium Stock', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { value: 'good', label: 'Good Stock', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' }
  ];

  return (
    <div className="mb-4 space-y-4">
      {/* Search Bar - Mobile Optimized */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-slate-400 text-lg">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-12 pr-12 py-4 lg:py-3 text-base lg:text-base bg-slate-800 border-2 border-slate-600 rounded-xl lg:rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-transparent transition-all touch-manipulation"
        />
        {searchQuery && (
          <button
            onClick={handleSearchClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-300 transition-colors touch-manipulation"
          >
            <span className="text-xl">✕</span>
          </button>
        )}
      </div>

      {/* Quick Filter Buttons - Mobile Responsive */}
      <div className="flex flex-wrap gap-2 lg:gap-3">
        <button
          onClick={() => applyQuickFilter('out-of-stock')}
          className={`px-4 py-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
            selectedStatuses.includes('out') 
              ? 'bg-red-600 text-white border-2 border-red-500' 
              : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
          }`}
        >
          🔴 Out of Stock
        </button>
        <button
          onClick={() => applyQuickFilter('low-stock')}
          className={`px-4 py-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
            selectedStatuses.includes('low') 
              ? 'bg-orange-600 text-white border-2 border-orange-500' 
              : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
          }`}
        >
          🟠 Low Stock
        </button>
        <button
          onClick={() => applyQuickFilter('in-stock')}
          className={`px-4 py-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
            (selectedStatuses.includes('medium') && selectedStatuses.includes('good'))
              ? 'bg-green-600 text-white border-2 border-green-500' 
              : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
          }`}
        >
          🟢 In Stock
        </button>
        {hasActiveFilters && (
          <button
            onClick={() => applyQuickFilter('clear')}
            className="px-4 py-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium bg-slate-600 text-slate-200 border-2 border-slate-500 hover:bg-slate-500 transition-colors touch-manipulation min-h-[44px]"
          >
            ✕ Clear All
          </button>
        )}
        
        {/* Advanced Filters Toggle - Mobile Optimized */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 lg:py-2 rounded-xl lg:rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
            showFilters
              ? 'bg-blue-600 text-white border-2 border-blue-500'
              : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
          }`}
        >
          <span className="flex items-center">
            <span className="mr-2">🔧</span>
            <span className="hidden sm:inline">{showFilters ? 'Hide' : 'Show'} Filters</span>
            <span className="sm:hidden">Filters</span>
          </span>
        </button>
      </div>

      {/* Advanced Filters - Mobile Responsive */}
      {showFilters && (
        <div className="bg-slate-800 rounded-xl lg:rounded-lg border-2 border-slate-600 p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-slate-400 hover:text-slate-300 transition-colors p-2 touch-manipulation"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>

          {/* Suppliers Filter - Mobile Optimized */}
          <div>
            <h4 className="text-base font-medium text-slate-300 mb-3">Suppliers</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.keys(inventory || {}).map(supplier => (
                <button
                  key={supplier}
                  onClick={() => handleSupplierToggle(supplier)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
                    selectedSuppliers.includes(supplier)
                      ? 'bg-blue-600 text-white border-2 border-blue-500'
                      : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {supplier}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter - Mobile Optimized */}
          <div>
            <h4 className="text-base font-medium text-slate-300 mb-3">Stock Status</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  onClick={() => handleStatusToggle(status.value)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors border-2 touch-manipulation min-h-[44px] ${
                    selectedStatuses.includes(status.value)
                      ? getStatusButtonClasses(status.value).active
                      : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* UOM Filter - Mobile Optimized */}
          {availableUOMs.length > 0 && (
            <div>
              <h4 className="text-base font-medium text-slate-300 mb-3">Unit of Measure</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableUOMs.map(uom => (
                  <button
                    key={uom}
                    onClick={() => handleUOMToggle(uom)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
                      selectedUOMs.includes(uom)
                        ? 'bg-purple-600 text-white border-2 border-purple-500'
                        : 'bg-slate-700 text-slate-300 border-2 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    {uom}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Actions - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-600">
            <button
              onClick={() => applyQuickFilter('clear')}
              className="px-6 py-3 bg-slate-600 text-slate-200 rounded-xl hover:bg-slate-500 transition-colors touch-manipulation min-h-[44px] font-medium"
            >
              Clear All Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors touch-manipulation min-h-[44px] font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary - Mobile Responsive */}
      {(searchQuery || selectedSuppliers.length > 0 || selectedStatuses.length > 0 || selectedUOMs.length > 0) && !showFilters && (
        <div className="bg-slate-700 rounded-xl lg:rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-300 w-full sm:w-auto">Active filters:</span>
            
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 text-blue-100 touch-manipulation">
                Search: "{searchQuery}"
                <button
                  onClick={handleSearchClear}
                  className="ml-2 text-blue-200 hover:text-white p-1 touch-manipulation"
                >
                  ✕
                </button>
              </span>
            )}
            
            {selectedSuppliers.map(supplier => (
              <span key={supplier} className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium bg-blue-600 text-blue-100 touch-manipulation">
                {supplier}
                <button
                  onClick={() => handleSupplierToggle(supplier)}
                  className="ml-2 text-blue-200 hover:text-white p-1 touch-manipulation"
                >
                  ✕
                </button>
              </span>
            ))}
            
            {selectedStatuses.map(status => {
              const statusInfo = statusOptions.find(s => s.value === status);
              const statusClasses = getActiveStatusClasses(status);
              return (
                <span key={status} className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium ${statusClasses} touch-manipulation`}>
                  {statusInfo?.label}
                  <button
                    onClick={() => handleStatusToggle(status)}
                    className="ml-2 hover:opacity-70 p-1 touch-manipulation"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            
            {selectedUOMs.map(uom => (
              <span key={uom} className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium bg-purple-600 text-purple-100 touch-manipulation">
                {uom}
                <button
                  onClick={() => handleUOMToggle(uom)}
                  className="ml-2 text-purple-200 hover:text-white p-1 touch-manipulation"
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

  // Helper functions for button classes
  function getStatusButtonClasses(status) {
    const statusClasses = {
      'out': { active: 'bg-red-600 text-white border-red-500' },
      'low': { active: 'bg-orange-600 text-white border-orange-500' },
      'medium': { active: 'bg-yellow-600 text-white border-yellow-500' },
      'good': { active: 'bg-green-600 text-white border-green-500' }
    };
    return statusClasses[status] || { active: 'bg-slate-600 text-white border-slate-500' };
  }

  function getActiveStatusClasses(status) {
    const statusClasses = {
      'out': 'bg-red-600 text-red-100',
      'low': 'bg-orange-600 text-orange-100',
      'medium': 'bg-yellow-600 text-yellow-100',
      'good': 'bg-green-600 text-green-100'
    };
    return statusClasses[status] || 'bg-slate-600 text-slate-100';
  }
}