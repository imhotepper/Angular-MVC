var TodoApp = angular.module("TodoApp", ["ngResource"])
        .config(function ($routeProvider) {
            $routeProvider
                .when('/', { controller: ListCtrl, templateUrl: 'List.html' })
                .when('/new', { controller: CreateCtrl, templateUrl: 'details.html' })
                .when('/edit/:editId', {controller: EditCtrl, templateUrl: 'details.html'})
                .otherwise({ redirectTo: '/' });
        });


TodoApp.factory('Todo', function ($resource) {
    return $resource('api/todos/:id', { id: '@id' }, { update: {method:'PUT'}})
})


TodoApp.directive('sorted', function(){
    return {
        scope: true,
        transclude: true,
        template: " <a ng-click='do_sort()' ng-transclude> </a>" +
                        "<span ng-show='do_show(true)'><i class='icon-arrow-down'></i></span>" +
                        "<span ng-show='do_show(false)'><i class='icon-arrow-up'></i></span>",

        controller: function ($scope, $element, $attrs, Todo) {
            $scope.sort_col = $attrs.sorted;

            $scope.do_sort = function () {  $scope.sort($scope.sort_col); };

            $scope.do_show = function (asc) {
               // return sort_order == $scope.sort && !$scope.is_desc;
                return (asc != $scope.is_desc) && ($scope.sort_order == $scope.sort_col);
            };

            $scope.sort_by = function (sort) {
                $scope.sort = sort;
                $scope.search();
            }
           

        }
    }
});

var ListCtrl = function ($scope, $location, Todo) {
  //  $scope.query = '';
    $scope.todoes = [];

    $scope.search = function () {
        Todo.query(
                        {
                        sort: $scope.sort_order,
                        desc: $scope.is_desc,
                        limit: $scope.limit,
                        offset: $scope.offset,
                        q: $scope.query
                    },
                    function (data) {
                            $scope.more = data.length === 20;
                            $scope.todoes = $scope.todoes.concat(data);
                        });
    }

    $scope.sort = function (col) {
        if ($scope.sort_order === col) {  $scope.is_desc = !$scope.is_desc; }
        else { $scope.sort_order = col; $scope.is_desc = false;}
        
        $scope.reset();
    }


    $scope.has_more = function () { return $scope.more; }


    $scope.show_more = function () {
        $scope.offset += $scope.limit;

        $scope.search();

    };


    $scope.reset = function () {
       
        $scope.limit = 20;
        $scope.offset = 0;
        $scope.todoes = [];
        $scope.more = true;

        $scope.search();
    }

    $scope.delete = function () {
        var id = this.todo.Id;

        Todo.delete({ id: id }, function () { $("#todo_" + id).fadeOut(); });
    }

  
    $scope.sort_order = "Priority";
    $scope.is_desc = false;

    $scope.reset();

    
}


var CreateCtrl = function ($scope, $location, Todo) {

    $scope.action = "Create";

    $scope.save = function () {
        Todo.save($scope.item, function () {
            $location.path('/');
        });
    }

}

var EditCtrl = function ($scope, $location, $routeParams, Todo) {
    $scope.action = "Update";
    var id = $routeParams.editId;

    $scope.item = Todo.get({id: id});


    $scope.save = function () {
        $scope.Id = id;
        Todo.update({id: id}, $scope.item, function () { $location.path('/'); });
        
    }
   
}

//TodoApp.directive('greet', function () {
//    return {
  
//        template: "<h2>Greetings from {{from}} to my dear {{to}}!</h2>",
//        link: function (scope, element, attrs, ctrl) {

//        },
//        controller: function ($scope, $element, $attrs) {
//            $scope.from = $attrs.from;
//            $scope.to = $attrs.greet;
//        }

//    }
//});