package fi.fta.controllers;

import java.io.Serializable;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.LayerService;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.LayerServiceUI;
import fi.fta.beans.ui.VerifyUI;
import fi.fta.data.dao.LayerServiceDAO;
import fi.fta.data.managers.ServiceManager;
import fi.fta.utils.Util;

public class ServicesController<
	S extends LayerService,
	SM extends ServiceManager<S, ? extends LayerServiceDAO<S>>>
	extends CategoryBeansController<S, LayerServiceUI, SM>
{
	
	public ServicesController(SM manager)
	{
		super(manager);
	}
	
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<Long> add(
		@RequestBody LayerServiceUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		return super.add(ui, request, response);
	}
	
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage update(
		@RequestBody LayerServiceUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		return super.update(ui, request, response);
	}
	
	@RequestMapping(value = "/verify", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<VerifyUI> verify(
		@RequestBody LayerServiceUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(manager.verify(ui));
		}
		catch (Exception ex)
		{
			logger.error("ServicesController.verify", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, Util.getStackTrace(ex));
		}
	}
	
	@RequestMapping(value = "/info", method = RequestMethod.POST)
	@ResponseBody
	public <SUI extends Serializable> SimpleResult<SUI> info(
		@RequestBody LayerServiceUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(manager.info(ui));
		}
		catch (Exception ex)
		{
			logger.error("ServicesController.info", ex);
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
			logger.error("ServicesController.updateInfo(" + id + ")", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}