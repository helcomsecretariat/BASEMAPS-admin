<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="s" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
<head>
	<title><tiles:getAsString name="title" /></title>
	
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<tiles:insertAttribute name="meta.description" ignore="true" />
	
	<link href="https://laikrastis.vz.lt/mprasa_main.css" type="text/css" media="all" rel="stylesheet" />
	<link href="https://laikrastis.vz.lt/mprasa_archive.css" type="text/css" media="all" rel="stylesheet" />
	<link href="https://laikrastis.vz.lt/styles_pdf.css" type="text/css" media="all" rel="stylesheet" />
	<!--link href="https://www.vz.lt/App_Themes/Internal/style.css" type="text/css" media="all" rel="stylesheet" /-->
	<link href="/vzmailer/style/main.css" rel="stylesheet" type="text/css" charset="UTF-8" />
	
	<tiles:insertAttribute name="links" ignore="true" />
	
	<script type="text/javascript" src="https://laikrastis.vz.lt/js/site.js" language="javascript"></script>
	
	<script type="text/javascript" src="/js/jquery/jquery.js"></script>
	<script type="text/javascript" src="/js/jquery/jquery.scrollTo.js"></script>
	<script type="text/javascript" src="/js/jquery/jquery.ui.effects.js"></script>
	<script type="text/javascript" src="/js/jquery/jquery.ui.draggable.js"></script>
	
	<tiles:insertAttribute name="scripts" ignore="true" />
	
</head>
<body>
	
	<div id="header">
		<a href="/vzmailer/view/mails.do" title="Verslo žinios" id="logo">
			<img src="https://laikrastis.vz.lt/gfx/logo.png" alt="Verslo žinios" /></a>
	</div>
	
	<div id="main_block">
		<div id="main_cont">
			
			<tiles:insertAttribute name="content" />
			
		</div>
	</div>
	
	<tiles:insertAttribute name="bottom" ignore="true" />
	
</body>
</html>
