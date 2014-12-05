define(function () {
    return function stateDependencyResolver(stateName) {
        return {
            resolver: ['$q', '$rootScope', function ($q, $rootScope) {
                var dependencyDefinitions = 'states/'+stateName+'/dependencies';
                var deferred = $q.defer();
                require([dependencyDefinitions], function () {
                    $rootScope.$apply(function () {
                        deferred.resolve();
                    });
                });
                return deferred.promise;
            }]
        };
    }
});
