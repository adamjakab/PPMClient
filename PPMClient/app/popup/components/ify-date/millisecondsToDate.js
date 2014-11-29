angular.module('ify.date').filter('millisecondsToDate', function($filter)
{
    return function millisecondsToDate(input, format)
    {
        var date =  new Date(input);

        if(format !== undefined)
        {
            var dateFilter = $filter('date');

            date = dateFilter(date, format);
        }

        return date;
    }
});
