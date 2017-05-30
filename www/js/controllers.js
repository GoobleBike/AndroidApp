angular.module('starter.controllers', [])

.controller('DashCtrl',['$http','$scope','$ionicPopup',
function($http,$scope,$ionicPopup) {
  var settings = window.localStorage.getItem('settings')
  if (settings && settings != "" && settings != "undefined") {
    settings = JSON.parse(settings)
  }
  $scope.devStatus = {}
  $scope.devices = settings.devices
  var pollServer = function (ip) {
    $http.get(ip+"/ping")
    .then(function (res) {
      $scope.devStatus[ip].class = "active"
    })
    .catch(function (err) {
      $scope.devStatus[ip].class = "inactive"
    })
  }
  for (var dev in $scope.devices) {
    if ($scope.devices.hasOwnProperty(dev)) {
      var ip = $scope.devices[dev]
      $scope.devStatus[ip] = {
        class: 'inactive',
        proces: setInterval(pollServer,2000,ip)
      }
    }
  }
  $scope.shutDown = function (dev) {
    if ($scope.devStatus[dev].class == "active") {
        $ionicPopup.confirm({
          title: 'Shutting Down '+dev+"!",
          template: 'Are you sure?'
        }).then(function(res) {
          if(res) {
           console.log('You are sure');
          //  $http({
          //    method: 'POST',
          //    url: dev+'/sd',
          //    headers: {
          //      'Content-Type': 'application/x-www-form-urlencoded'
          //    },
          //    data: JSON.stringify({p:settings.password})
          //  })
          var data =encodeURIComponent('p') + "=" + encodeURIComponent(settings.password);
            $http.post(dev+'/sd',data, {
              headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
               }
             })
          } else {
            console.log('You are not sure');
          }
        });
    }
  }

}])

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope,$ionicPopup) {
  var settings = window.localStorage.getItem('settings')
  $scope.settings = {
    password: "",
    devices: []
  }
  if (settings) {
    $scope.settings = JSON.parse(settings)
  }
  $scope.settingsUpdated = function () {
    window.localStorage.setItem('settings', JSON.stringify($scope.settings))
  }
  $scope.addDevice = function () {
    $ionicPopup.prompt({
      title: 'Add device',
      template: 'Set the ip of your device, the path will be automatically added',
      inputType: 'text',
      inputPlaceholder: '192.168.1.100'
    }).then(function(res) {
      if (!res || res === '') {
        throw ''
      }
      if (!$scope.settings.devices || !$scope.settings.devices.length) {
        $scope.settings.devices = []
      }
      $scope.settings.devices.push('http://'+res+'/gooble/api')
      $scope.settingsUpdated()
    });
  }
  $scope.deleteDevice = function (dev) {
    $ionicPopup.confirm({
      title: 'Delete device!!',
      template: 'Are you sure?'
    }).then(function(res) {
      if(res) {
        console.log('You are sure');
        for(device in $scope.settings.devices) {
          if($scope.settings.devices[device] == dev) {
            $scope.settings.devices.splice(device, 1);
          }
        }
      } else {
        console.log('You are not sure');
      }
      $scope.settingsUpdated()
    });
  }
});
