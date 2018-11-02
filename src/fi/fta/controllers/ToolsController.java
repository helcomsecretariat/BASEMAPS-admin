package fi.fta.controllers;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.Pair;
import fi.fta.beans.WMS;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.IdentifiableUrlUI;
import fi.fta.beans.ui.UrlFormatUI;
import fi.fta.data.managers.WMSManager;
import fi.fta.utils.ArcGISServer;
import fi.fta.utils.parse.wms.WebMapServer;

@Controller
@RequestMapping("/tools")
public class ToolsController
{
	
	private static Logger logger = Logger.getLogger(ToolsController.class);
	
	@RequestMapping(value = "/get-features", method = {RequestMethod.POST, RequestMethod.GET})
	@ResponseBody
	public SimpleResult<Object> getFeatures(
		@RequestBody IdentifiableUrlUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			WMS wms = WMSManager.getInstance().get(ui.getId());
			Pair<Object, String> p = WebMapServer.readFeatureInfo(
				ui.getUrl(), wms != null ? wms.getInfo().getFormats() : null);
			return SimpleResult.newSuccess(p != null ? p.getFirst() : null);
		}
		catch (Exception ex)
		{
			logger.error("ToolsController.getFeatures", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/get-data", method = {RequestMethod.POST, RequestMethod.GET})
	@ResponseBody
	public SimpleResult<Object> getData(
		@RequestBody UrlFormatUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			Pair<Object, String> p = ArcGISServer.getInfo(ui.getUrl(), ui.getFormat());
			return SimpleResult.newSuccess(p != null ? p.getFirst() : null);
		}
		catch (Exception ex)
		{
			logger.error("ToolsController.getData", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
}
