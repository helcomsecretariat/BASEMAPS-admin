package fi.fta.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.CategoryBean;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.CategoryBeanUI;
import fi.fta.data.dao.CategoryBeanDAO;
import fi.fta.data.managers.CategoryBeanManager;
import fi.fta.model.SiteModel;
import fi.fta.utils.Util;
import fi.fta.validation.ClassStructureAssessor;
import fi.fta.validation.ValidationMessage;


/**
 * Controller for categories and services common operations.
 * <p>
 * Usually operation is restricted to the rights of currently logged user.
 * 
 * @author andrysta
 *
 * @param <C> wrapper for database data
 * @param <CUI> wrapper for JSON data
 * @param <CM> data manager
 */

public class CategoryBeansController<
	C extends CategoryBean, CUI extends CategoryBeanUI,
	CM extends CategoryBeanManager<C, CUI, ? extends CategoryBeanDAO<C>>>
{
	
	protected static Logger logger = Logger.getLogger(CategoryBeansController.class);
	
	/**
	 * Data manager for business logic actions
	 */
	protected CM manager;
	
	public CategoryBeansController(CM manager)
	{
		this.manager = manager;
	}
	
	/**
	 * Retrieves wrapper object by ID to front-end if the user has rights.
	 * 
	 * @param id Identification of object
	 * @param request http request
	 * @param response http response
	 * @return Wrapper of category related bean
	 */
	@RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<CUI> get(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			CUI ret = manager.getUI(id, SiteModel.get(request));
			if (ret == null)
			{
				return SimpleResult.noRightsFailure();
			}
			return SimpleResult.newSuccess(ret);
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".get(" + id + ")", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, Util.getStackTrace(ex));
		}
	}
	
	/**
	 * Add new category related object from front-end (user input) if the user has rights.
	 * 
	 * @param ui Wrapper of category related bean
	 * @param request http request
	 * @param response http response
	 * @return Database ID of newly added object
	 */
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<Long> add(
		@RequestBody CUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			List<ValidationMessage> validations = ClassStructureAssessor.getInstance().validate(ui);
			if (!validations.isEmpty())
			{
				return SimpleResult.newFailure(
					ResponseMessage.Code.ERROR_VALIDATION, "Invalid " + ui.getClass().getName(), validations);
			}
			Long ret = manager.add(ui, SiteModel.get(request));
			if (ret == null)
			{
				return SimpleResult.noRightsFailure();
			}
			return SimpleResult.newSuccess(ret);
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".add", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, Util.getStackTrace(ex));
		}
	}
	
	/**
	 * Updates category related object from user input if the user has rights.
	 * 
	 * @param ui Wrapper of category related bean
	 * @param request http request
	 * @param response http response
	 * @return success or error message
	 */
	@RequestMapping(value = "/update", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage update(
		@RequestBody CUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			List<ValidationMessage> validations = ClassStructureAssessor.getInstance().validate(ui);
			if (!validations.isEmpty())
			{
				return SimpleMessage.newFailure(
					ResponseMessage.Code.ERROR_VALIDATION, "Invalid " + ui.getClass().getName(), validations);
			}
			if (manager.update(ui, SiteModel.get(request)) == null)
			{
				return SimpleMessage.noRightsFailure();
			}
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".update", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, Util.getStackTrace(ex));
		}
	}
	
	/**
	 * Changes queue position of identified category related object in a parent category if the user has rights.
	 * 
	 * @param id database ID of category related object, which position is changing
	 * @param position a new position in parent category
	 * @param request http request
	 * @param response http response
	 * @return success or error message
	 */
	@RequestMapping(value = "/position/{id}/{position}", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage position(
		@PathVariable("id") Long id, @PathVariable("position") Integer position, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (id == null || manager.position(id, position, SiteModel.get(request)) != null)
			{
				return SimpleMessage.newSuccess();
			}
			return SimpleMessage.noRightsFailure();
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".position", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Erase category related object from the database by ID if the user has rights.
	 * 
	 * @param id database ID of category related object
	 * @param request http request
	 * @param response http response
	 * @return success or error message
	 */
	@RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
	@ResponseBody
	public SimpleMessage delete(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (manager.delete(id, SiteModel.get(request)) != null)
			{
				return SimpleMessage.newSuccess();
			}
			return SimpleMessage.noRightsFailure();
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".delete", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Retrieves the list of all children in identified category related object if the user has rights.
	 * 
	 * @param id database ID of category related object
	 * @param request http request
	 * @param response http response
	 * @return a list of children in respective category wrapped in database wrappers
	 */
	@RequestMapping(value = "/children/{id}", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<C>> getChildren(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (SiteModel.get(request).canRead(id))
			{
				return SimpleResult.newSuccess(manager.getChildren(id));
			}
			return SimpleResult.noRightsFailure();
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".getChildren", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	/**
	 * Retrieves the list of all database IDs if the user has rights (is ADMIN).
	 * 
	 * @param request http request
	 * @param response http response
	 * @return a list of IDs
	 */
	@RequestMapping(value = "/all-ids", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<Long>> getAllIds(
		HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (SiteModel.get(request).canRead(null))
			{
				return SimpleResult.newSuccess(manager.getAllIds());
			}
			return SimpleResult.noRightsFailure();
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".getAllIds", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
