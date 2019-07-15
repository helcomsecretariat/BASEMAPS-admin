<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>

<tiles:insertDefinition name="BasicTile">
	<tiles:putAttribute name="title">BASEMAPS</tiles:putAttribute>
	<tiles:putAttribute name="links">
		<link rel="shortcut icon" href="http://helcom.fi/Style%20Library/HelcomWeb/favicon.ico?rev=23" type="image/vnd.microsoft.icon" id="favicon" />
		<link rel="stylesheet" href="1.0/css/ol.css" type="text/css">
		<link rel="stylesheet" type="text/css" href="https://ajax.googleapis.com/ajax/libs/dojo/1.10.4/dijit/themes/claro/claro.css">
		<link rel="stylesheet" type="text/css" href="1.0/css/basemaps.css">
	</tiles:putAttribute>
	<tiles:putAttribute name="scripts">
		<script src="1.0/js/arcgis-to-geojson.js" type="text/javascript"></script>
		<script src="1.0/js/ol.js" type="text/javascript"></script>
		<script src="1.0/js/ol-ext.js" type="text/javascript"></script>
		<script src="1.0/js/jszip.min.js" type="text/javascript"></script>
		
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
	</tiles:putAttribute>
	<tiles:putAttribute name="content">
		<div id="screenCover"></div>
		<div id="loadingCover"></div>
		<div id="startupBox"></div>
		<div id="mainWindow"></div>
		<div id="map"></div>
		<!-- <div id="mainWindow" data-dojo-type="dijit.layout.BorderContainer" data-dojo-props="design:'headline', gutters:false">
			<div id="header" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'top'">
				<div id="logocontainer"></div>
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
	</tiles:putAttribute>
</tiles:insertDefinition>
