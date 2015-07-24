var app = angular.module("paymentsApp", ['ngRoute', 'routeStyles'])

.config(['$routeProvider', function($routeProvider){
  $routeProvider

  .when("/customers/:customerId", {
    templateUrl: "partials/customers-detail.html", 
    controller: 'customersDetailCtrl',
    css: ['bootstrap/css/bootstrap.min.css','style.css']
  })

  .when("/customers", {
    templateUrl: "partials/customers-list.html",
    controller: 'customersListCtrl',
    css: ['bootstrap/css/bootstrap.min.css','style.css']
  })

  .when("/orders", {
    templateUrl: "partials/orders-list.html",
    controller: 'ordersListCtrl',
    css: ['bootstrap/css/bootstrap.min.css','style.css']
  })

  .otherwise({
    redirectTo: "/customers"
  });
}])

.directive('appTopNav', function() {
  return {
    templateUrl: 'partials/top-nav.html'
  }
})

.directive('appFooter', function() {
  return {
    templateUrl: 'partials/footer.html'
  }
})

.service('customersSrvc', ['$http', '$q', function($http, $q) {
  this.getCustomersList = function() {
    var deferred = $q.defer();

    $http.get('customers.json')
    .success(function(data) {
      deferred.resolve(angular.fromJson(data));
    });

    return deferred.promise;
  }

  this.addCustomer = function(newCustomer) {
    //TODO: add newCustomer to customerStore, and return customerStore

    return newCustomer;
  };

  this.getCustomer = function() {
    var deferred = $q.defer();

    $http.get('customers.json')
    .success(function(data) {
      deferred.resolve(angular.fromJson(data));
    });

    return deferred.promise;
  };

  this.deleteCustomer = function(customer) {
    //TODO: delete customer in customerStore, and return customerStore

    return customer;
  };

  return this;
}])

.service('ordersSrvc', function() {
  this.getGrandTotal = function(orders) {
    var grandTotal = 0;

    try {
      for (var i = 0; i < orders.length; i++) {
        grandTotal += orders[i].orderTotal;
      }
    } catch(e) {}

    // Round to nearest penny
    grandTotal = grandTotal.toFixed(2)
    // Comma-separate number orders of magnitude
    return grandTotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return this;
})

.controller('customersListCtrl', ['$scope', 'customersSrvc',
  function($scope, customersSrvc) {
    customersSrvc.getCustomersList()
    .then(function(data) {
      $scope.customers = data;
    });

    $scope.addCustomer = function(newCustomer) {
      customersSrvc.addCustomer();

      $scope.customers.push(newCustomer);
    };
}])

.controller('customersDetailCtrl', ['$scope', '$routeParams', 'customersSrvc',
  'ordersSrvc', function($scope, $routeParams, customersSrvc, ordersSrvc) {
    customersSrvc.getCustomer()
    .then(function(data) {
      // console.log($stateParams.customerId)
      data = data.filter(function(customer) {
        return customer.id == $routeParams.customerId;
      });
      // console.log(data)
      $scope.customer = data[0];
    });

    $scope.getGrandTotal = ordersSrvc.getGrandTotal;
}])

.controller('ordersListCtrl', ['$scope', 'customersSrvc', 'ordersSrvc',
  function($scope, customersSrvc, ordersSrvc) {
    customersSrvc.getCustomersList()
    .then(function(data) {
      data = data.filter(function(customer) {
        return !!customer.orders;
      });
      $scope.customers = data;
    });

    $scope.getGrandTotal = ordersSrvc.getGrandTotal;
}]);
