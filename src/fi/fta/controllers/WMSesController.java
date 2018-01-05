package fi.fta.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.WMS;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.WMSInfoUI;
import fi.fta.beans.ui.WMSUI;
import fi.fta.data.managers.WMSManager;

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
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/info", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<WMSInfoUI> info(
		@RequestBody WMSUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(manager.info(ui));
		}
		catch (Exception ex)
		{
			logger.error("WMSesController.info", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
