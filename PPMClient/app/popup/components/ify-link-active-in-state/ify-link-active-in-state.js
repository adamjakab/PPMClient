angular.module('ifyLinkActiveInState', []).directive('ifyLinkActiveInState', function($rootScope)
{
    return function(scope, $element, attrs)
    {
        $rootScope.$on('$stateChangeStart', function(event, state)
        {
            if(state.name == attrs.ifyLinkActiveInState)
            {
                $element.addClass('active');
            }
            else
            {
                $element.removeClass('active');
            }
        });
    }
});