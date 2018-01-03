package fi.fta.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import fi.fta.beans.Category;
import fi.fta.beans.response.ResponseMessage;
import fi.fta.beans.response.SimpleMessage;
import fi.fta.beans.response.SimpleResult;
import fi.fta.beans.ui.CategoryUI;
import fi.fta.data.managers.CategoryManager;
import fi.fta.validation.ClassStructureAssessor;
import fi.fta.validation.ValidationMessage;

@Controller
@RequestMapping("/categories")
public class CategoriesController
{
	
	private static Logger logger = Logger.getLogger(CategoriesController.class);
	
	@RequestMapping(value = "/root", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<Category>> getRoot(HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(CategoryManager.getInstance().getRoot());
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getRoot", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/children/{id}", method = RequestMethod.GET)
	@ResponseBody
	public SimpleResult<List<Category>> getChildren(
		@PathVariable("id") Long id, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			return SimpleResult.newSuccess(CategoryManager.getInstance().getChildren(id));
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.getChildren", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public SimpleResult<Long> add(
		@RequestBody CategoryUI ui, HttpServletRequest request, HttpServletResponse response)
	{
		try
		{
			List<ValidationMessage> validations = ClassStructureAssessor.getInstance().validate(ui);
			if (!validations.isEmpty())
			{
				return SimpleResult.newFailure(
					ResponseMessage.Code.ERROR_VALIDATION, "Invalid category", validations);
			}
			return SimpleResult.newSuccess(CategoryManager.getInstance().add(ui));
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.add", ex);
			return SimpleResult.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
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
				CategoryManager.getInstance().position(id, position);
			}
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.position", ex);
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
			CategoryManager.getInstance().delete(id);
			return SimpleMessage.newSuccess();
		}
		catch (Exception ex)
		{
			logger.error("CategoriesController.delete", ex);
			return SimpleMessage.newFailure(ResponseMessage.Code.ERROR_GENERAL, ex.getMessage());
		}
	}
	
}
