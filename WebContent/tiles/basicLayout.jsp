<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="s" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
	<title><tiles:getAsString name="title" /></title>
	
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<tiles:insertAttribute name="meta.description" ignore="true" />
	
	<link href="/style/main.css" rel="stylesheet" type="text/css" charset="UTF-8" />
	
	<tiles:insertAttribute name="links" ignore="true" />
	
	<tiles:insertAttribute name="scripts" ignore="true" />
	
</head>
<body>
	
	<div id="header">
		<a href="/" title="Helcom" id="logo">
			<img src="http://www.helcom.fi/Style%20Library/HelcomWeb/site_logo.jpg" alt="Helcom" /></a>
	</div>
	
	<div id="main_block">
		<div id="main_cont">
			
			<tiles:insertAttribute name="content" />
			
		</div>
	</div>
	
	<tiles:insertAttribute name="bottom" ignore="true" />
	
</body>
</html>
