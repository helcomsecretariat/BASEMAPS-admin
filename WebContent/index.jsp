<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
		<title>BASEMAPS - Baltic LINes</title>
		<link href='//fonts.googleapis.com/css?family=Istok Web' rel='stylesheet'>
		<!--<link rel="stylesheet" href="https://js.arcgis.com/3.20/esri/css/esri.css">-->
		<link rel="stylesheet" href="//openlayers.org/en/v4.4.2/css/ol.css" type="text/css">
		
		<link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/dojo/1.10.4/dijit/themes/claro/claro.css">
		<link rel="stylesheet" type="text/css" href="1.0/css/basemaps.css">
		<!--<link rel="stylesheet" type="text/css" href="widgets/css/widgets.css">-->
		
		<script src="http://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.6/proj4.js" type="text/javascript"></script>
		<script src="1.0/js/proj3035.js" type="text/javascript"></script>
		
		<script>
			var basemapsVersion = "1.0";
			var package_path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
			var dojoConfig = {
				parseOnLoad: false,
				// The locationPath logic below may look confusing but all its doing is
				// enabling us to load the api from a CDN and load local modules from the correct location.
				packages: [{
					name: "basemaps",
					location: package_path + "/" + basemapsVersion
				},
				{
					name: "widgets",
					location: package_path + "/" + basemapsVersion + "/widgets"
				}]
			};
		</script>
		<script src="//ajax.googleapis.com/ajax/libs/dojo/1.10.4/dojo/dojo.js" data-dojo-config="async: true"></script>
		<!-- <script>
			dojo.require("dijit.layout.BorderContainer");
			dojo.require("dijit.layout.ContentPane");
		</script>-->
		<script>
			require([
				"dojo/parser",
			  "basemaps/js/initApp",
			  "dojo/domReady!"
			], function(parser, initApp){
				parser.parse();
				var init = new initApp();
			});
		</script>
		<!-- Google Analitics
		<script>
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
			
			ga('create', 'UA-21192004-1', 'auto');
			ga('send', 'pageview');
		</script>-->

	</head>
	<body class="claro">
		<div id="screenCover"></div>
		<div id="startupBox"></div>
		<div id="mainWindow"></div>
		<div id="map"></div>
		<!-- <div id="mainWindow" data-dojo-type="dijit.layout.BorderContainer" data-dojo-props="design:'headline', gutters:false">
			<div id="header" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'top'">
				<a id="logocontainer" href="http://helcom.fi" target="_blank"></a>
				<a id="titlecontainer" href=".">Baltic LINes</a>
				<div id="linkscontainer">
					<a class="headerLink" id="logoutLink" href="#">Logout</a>
					<a class="headerLink" id="adminLink" href="#">Admin</a>
					<a class="headerLink" id="mapLink" href="#">Map</a>
					<a class="headerLink" id="aboutLink" href="http://vasab.org/index.php/projects/baltic-lines" target="_blank">About</a>
				</div>
			</div>
			<div id="centerContainer" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'center'">
				<div id="map" data-dojo-type="dijit.layout.ContentPane"></div>
				<div id="layerlistContainer" data-dojo-type="dijit.layout.ContentPane"></div>
				<div id="adminWindow" data-dojo-type="dijit.layout.BorderContainer" data-dojo-props="design:'sidebar', gutters:true, liveSplitters:true">
					
				</div>
				
			</div>
			<div id="adminLayerListContainer" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="splitter:true, region:'leading'"></div>
			<div id="adminFormsContainer" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="splitter:true, region:'center'"></div>
		</div>-->
	</body>
</html>
