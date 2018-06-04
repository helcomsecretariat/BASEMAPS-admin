<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="s" %>
<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
		<title><tiles:getAsString name="title" /></title>
		<tiles:insertAttribute name="meta.description" ignore="true" />
		<link href='//fonts.googleapis.com/css?family=Istok Web' rel='stylesheet'>
		<tiles:insertAttribute name="links" ignore="true" />
		<tiles:insertAttribute name="scripts" ignore="true" />
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
		<tiles:insertAttribute name="content" />
		<tiles:insertAttribute name="bottom" ignore="true" />
	</body>
</html>
