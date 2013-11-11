$(function() {
  // meh this is faster to write in jQuery, sorry AngularJs...
  $('#memeShare').popover({
    html:true,
    placement:'bottom',
    content: $('#shareForm').html()
  });

  $('body').on('click', '.popover #suggestBtn', function() {
    var data = {
      url: $('.popover input').val()
    };
    var ENDPOINT = 'https://api.mongolab.com/api/1/databases/memetabani/collections/memeadayi?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs';
    $.ajax({
      type: "POST",
      url: ENDPOINT,
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      success: function(response, status) {
        $('.popover input').val('');
        $('#memeShare').popover('hide');
        alert('Teşekkürler, bi bakalım biz sizi ararız...');
      }
    });
  });
});


angular.module('meme', ['ngRoute'])

.constant('DB_URL', 'https://api.mongolab.com/api/1/databases/memetabani/collections/memeler?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs&q={"id":{$ID}}')
.constant('COUNT_URL', 'https://api.mongolab.com/api/1/databases/memetabani/collections/memeler?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs&c=true')

//https://api.mongolab.com/api/1/databases/memetabani/collections/memeler?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs&c=true
//https://api.mongolab.com/api/1/databases/memetabani/collections/memeler?apiKey=CKUizEl63826KYWjJrh6GQuRjHIsWpOs&q={"id":{$ID}}

.factory('meme.service.db', ['DB_URL', 'COUNT_URL', '$http', function(DB_URL, COUNT_URL, $http) {
  return {
    get: function(id) {
      return $http.get(DB_URL.replace('{$ID}', id));
    },
    count: function() {
      return $http.get(COUNT_URL);
    }
  };
}])

.factory('meme.service.random', [function() {
  return {
    get: function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  };
}])

.controller('meme.ctrl.content', ['$scope', '$rootScope', '$q', '$location', 'meme.service.db', 'meme.service.random',
function($scope, $rootScope, $q, $location, db, random) {
  function treatAsFinished () {
    $scope.$apply(function() {
      $scope.progressPerCent = 100;
      $scope.loading = false;
    });
  }

  $rootScope.$watch('id', function(newId, oldId) {
    if(newId && newId != oldId){
      db.get(newId)
      .success(function(response, status) {
        if(status == 200){
          $scope.progressPerCent = 90;
          $scope.prev = response[0].id;
          $scope.memeUrl = response[0].url;

          // fuck directives this is the way to go :P
          $('#meme img')
          .off('load').on('load', function() {
            treatAsFinished()
          })
          .off('error').on('error', function() {
            console.error('meme yok');
            treatAsFinished()
          });
          setTimeout(function() {
            console.warn('meme cok buyuk');
            treatAsFinished();
          }, 5000);
        }
      });
    }
  }, true);

  //do not try on your project, this is dirty as the site...
  $( document ).off('keypress').on('keypress', function(e){
    // console.log(e.keyCode);
    if(e.keyCode == 32){//space key
      $scope.$apply(function() {
        $scope.anotherSister();
      });
      e.preventDefault();
      return false;
    }
    else if(e.keyCode == 120 || e.keyCode == 88){//x or X key
      $('#cover').toggle();
    }
  });

  $scope.anotherSister = function(event) {
    $scope.loading = true;
    $scope.progressPerCent = 0;
    while( (newId = random.get(1, $rootScope.count)) == $scope.prev ){}//ensure won't be the same as previous

    $location.path('/meme/' + newId);
  }
}])

.controller('meme.ctrl.routing', ['$scope', '$rootScope','$routeParams', '$location', '$q', 'meme.service.random', 'meme.service.db',
function ($scope, $rootScope, $routeParams, $location, $q, random, db) {
  var deferred = $q.defer();

  $rootScope.progressPerCent = 10;
  if(!$rootScope.count){
    db.count()
    .success(function(count, status) {
      if(status == 200){
        $rootScope.count = count;
        deferred.resolve(count);
      }
    });
  }
  else{
    deferred.resolve($rootScope.count);
  }

  deferred.promise.then(function(count) {
    $rootScope.progressPerCent = 30;
    if($routeParams.id){
      $rootScope.id = $routeParams.id;
    }
    else{
      while( (newId = random.get(1, $rootScope.count)) == $scope.prev ){}//ensure won't be the same as previous
      $location.path('/meme/' + newId);
    }
  });
}])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {controller: 'meme.ctrl.routing', template:' '})
    .when('/meme/:id', {controller: 'meme.ctrl.routing', template:' '})
    .otherwise({redirectTo:'/'});
}])

.directive('ngDiscuss', ['$rootScope', '$location', function($rootScope, $location) {
  // var disqusScript = "\x3Cscript type=\"text\x2Fjavascript\"\x3E\n \x2F* * * CONFIGURATION VARIABLES: THIS CODE IS ONLY AN EXAMPLE * * *\x2F\n var disqus_shortname = \'memeizle\';\n var disqus_identifier = \'IDENTIFIER\';\n var disqus_title = \'TITLE\';\n var disqus_url = \'URL\';\n\n \x2F* * * DON\'T EDIT BELOW THIS LINE * * *\x2F\n (function() {\n var dsq = document.createElement(\'script\'); dsq.type = \'text\x2Fjavascript\'; dsq.async = true;\n dsq.src = \'\x2F\x2F\' + disqus_shortname + \'.disqus.com\x2Fembed.js\';\n (document.getElementsByTagName(\'head\')[0] || document.getElementsByTagName(\'body\')[0]).appendChild(dsq);\n })();\n\x3C\x2Fscript\x3E";
  var disqusScript = " \x3Cdiv id=\"disqus_thread\"\x3E\x3C\x2Fdiv\x3E\n \x3Cscript type=\"text\x2Fjavascript\"\x3E\n \x2F* * * CONFIGURATION VARIABLES: EDIT BEFORE PASTING INTO YOUR WEBPAGE * * *\x2F\n var disqus_shortname = \'memeizle\'; \x2F\x2F required: replace example with your forum shortname\n\n \x2F* * * DON\'T EDIT BELOW THIS LINE * * *\x2F\n (function() {\n var dsq = document.createElement(\'script\'); dsq.type = \'text\x2Fjavascript\'; dsq.async = true;\n dsq.src = \'\x2F\x2F\' + disqus_shortname + \'.disqus.com\x2Fembed.js\';\n (document.getElementsByTagName(\'head\')[0] || document.getElementsByTagName(\'body\')[0]).appendChild(dsq);\n })();\n \x3C\x2Fscript\x3E\n \x3Cnoscript\x3EPlease enable JavaScript to view the \x3Ca href=\"http:\x2F\x2Fdisqus.com\x2F?ref_noscript\"\x3Ecomments powered by Disqus.\x3C\x2Fa\x3E\x3C\x2Fnoscript\x3E\n \x3Ca href=\"http:\x2F\x2Fdisqus.com\" class=\"dsq-brlink\"\x3Ecomments powered by \x3Cspan class=\"logo-disqus\"\x3EDisqus\x3C\x2Fspan\x3E\x3C\x2Fa\x3E\n ";
  return function(scope, element, attr) {
    // element.append(disqusScript.replace("IDENTIFIER", ).replace("TITLE", ).replace("URL", ));
    $rootScope.$on('$routeChangeSuccess', function(a,b,c) {
      element.append(disqusScript);
    });
  }
}])

;
