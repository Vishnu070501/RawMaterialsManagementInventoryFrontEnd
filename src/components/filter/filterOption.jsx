import { FilterDropdown } from "./filterDropDown";

export const InventoryFilter = ({ onFilterApply }) => {
    const filterOptions = [
    //   {
    //     key: "categoryId", // This will be used as the key in the filter object
    //     label: 'Category',
    //     dataKey: 'product_categories', // This matches the API response structure
    //     displayField: 'name',
    //     allLabel: 'All Categories'
    //   },
    //   {
    //     key: 'projectId',
    //     label: 'Project',
    //     dataKey: 'projects',
    //     displayField: 'name',
    //     allLabel: 'All Projects'
    //   },
      {
        key: 'categoryProjectId',
        label: 'Category-Project',
        dataKey: 'product_category_projects',
        displayField: 'product_category_project', // This matches the field in the API response
        allLabel: 'All Category-Projects'
      }
    ];
  
    return (
      <FilterDropdown
        onFilterApply={onFilterApply}
        endpoint="inventory/resources/all/"
        filterOptions={filterOptions}
        title="Filter Inventory"
        initialFilters={{ categoryId: null, projectId: null, categoryProjectId: null }}
      />
    );
  };