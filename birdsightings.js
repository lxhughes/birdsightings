var app = angular.module("birdingChartsApp", ['nvd3']);

app.controller('MainCtrl', function($scope, $http, $timeout) {

	$scope.numSightings = [{ key: "Sightings by Hotspot", values: [] }];
	$scope.detailedSightings = {};
	$scope.showSite = ""; // Current site to show detail for
	$scope.showSiteLabel = ""; // Current site's human readable label
	$scope.numDays = 7; // Global
	$scope.drilldownListWidth = 300; // Global

	$scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 700,
                margin : {
                    top: 20,
                    right: 50,
                    bottom: 250,
                    left: 55,
                },
                x: function(d){return d.label;},
                y: function(d){return d.value;},
                showValues: true,
                objectEquality: true,
                valueFormat: function(d){
                    return d3.format(',.0f')(d);
                },
                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'Location',
                    rotateLabels: 45
                },
                yAxis: {
                    axisLabel: 'Number of Reported Species Sighted in the Last '+$scope.numDays+' Days',
                    axisLabelDistance: 30
                },
                discretebar: {
                  dispatch: {
                    elementClick: function(evt) { 
                    	$timeout(function(){
                    		$scope.drillDownOnLabel(evt.point.label, $scope);
                    		$scope.menux = Math.max(0,evt.e.pageX - ($scope.drilldownListWidth / 2));
                    		$scope.menuy = evt.e.pageY;
                    	}, 100);
                    
                    }
                  }
                }
            }
        };
        
        $scope.drillDownOnLabel = function(label, $scope){
        	var labeltag = $scope.formatTag(label);
        	$scope.showSite = labeltag;
        	$scope.showSiteLabel = label;
        };
        
        $scope.formatTag = function(label){
        	return label.replace(/[^\w]+/g, '');
        }
        
        $scope.getData = function(){ // Load hotspots from JSON, then get the sightings for each hotspot
        	var county = "US-MA-025"; // May generalize this in the future
			var hotspotpath = "http://ebird.org/ws1.1/ref/hotspot/region?rtype=subnational2&fmt=json&r="+county;
			
    		$http.get(hotspotpath)
    		.success(function(response){    	
    			$scope.hotspots = response;
    			
    			// Loop through and find the sightings for each hotspot (to do: this in comma-separated groups of 10)
    			angular.forEach($scope.hotspots,function(hotspot){
    				var locid = hotspot.locID;
    				var locname = hotspot.locName;
    				var sightingspath = "http://ebird.org/ws1.1/data/obs/hotspot/recent?&maxResults=500&detail=simple&locale=en_US&fmt=json&includeProvisional=true&back="+$scope.numDays+"&r="+locid;
    				
    				$http.get(sightingspath)
    				.success(function(response2){
    					// If there are any sightings, add to the data hashes
    					if(response2.length > 0){
    						$scope.numSightings[0].values.push({ "label": locname, "value": response2.length });
    						var locnametag = $scope.formatTag(locname);
    						$scope.detailedSightings[locnametag] = response2;
    					}
    				})
    				.error(function(repsonse2){
    					$scope.error = "Could not load sightings for location "+locid+"! "+response;
    				});
    			});
    		}) 
    		.error(function(response){
    			$scope.error = "Could not load hotspots! "+response;
    			});
        };
        
        // Call the data load function
		$scope.getData();
});