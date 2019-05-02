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
import fi.fta.beans.response.SimpleMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.IdentifiableUrlUI;
import fi.fta.beans.ui.UrlFormatUI;
import fi.fta.data.managers.CategoryBeanActionManager;
import fi.fta.data.managers.CategoryManager;
import fi.fta.data.managers.PasswordResetTokenManager;
import fi.fta.data.managers.TranslateManager;
import fi.fta.data.managers.WMSManager;
import fi.fta.utils.ArcGISServer;
import fi.fta.utils.parse.wms.WebMapServer;

/**
 * Controller for different data transformations or data enhancements
 * 
 * @author andrysta
 *
 */
@Controller
@RequestMapping("/tools")
public class ToolsController
{
	
	private static Logger logger = Logger.getLogger(ToolsController.class);
	
	/**
	 * Retrieves features of remote WMS taking ID of WMS already in a database and URL constructed in the fron-end.
	 * The response depends which available format does the linked WMS have written to database, usually it is XML.
	 * 
	 * @param ui ID and URL input
	 * @param request http request
	 * @param response http response
	 * @return wrapper of object where structure depends of available WMS format
	 */
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
	
	/**
	 * Retrieves some JSON or XML structured data from ArcGIS server.
	 * 
	 * @param ui URL of available ArcGIS service
	 * @param request http request
	 * @param response http response
	 * @return wrapped object data from a remote server
	 */
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
	
	/**
	 * Clears application cache in managers:
	 * 		CategoryManager
	 * 		TranslateManager
	 * 		PasswordResetTokenManager
	 * 
	 * @param request http request
	 * @param response http response
	 * @return simple success or error message
	 */
	@RequestMapping(value = "/clear-cache", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage clearCache(HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			CategoryManager.getInstance().clear();
			CategoryBeanActionManager.getInstance().clear();
			TranslateManager.getInstance().clearCache();
			PasswordResetTokenManager.getInstance().clear();
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error("ToolsController.clearCache", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
