package fi.fta.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.WMS;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.WMSLayerUI;
import fi.fta.beans.ui.WMSUI;
import fi.fta.data.managers.WMSManager;
import fi.fta.utils.Util;

@Controller
@RequestMapping("/wms")
public class WMSesController extends CategoryBeansController<WMS, WMSUI, WMSManager>
{
	
	public WMSesController()
	{
		super(WMSManager.getInstance());
	}
	
	@RequestMapping(value = "/verify", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<List<String>> verify(
		@RequestBody WMSUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(manager.verify(ui));
		}
		catch (Exception ex)
		{
			logger.error("WMSesController.verify", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, Util.getStackTrace(ex));
		}
	}
	
	@RequestMapping(value = "/info", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<WMSLayerUI> info(
		@RequestBody WMSUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(manager.info(ui));
		}
		catch (Exception ex)
		{
			logger.error("WMSesController.info", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, Util.getStackTrace(ex));
		}
	}
	
	@RequestMapping(value = "/update-info/{id}", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage updateInfo(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			manager.scheduleUpdateInfo(id);
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error("WMSesController.updateInfo(" + id + ")", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
