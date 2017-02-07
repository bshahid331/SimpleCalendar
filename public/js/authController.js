/**
 * Created by andrea.terzani on 09/04/2015.
 */

app.controller('authController', function($scope,$http,$location) {
     
    $scope.user  = {username:'',password:''};
    $scope.alert = '';
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear()
    $scope.myDate = date;
    $('#timepicker1').timepicker();
    $scope.isReoccuring = false;
    

    $scope.events = [];
    $scope.eventSources = [$scope.events];

    $scope.alertEventOnClick = function( date, jsEvent, view){
        $scope.currentEventTitle = date.title;
        $scope.currentEventStartDate = (date.start._d.getMonth() + 1) + "/" + date.start._d.getDate() + "/" + date.start._d.getFullYear();
        $scope.currentEventStartTime = date.start._d.toLocaleTimeString();
        $scope.currentEventImage = date.img;
        $('#myModal').modal();
    };

    $scope.uiConfig = {
      calendar:{
        height: 450,
        editable: true,
        header:{
          left: 'month basicWeek basicDay agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        eventClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    };

      /* alert on eventClick */
  

    $scope.login = function(user){
        $http.post('/auth/login', user).
            success(function(data) {
                $scope.loggeduser = data;
                $location.path('/user');
            }).
            error(function() {
                $scope.alert = 'Login failed'
            });

    };

    $scope.signup = function(user){
        $http.post('/auth/signup', user).
            success(function(data) {
                $scope.alert = data.alert;
             }).
            error(function() {
                $scope.alert = 'Registration failed'
            });

    };



    $scope.userinfo = function() {
        $http.get('/auth/currentuser').
            success(function (data) {
                $scope.loggeduser = data;
               
                $http.get('/events').
                success(function (data) {
                    for (let event of data.events) {
                        
                        $scope.events.push({title: event.title, start: event.startDate, allDate: false, img: event.img});
                        
                    }
                }).
                error(function () {
                    alert('Couldnt grab the events');
                });
                
            }).
            error(function () {
                $scope.alert = 'Login failed'
            });
    };

    

    $scope.addEvent = function() {
        var time = $('#timepicker1').val();

        var hours = Number(time.match(/^(\d+)/)[1]);
        var minutes = Number(time.match(/:(\d+)/)[1]);
        var AMPM = time.match(/\s(.*)$/)[1];
        if(AMPM == "PM" && hours<12) hours = hours+12;
        if(AMPM == "AM" && hours==12) hours = hours-12;
        var sHours = hours.toString();
        var sMinutes = minutes.toString();
        if(hours<10) sHours = "0" + sHours;
        if(minutes<10) sMinutes = "0" + sMinutes;
        //alert(sHours + ":" + sMinutes);
        $scope.events.push({title: $scope.myTitle, start: new Date($scope.myDate.getFullYear(), $scope.myDate.getMonth(), $scope.myDate.getDate(), sHours, sMinutes), allDay: false, img: $scope.previewImage});
         var event = {title: $scope.myTitle, startDate: new Date($scope.myDate.getFullYear(), $scope.myDate.getMonth(), $scope.myDate.getDate()), img: $scope.previewImage, createdBy: $scope.loggeduser.username};
           $http.post('/events/add', event).
            success(function(data) {
                 alert("SUCCESS");
             }).
            error(function() {
                alert("ERROR");
            });
    };

    $scope.logout = function(){
        $http.get('/auth/logout')
            .success(function() {
                $scope.loggeduser = {};
                $location.path('/signin');

            })
            .error(function() {
                $scope.alert = 'Logout failed'
            });
    };
});
