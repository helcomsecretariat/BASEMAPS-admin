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
import fi.fta.beans.ui.CategoryUI;
import fi.fta.data.dao.CategoryBeanDAO;
import fi.fta.data.managers.CategoryBeanManager;
import fi.fta.utils.Util;
import fi.fta.validation.ClassStructureAssessor;
import fi.fta.validation.ValidationMessage;

public class CategoryBeansController<
	C extends CategoryBean, CUI extends CategoryUI, CM extends CategoryBeanManager<C, CUI, ? extends CategoryBeanDAO<C>>>
{
	
	protected static Logger logger = Logger.getLogger(CategoryBeansController.class);
	
	
	protected CM manager;
	
	public CategoryBeansController(CM manager)
	{
		this.manager = manager;
	}
	
	@RequestMapping(value = "/get/{id}", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<CUI> add(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(manager.getUI(id));
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".get(" + id + ")", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, Util.getStackTrace(ex));
		}
	}
	
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
			return SimpleResult.newSuccess(manager.add(ui));
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".add", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, Util.getStackTrace(ex));
		}
	}
	
	@RequestMapping(value = "/position/{id}/{position}", method = RequestMethod.POST)
	@ResponseBody
	public SimpleMessage position(
		@PathVariable("id") Long id, @PathVariable("position") Integer position, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			if (id != null)
			{
				manager.position(id, position);
			}
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".position", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
	@ResponseBody
	public SimpleMessage delete(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			manager.delete(id);
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".delete", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	

	@RequestMapping(value = "/children/{id}", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<C>> getChildren(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(manager.getChildren(id));
		}
		catch (Exception ex)
		{
			logger.error(this.getClass().getName() + ".getChildren", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
