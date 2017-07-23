(function () {
	'use strict';

	angular.module('myApp').controller('StatDirController', StatDirController);

	function StatDirController($http, orderByFilter) {
		var vm = this;
		var dataset = {};
		var tables = [];
		var mainTable = [];
		var limit = 10;
		vm.id = 95175; // id of the table
		vm.title = "";
		vm.filterOptions = [];
		vm.sortType = 'index'; // default column name for sort
		vm.sortReverse = false; // set default sort order to asc
		vm.selectedFilter = "";
		vm.getData = getData;
		vm.changeFilter = changeFilter;
		vm.sort = sort;
		vm.pages = [];
		vm.currentPage = 1;
		vm.prev = prev;
		vm.next = next;
		vm.setPage = setPage;
		vm.errMsg = "";
		vm.changeId = changeId;

		//Getting data from SSB database
		getData();


		// Gets data from SSB repository using an api call with table ID
		function getData() {
			vm.load = true;
			$http.get('http://data.ssb.no/api/v0/dataset/' + vm.id + '.json').then(data => {

				if (data && data.data) {
					dataset = data.data.dataset;
					vm.title = dataset.label || 'the table fetched';
					//Main data including sub data for table variants
					mainTable = dataset.dimension;
					if (_.has(mainTable, 'id')) {
						//list for table variant dropdown items
						vm.filterOptions = _.values(mainTable['id']);
					} else {
						setError();
					}

					if (mainTable && mainTable.id && mainTable.id.length) {

						//set the default table variant
						vm.selectedFilter = mainTable.id[0];
						//For each key in main dataset, create an array of objects
						for (var key in mainTable) {

							//There are more keys in the main dataset than the number of table variants so fetch noly those using indexOf
							if (vm.filterOptions.indexOf(key) > -1) {

								//Create a new array of obejcts with the fields index and label
								var tableObj = {};
								var indexArr = _.keys(mainTable[key].category['label']);
								var labelArr = _.values(mainTable[key].category['label']);
								var indexLabelArr = [];

								for (var i = 0; i < indexArr.length; i++) {
									var obj = {
										index: indexArr[i],
										label: labelArr[i]
									};
									indexLabelArr.push(obj);
								}
								//indexLabelArr = orderByFilter(indexLabelArr, vm.sortType, vm.sortReverse);
								//Each table variant (key) now holds array of objects
								tableObj[key] = _.map(indexLabelArr, (e) => {
									return e;
								});
								tables.push(tableObj);
							}
						}

						//Select the default table variant to load the table
						selectTable(0, vm.selectedFilter);
					} else {
						setError();
					}

				}

			}, function (err) {
				console.log('Error occurred', err, err.status);
				if (err.status === 404) {
					vm.errMsg = "No tables found for this id";
				} else {
					vm.errMsg = "Something went wrong";
				}
				vm.load = false;
			});
		}

		//Function to fetch new table based on id entered by user
		function changeId() {
			//Clear previous error messages if any
			vm.errMsg = "";

			//ID cannot be empty and must be a number else show error
			if (vm.newId && typeof (vm.newId) === 'number') {

				//If user entered an ID different from the table fetched, clear the old values to hold new data
				if (vm.id !== vm.newId) {
					dataset = {};
					tables = [];
					mainTable = [];
					vm.errMsg = "";
					vm.id = vm.newId;
					//Reset the newId field
					vm.newId = undefined;
					//Call to get data for new ID
					getData();
				} else {
					//Clear the input field if user is asking for the existing table
					vm.newId = undefined;
				}
			} else {
				//Error message shown when the ID field is empty or is not a number
				vm.errMsg = "ID is required and must be a number";
			}
		}

		//Set errors while fetching data
		function setError() {
			vm.errMsg = "No tables found for this id";
			vm.load = false;
		}

		// Set the current table based on the variant option selected from dropdown
		function selectTable(ind, opt) {
			vm.selectedTable = _.values(tables[ind][opt]);
			if (vm.selectedTable && vm.selectedTable.length > 0) {
				paginate();
			} else {
				setError();
			}
		}

		//Sort the table based on a column in ascending or descending order
		function sort(type) {
			vm.sortReverse = vm.sortType === type ? !vm.sortReverse : false;
			vm.sortType = type;
			paginate();
		}

		//Change the data presented in the table based on the option selected from a variants dropdown
		function changeFilter(option) {
			var newIndex = _.indexOf(mainTable.id, option);
			vm.selectedFilter = option;
			vm.blnFilterDropdown = !vm.blnFilterDropdown;
			vm.sortReverse = false; //on changing the table variant, reset sort order to ascending
			vm.sortType = "index";
			vm.currentPage = 1;
			selectTable(newIndex, option);
		}

		//Function to paginate the table content based on the limit value
		function paginate() {
			//Sort the array before paginating
			vm.sortedArray = vm.sortReverse ? orderByFilter(vm.selectedTable, vm.sortType, true) : orderByFilter(vm.selectedTable, vm.sortType, false);
			var v1 = (vm.currentPage - 1) * limit; //start index for pagination
			var v2 = vm.currentPage * limit; //End index for pagination
			var pcount = Math.ceil(vm.selectedTable.length / limit); //number of pages
			var pageArr = [];
			for (var i = 0; i < pcount; i++) {
				pageArr.push(i + 1);
			}
			angular.copy(pageArr, vm.pages);
			//Show the items that fall in the range of the selected page. Using Math.min to avoid falsy values when there are less number of pages in the last page
			vm.paginatedTable = vm.sortedArray.slice(v1, Math.min(v2, vm.sortedArray.length));
			//Hide the loader
			vm.load = false;
		}

		//Function to navigate to prev page
		function prev() {
			vm.load = true;
			if (vm.currentPage > 1) {
				vm.currentPage--;
				paginate();
			}
		}

		//Function to navigate to next page
		function next() {
			vm.load = true;
			if (vm.currentPage < vm.pages.length) {
				vm.currentPage++;
				paginate();
			}
		}

		//Function to navigate to selected page
		function setPage(no) {
			vm.load = true;
			vm.currentPage = no;
			paginate();
		}

	}
})();