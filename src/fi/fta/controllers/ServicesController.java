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

/**
 * Controller for operations on different services. A super class for controllers of specific service.
 * <p>
 * Usually operation is restricted to the rights of currently logged user.
 * 
 * @author andrysta
 *
 * @param <S> wrapper for database data
 * @param <SM> data manager
 */
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
	
	/**
	 * Service verification method, requires service name and/or URL.
	 * 
	 * @param ui service object wrapper, but only name and/or URL input required for this operation
	 * @param request http request
	 * @param response http response
	 * @return list of available layers and organization (service owner) name
	 */
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
	
	/**
	 * Extracts information from the remote valid service taking service name and URL.
	 * The service is not added to BASEMAPS database yet.
	 * 
	 * @param ui service object wrapper, but only name and/or URL input required for this operation 
	 * @param request http request
	 * @param response http response
	 * @param <SUI> JSON wrapper object
	 * @return wrapper for service object
	 */
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
	
	/**
	 * Schedules update of service from remote source. The service must be already in a database.
	 * 
	 * @param id database ID of service to be updated
	 * @param request http request
	 * @param response http response
	 * @return success or error message, however this does not tell if service was successfully updated (or was scheduled for update at all), because the action is deferred
	 */
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
