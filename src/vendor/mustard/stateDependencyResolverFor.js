define(function()
{
    var isFirstRun = true;

    return function stateDependencyResolverFor(stateConfig)
    {
        return {resolver:['$q','$rootScope', function($q, $rootScope)
        {
            var deferred = $q.defer();

            if(isFirstRun || stateConfig.optimize)
            {
                require([stateConfig.routeDependencyId], function()
                {
                    $rootScope.$apply(function()
                    {
                        isFirstRun = false;

                        deferred.resolve();
                    });
                });
            }
            else
            {
                require(stateConfig.lazyDependencies, function()
                {
                    $rootScope.$apply(function()
                    {
                        deferred.resolve();
                    });
                });
            }

            return deferred.promise;
        }]};
    }
});