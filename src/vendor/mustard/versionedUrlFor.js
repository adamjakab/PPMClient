define(function()
{
    return function versionedUrlFor(url)
    {
        return url + '?b=@@build-time';
    }   
});