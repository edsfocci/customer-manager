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
  };
})

.directive('appFooter', function() {
  return {
    templateUrl: 'partials/footer.html'
  };
})

.service('customersSrvc', ['$http', '$q', '$window',
function($http, $q, $window) {
  var ajaxCustomers = function() {
    var deferred = $q.defer();

    $http.get('customers.json')
    .success(function(data) {
      $window.customers = data;
      deferred.resolve(data);
    });

    return deferred.promise;
  };

  this.getCustomersList = function() {
    var customersPromise;

    if ($window.customers === undefined) {
      customersPromise = ajaxCustomers();

    } else {
      var deferred = $q.defer();

      setTimeout(function() {
        deferred.resolve($window.customers);
      }, 0);

      customersPromise = deferred.promise;
    }

    return customersPromise;
  };

  this.addCustomer = function(newCustomer) {
    var deferred = $q.defer();

    setTimeout(function() {
      // Validation
      newCustomer = newCustomer || {};

      newCustomer.firstName = newCustomer.firstName || "";
      newCustomer.firstName = newCustomer.firstName.trim();

      newCustomer.lastName = newCustomer.lastName || "";
      newCustomer.lastName = newCustomer.lastName.trim();

      newCustomer.city = newCustomer.city || "";
      newCustomer.city = newCustomer.city.trim();

      if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.city)
        return deferred.reject();

      newCustomer.id = $window.customers[$window.customers.length-1].id + 1;

      deferred.resolve(newCustomer);
    }, 0);

    return deferred.promise;
  };

  this.getCustomer = function(id) {
    var customer;
    var deferred = $q.defer();

    if ($window.customers === undefined) {
      setTimeout(function() {
        var customersPromise = ajaxCustomers();

        customersPromise
        .then(function(data) {
          customer = data.filter(function(customer) {
            return customer.id == id;
          });

          deferred.resolve(customer[0]);
        });
      }, 0);

    } else {
      setTimeout(function() {
        customer = $window.customers.filter(function(customer) {
          return customer.id == id;
        });
        deferred.resolve(customer[0]);
      }, 0);
    }

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
      customersSrvc.addCustomer(newCustomer)
      .then(function(data) {
        $scope.customers.push(data);

        $scope.newCustomer = {};
      });
    };
}])

.controller('customersDetailCtrl', ['$scope', '$routeParams', 'customersSrvc',
  'ordersSrvc', function($scope, $routeParams, customersSrvc, ordersSrvc) {
    customersSrvc.getCustomer($routeParams.customerId)
    .then(function(data) {
      // console.log($stateParams.customerId)

      // console.log(data)
      $scope.customer = data;
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
