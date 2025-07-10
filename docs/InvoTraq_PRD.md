# InvoTraq - Restaurant Inventory Management System
## Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** December 2024  
**Product:** InvoTraq - Professional Restaurant Inventory Management System  

---

## 1. Executive Summary

### 1.1 Product Overview
InvoTraq is a modern, web-based inventory management system specifically designed for restaurants. The system provides comprehensive tools for tracking inventory, managing suppliers, automating orders, and maintaining optimal stock levels through intelligent fix count management.

### 1.2 Vision Statement
To provide restaurant operators with a streamlined, automated inventory management solution that reduces waste, prevents stockouts, and optimizes purchasing decisions through intelligent automation and real-time insights.

### 1.3 Current Status
- **Technology Stack:** React.js + Vite + Tailwind CSS
- **Deployment:** GitHub Pages (https://jobi-abraham-george.github.io/Inventory-Management/)
- **Data Persistence:** LocalStorage with migration support
- **Architecture:** Single Page Application (SPA)

---

## 2. Product Objectives

### 2.1 Primary Goals
- **Automate inventory ordering** through intelligent fix count management
- **Prevent stockouts** by proactive low stock alerts
- **Reduce manual work** through automated calculations and suggestions
- **Improve supplier relationships** through centralized contact management
- **Provide actionable insights** through dashboard analytics

### 2.2 Success Metrics
- Reduction in stockout incidents
- Improved inventory turnover rates
- Time savings in order processing
- Accurate stock level maintenance
- Enhanced supplier relationship management

---

## 3. User Personas

### 3.1 Primary Users
- **Restaurant Managers:** Need oversight of inventory levels, costs, and supplier performance
- **Kitchen Staff:** Need to track daily usage and update stock levels
- **Purchasing Coordinators:** Need to create orders and manage supplier relationships
- **Administrators:** Need system configuration and user management capabilities

---

## 4. Core Features & Functionality

### 4.1 Dashboard & Analytics
**Current Implementation:**
- Real-time inventory statistics overview
- Key performance indicators (KPIs) display
- Stock health metrics
- System status monitoring
- Quick action navigation

**Key Metrics Tracked:**
- Total suppliers count
- Total inventory items
- Low stock items count
- Out of stock items count
- Stock health percentages

### 4.2 Inventory Management

#### 4.2.1 Core Inventory Features
- **Item Tracking:** Complete item lifecycle management
- **Stock Levels:** Real-time on-hand quantity tracking
- **Unit of Measure (UOM):** Support for pieces, lbs, gallons, bottles, etc.
- **Case Management:** Case quantity tracking for bulk ordering
- **Pricing Management:** Unit costs and case pricing with update tracking

#### 4.2.2 Fix Count System (Auto-Ordering)
**Key Innovation:** Intelligent minimum stock level management
- **Fix Count Definition:** Minimum stock level that should always be maintained
- **Auto-Calculation:** System automatically calculates order quantities
- **Smart Ordering:** Orders triggered when stock falls below fix count
- **Inventory Formula:** `Order Quantity = Fix Count - On Hand Quantity`

#### 4.2.3 Inventory Status Management
- **Stock Status Indicators:**
  - ✅ In Stock (Above fix count)
  - 🟠 Low Stock (Below fix count, above 0)
  - 🔴 Out of Stock (0 quantity)

#### 4.2.4 Search & Filtering
- **Global Search:** Search by item name, supplier, or UOM
- **Quick Filters:** Out of Stock, Low Stock, In Stock
- **Supplier Filtering:** Filter by specific suppliers
- **Status Filtering:** Filter by stock status
- **UOM Filtering:** Filter by unit of measure

### 4.3 Supplier Management

#### 4.3.1 Supplier Profiles
- **Contact Information:**
  - Business name and contact person
  - Phone, email, website
  - Physical address
- **Business Terms:**
  - Lead time (days)
  - Minimum order requirements
  - Payment terms (Net 30, Net 15, etc.)
  - Delivery schedule (specific days)
  - Business notes and special instructions

#### 4.3.2 Supplier Performance Metrics
- **Inventory Metrics:**
  - Total items managed
  - Total inventory value
  - Stock health percentage
  - Low stock and out of stock counts
- **Performance Tracking:**
  - Health score calculation: `((Total Items - Out of Stock - Low Stock) / Total Items) × 100`
  - Color-coded health indicators (Green ≥80%, Yellow ≥60%, Red <60%)

#### 4.3.3 Supplier Operations
- **CRUD Operations:** Full Create, Read, Update, Delete functionality
- **Item Association:** Link inventory items to suppliers
- **Performance Dashboard:** Visual performance metrics per supplier
- **Status Management:** Active/Inactive supplier status

### 4.4 Order Management

#### 4.4.1 Order Creation & Processing
- **Manual Order Creation:** Create orders by selecting suppliers and items
- **Auto-Order Integration:** Automatic order suggestions based on fix counts
- **Order Tracking:** Complete order lifecycle management
- **Priority Management:** High, Medium, Low priority levels

#### 4.4.2 Order Status Management
- **Status Workflow:**
  - 📝 Pending → 🔄 Processing → 🚚 Shipped → ✅ Delivered
  - ❌ Cancelled (at any stage)

#### 4.4.3 Order Analytics
- **Order Statistics:**
  - Total orders and order counts by status
  - Total order value tracking
  - Recent order history
  - Order performance metrics

#### 4.4.4 Smart Ordering Features
- **Shortage Detection:** Automatic identification of items below fix count
- **Supplier Grouping:** Group order items by supplier for efficiency
- **Cost Estimation:** Automatic cost calculations for order planning
- **Delivery Planning:** Expected delivery date management

### 4.5 Data Management

#### 4.5.1 Data Structure
**Suppliers Schema:**
```json
{
  "id": "supplier-id",
  "name": "Supplier Name",
  "contactInfo": {
    "phone": "phone",
    "email": "email",
    "address": "address",
    "contactPerson": "contact",
    "website": "website"
  },
  "businessInfo": {
    "leadTimeDays": 2,
    "minimumOrder": 100,
    "paymentTerms": "Net 30",
    "deliveryDays": ["Monday", "Friday"],
    "notes": "notes"
  },
  "status": "active",
  "createdAt": "date",
  "updatedAt": "date"
}
```

**Inventory Schema:**
```json
{
  "id": "item-id",
  "name": "Item Name",
  "supplierId": "supplier-id",
  "onHandQty": 10,
  "quantity": 5,
  "fixCount": 15,
  "uom": "pieces",
  "caseQty": 24,
  "image": "base64-image",
  "pricing": {
    "unitCost": 2.50,
    "casePrice": 60.00,
    "lastUpdated": "date"
  },
  "updatedAt": "date"
}
```

#### 4.5.2 Data Persistence
- **Storage:** Browser LocalStorage
- **Migration System:** Automatic data structure migration
- **Backup Support:** Export/import functionality (planned)
- **Data Validation:** Comprehensive data integrity checks

### 4.6 User Interface & Experience

#### 4.6.1 Design System
- **Framework:** Tailwind CSS for consistent styling
- **Color Scheme:** Dark theme optimized for restaurant environments
- **Typography:** Clear, readable fonts with proper contrast
- **Icons:** Emoji-based icons for universal recognition

#### 4.6.2 Responsive Design
- **Mobile-First:** Optimized for mobile devices and tablets
- **Desktop Support:** Full-featured desktop experience
- **Touch-Friendly:** Large touch targets for ease of use
- **Accessibility:** Proper keyboard navigation and screen reader support

#### 4.6.3 Navigation & Layout
- **Sidebar Navigation:** Persistent navigation with key sections
- **Tabbed Interface:** Clean organization of different features
- **Breadcrumb Navigation:** Clear location indicators
- **Quick Actions:** Fast access to common operations

#### 4.6.4 Interactive Elements
- **Real-time Updates:** Immediate feedback on user actions
- **Form Validation:** Comprehensive input validation
- **Confirmation Dialogs:** Safety checks for destructive actions
- **Loading States:** Clear loading indicators

---

## 5. Technical Specifications

### 5.1 Architecture
- **Frontend Framework:** React.js 18.2.0
- **Build Tool:** Vite 7.0.2
- **Styling:** Tailwind CSS 3.3.0
- **State Management:** React Hooks (useState, useEffect, useMemo)
- **Routing:** Single Page Application (SPA)

### 5.2 Performance
- **Bundle Size:** Optimized with Vite bundling
- **Loading Time:** Fast initial load with code splitting
- **Memory Usage:** Efficient state management
- **Responsiveness:** Smooth interactions with debounced inputs

### 5.3 Browser Support
- **Modern Browsers:** Chrome, Firefox, Safari, Edge
- **Mobile Browsers:** iOS Safari, Chrome Mobile
- **JavaScript Requirements:** ES6+ features required

### 5.4 Data Storage
- **Primary Storage:** Browser LocalStorage
- **Capacity:** Suitable for small to medium restaurants
- **Backup:** Manual export functionality
- **Migration:** Automatic schema migration system

---

## 6. Security & Privacy

### 6.1 Data Security
- **Local Storage:** No external data transmission
- **Input Validation:** Comprehensive client-side validation
- **XSS Protection:** Sanitized input handling
- **Data Integrity:** Schema validation and migration

### 6.2 Privacy Compliance
- **No External Tracking:** No third-party analytics
- **Local Data Processing:** All data remains on user's device
- **No User Authentication:** Currently single-user system

---

## 7. User Workflows

### 7.1 Inventory Management Workflow
1. **Stock Update:** User updates on-hand quantities
2. **Auto-Calculation:** System calculates order quantities based on fix count
3. **Status Update:** Stock status automatically updates (In Stock/Low/Out)
4. **Alert Generation:** System alerts for low stock items
5. **Order Creation:** User creates orders for items below fix count

### 7.2 Supplier Management Workflow
1. **Supplier Registration:** Add new supplier with contact/business info
2. **Item Association:** Link inventory items to suppliers
3. **Performance Monitoring:** Track supplier performance metrics
4. **Relationship Management:** Update contact info and business terms

### 7.3 Order Management Workflow
1. **Order Planning:** Review items below fix count
2. **Supplier Selection:** Choose supplier for order
3. **Item Selection:** Add items to order with quantities
4. **Order Creation:** Create order with delivery dates and notes
5. **Status Tracking:** Monitor order through delivery lifecycle

---

## 8. Integration Points

### 8.1 Current Integrations
- **GitHub Pages:** Deployment platform
- **LocalStorage API:** Data persistence
- **File System API:** Image upload functionality

### 8.2 Future Integration Opportunities
- **Supplier APIs:** Direct integration with supplier ordering systems
- **POS Systems:** Integration with point-of-sale systems
- **Accounting Software:** Integration with QuickBooks, Xero, etc.
- **Cloud Storage:** Google Drive, Dropbox backup integration
- **Email/SMS:** Automated notifications and order confirmations

---

## 9. Content & Data

### 9.1 Sample Data Suppliers
1. **Cash n Carry:** Bulk food supplier
2. **Veggie Order:** Fresh produce supplier
3. **Saputo Order:** Dairy products supplier
4. **Sysco Order:** Full-service food distribution
5. **Maroon Order:** Packaging and disposables
6. **Fancy Lebanese:** Specialty Middle Eastern foods

### 9.2 Sample Inventory Categories
- **Proteins:** Beef, pepperoni, etc.
- **Produce:** Vegetables, fresh items
- **Condiments:** Sauces, seasonings
- **Packaging:** Disposable items
- **Dairy:** Cheese, milk products
- **Specialty Items:** Ethnic/regional foods

---

## 10. Success Metrics & KPIs

### 10.1 Operational Metrics
- **Stock Level Accuracy:** Percentage of items with accurate counts
- **Order Fulfillment Time:** Time from order creation to delivery
- **Supplier Performance:** On-time delivery rates
- **Cost Management:** Food cost percentage optimization

### 10.2 User Experience Metrics
- **Task Completion Rate:** Successful completion of key workflows
- **User Satisfaction:** Feedback on ease of use
- **Error Rates:** Frequency of user errors and corrections
- **Feature Adoption:** Usage rates of different features

### 10.3 Business Impact Metrics
- **Inventory Turnover:** Inventory rotation efficiency
- **Waste Reduction:** Decrease in expired/spoiled items
- **Cost Savings:** Reduction in total food costs
- **Time Savings:** Reduction in administrative time

---

## 11. Roadmap & Future Enhancements

### 11.1 Short-term Enhancements (Next Release)
- **Reports Module:** Generate inventory and cost reports
- **Settings Module:** User preferences and system configuration
- **Export/Import:** Data backup and restore functionality
- **Enhanced Mobile UX:** Improved mobile interface

### 11.2 Medium-term Features (3-6 months)
- **Multi-user Support:** Role-based access control
- **Supplier Integration APIs:** Direct supplier ordering
- **Advanced Analytics:** Trend analysis and forecasting
- **Notification System:** Email/SMS alerts for low stock

### 11.3 Long-term Vision (6-12 months)
- **Cloud Migration:** Move to cloud-based architecture
- **POS Integration:** Real-time inventory updates from sales
- **AI-Powered Forecasting:** Machine learning for demand prediction
- **Multi-location Support:** Franchise and chain restaurant support

---

## 12. Risk Assessment

### 12.1 Technical Risks
- **Browser Compatibility:** LocalStorage limitations
- **Data Loss:** No cloud backup currently
- **Scalability:** Single-user limitation
- **Performance:** Large dataset handling

### 12.2 Business Risks
- **User Adoption:** Learning curve for new users
- **Data Migration:** Moving from existing systems
- **Supplier Buy-in:** Adoption of new ordering processes
- **Competition:** Established inventory management solutions

### 12.3 Mitigation Strategies
- **Regular Backups:** Implement export/import functionality
- **User Training:** Comprehensive documentation and tutorials
- **Gradual Migration:** Phase-based implementation
- **Competitive Analysis:** Continuous feature enhancement

---

## 13. Conclusion

InvoTraq represents a modern, user-friendly approach to restaurant inventory management with a strong focus on automation and ease of use. The fix count system provides intelligent automation while maintaining user control, and the comprehensive supplier management ensures strong vendor relationships.

The system's current foundation provides an excellent base for future enhancements, with clear paths for scaling to cloud-based, multi-user, and integrated solutions that can grow with restaurant operations.

**Key Differentiators:**
- Intelligent fix count automation
- Restaurant-specific design
- Modern, responsive interface
- Comprehensive supplier management
- Local data control and privacy

---

*This document reflects the current state of InvoTraq as of December 2024 and serves as a foundation for future product development and enhancement planning.*