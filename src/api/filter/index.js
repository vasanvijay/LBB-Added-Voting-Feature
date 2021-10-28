const createFilterType = require("./create-filter-type");
const createFilter = require("./create-filter");
const getFilterType = require("./get-filter-type");
const getFilter = require("./get-filter");
const updateFilterType = require("./update-filter-type");
const updateFilter = require("./update-filter");
const addFilterOption = require("./add-filter-option");
const deleteFilterType = require("./delete-filter-type");
const deleteFilter = require("./delete-filter");
const mostUsedFilter = require("./get-most-used-filter");

module.exports = exports = {
  createFilter,
  createFilterType,
  getFilter,
  getFilterType,
  updateFilterType,
  updateFilter,
  deleteFilterType,
  deleteFilter,
  addFilterOption,
  mostUsedFilter,
};
